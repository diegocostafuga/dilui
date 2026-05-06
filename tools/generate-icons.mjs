// ============================================
// Gerador de ícones PWA – pure Node, zero deps.
//
// Renderiza uma gota d'água (logo do Diluí) em PNG RGBA com
// supersampling 4x para suavizar bordas. Rode com:
//
//   node tools/generate-icons.mjs
//
// Saídas:
//   icons/icon-192.png            – fundo arredondado (purpose: any)
//   icons/icon-512.png            – idem, 512px
//   icons/icon-maskable-512.png   – sem cantos, gota menor (safe zone)
//
// Geometria da gota: teardrop clássico — peak point + duas linhas
// tangentes ao círculo. Como as linhas tocam o círculo na tangente,
// não existe canto/kink na junção (diferente de "círculo + triângulo
// na diagonal", que sempre deixa uma quina visível).
// ============================================

import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

// --- Cores (alinhadas com --teal-* do styles.css) ---
const TEAL_50 = [0xf0, 0xfd, 0xfa];
const TEAL_400 = [0x2d, 0xd4, 0xbf];
const TEAL_600 = [0x0d, 0x94, 0x88];
const TEAL_700 = [0x0f, 0x76, 0x6e];
const WHITE = [0xff, 0xff, 0xff];

// --- PNG encoder mínimo ---
const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        t[n] = c;
    }
    return t;
})();

function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, pixels) {
    const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr.writeUInt8(8, 8);
    ihdr.writeUInt8(6, 9);   // RGBA
    ihdr.writeUInt8(0, 10);
    ihdr.writeUInt8(0, 11);
    ihdr.writeUInt8(0, 12);

    const stride = width * 4;
    const raw = Buffer.alloc(height * (1 + stride));
    for (let y = 0; y < height; y++) {
        raw[y * (1 + stride)] = 0;
        pixels.copy(raw, y * (1 + stride) + 1, y * stride, (y + 1) * stride);
    }
    const compressed = deflateSync(raw, { level: 9 });

    return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

// --- Helpers ---
function lerp(a, b, t) { return a + (b - a) * t; }
function lerpColor(c1, c2, t) {
    return [
        Math.round(lerp(c1[0], c2[0], t)),
        Math.round(lerp(c1[1], c2[1], t)),
        Math.round(lerp(c1[2], c2[2], t))
    ];
}
function blendOver(base, top, alpha) {
    return [
        Math.round(base[0] * (1 - alpha) + top[0] * alpha),
        Math.round(base[1] * (1 - alpha) + top[1] * alpha),
        Math.round(base[2] * (1 - alpha) + top[2] * alpha)
    ];
}

// --- Renderiza um ícone ---
// opts: { rounded, safeArea }
function renderizar(size, opts = {}) {
    const { rounded = true, safeArea = 1.0 } = opts;
    const ss = 4;
    const W = size * ss;
    const H = size * ss;
    const pix = Buffer.alloc(W * H * 4);

    // --- Geometria do fundo arredondado ---
    const bgPad = rounded ? size * 0.025 * ss : 0;
    const cornerR = rounded ? size * 0.22 * ss : 0;
    const bgX0 = bgPad, bgY0 = bgPad;
    const bgX1 = W - bgPad, bgY1 = H - bgPad;

    function dentroFundo(x, y) {
        if (!rounded) return true;
        if (x < bgX0 || x >= bgX1 || y < bgY0 || y >= bgY1) return false;
        const insetX = x < bgX0 + cornerR ? bgX0 + cornerR
                     : x >= bgX1 - cornerR ? bgX1 - cornerR : null;
        const insetY = y < bgY0 + cornerR ? bgY0 + cornerR
                     : y >= bgY1 - cornerR ? bgY1 - cornerR : null;
        if (insetX === null || insetY === null) return true;
        const dx = x - insetX, dy = y - insetY;
        return dx * dx + dy * dy <= cornerR * cornerR;
    }

    // --- Geometria da gota ---
    const cx = W / 2;
    const cy = H * 0.58;
    const R = (size * 0.28 * safeArea) * ss;
    const peakDist = R * 2.0; // peak fica 2R acima do centro do círculo
    const peakY = cy - peakDist;
    const tangentB = (R * R) / peakDist;     // offset acima do centro onde a tangente toca
    const tangentY = cy - tangentB;
    const tangentSqrt = Math.sqrt(peakDist * peakDist - R * R);

    function dentroGota(x, y) {
        if (y < peakY || y > cy + R) return false;
        if (y > tangentY) {
            // Região do círculo (parte de baixo e laterais)
            const dx = x - cx, dy = y - cy;
            return dx * dx + dy * dy <= R * R;
        }
        // Região acima da tangente: triângulo com lados tangentes ao círculo
        const halfWidth = R * (y - peakY) / tangentSqrt;
        return Math.abs(x - cx) <= halfWidth;
    }

    // --- Reflexo 1: arco em C no quadrante inferior-esquerdo da gota ---
    // (mimetiza M28 46 C28 53.7 33.4 60 40 60 da SVG original)
    function dentroArcoReflexo(x, y) {
        const rx = (x - cx) / R;
        const ry = (y - cy) / R;
        const arcRx = 0.50, arcRy = 0.50;
        const dx = rx / arcRx, dy = ry / arcRy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const strokeHalf = 0.07; // ~3.5% do R
        if (Math.abs(dist - 1) > strokeHalf) return false;
        // Restringe ao quadrante inferior-esquerdo
        const angle = Math.atan2(ry, rx); // y cresce p/ baixo
        return angle > Math.PI * 0.55 && angle < Math.PI * 0.98;
    }

    // --- Reflexo 2: ponto pequeno no canto superior-direito da gota ---
    // (mimetiza circle cx=48 cy=36 r=3 da SVG original)
    function dentroPontoReflexo(x, y) {
        const dotCx = cx + R * 0.40;
        const dotCy = cy - R * 0.50;
        const dotR = R * 0.10;
        const dx = x - dotCx, dy = y - dotCy;
        return dx * dx + dy * dy <= dotR * dotR;
    }

    // --- Render ---
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const idx = (y * W + x) * 4;

            if (!dentroFundo(x, y)) {
                pix[idx] = pix[idx + 1] = pix[idx + 2] = 0;
                pix[idx + 3] = 0; // transparente fora do fundo arredondado
                continue;
            }

            // Fundo: gradiente sutil teal-50 → branco (vai do canto sup-esq pro inf-dir)
            const tBg = (x + y) / (W + H);
            const bgColor = lerpColor(TEAL_50, WHITE, tBg * 0.7);

            let cor;
            if (dentroGota(x, y)) {
                // Gota: gradiente teal-400 → teal-700 (de cima pra baixo)
                const tDrop = (y - peakY) / (cy + R - peakY);
                cor = lerpColor(TEAL_400, TEAL_700, Math.min(1, Math.max(0, tDrop)));

                // Reflexos por cima da gota
                if (dentroArcoReflexo(x, y)) {
                    cor = blendOver(cor, WHITE, 0.55);
                } else if (dentroPontoReflexo(x, y)) {
                    cor = blendOver(cor, WHITE, 0.7);
                }
            } else {
                cor = bgColor;
            }

            pix[idx] = cor[0];
            pix[idx + 1] = cor[1];
            pix[idx + 2] = cor[2];
            pix[idx + 3] = 255;
        }
    }

    // --- Downsample box filter (preserva alpha) ---
    const out = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            for (let dy = 0; dy < ss; dy++) {
                for (let dx = 0; dx < ss; dx++) {
                    const sIdx = ((y * ss + dy) * W + (x * ss + dx)) * 4;
                    r += pix[sIdx]; g += pix[sIdx + 1]; b += pix[sIdx + 2]; a += pix[sIdx + 3];
                }
            }
            const div = ss * ss;
            const oIdx = (y * size + x) * 4;
            out[oIdx] = Math.round(r / div);
            out[oIdx + 1] = Math.round(g / div);
            out[oIdx + 2] = Math.round(b / div);
            out[oIdx + 3] = Math.round(a / div);
        }
    }

    return encodePng(size, size, out);
}

// --- Geração ---
const outDir = new URL('../icons/', import.meta.url);

writeFileSync(new URL('icon-192.png', outDir), renderizar(192, { rounded: true }));
writeFileSync(new URL('icon-512.png', outDir), renderizar(512, { rounded: true }));
// Maskable: sem cantos arredondados (OS recorta), gota menor pra caber no safe zone
writeFileSync(new URL('icon-maskable-512.png', outDir), renderizar(512, { rounded: false, safeArea: 0.78 }));

console.log('✔ Ícones gerados em icons/');
