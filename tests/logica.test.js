import { describe, it, expect } from 'vitest';
import {
    calcular,
    converterQuantidade,
    verificarIncompatibilidades,
    temPerigoAtivo,
    _maiorSeveridade,
    formatarNumero,
    obterNomeProduto,
} from '../logica.js';

// ============================================
// converterQuantidade
// ============================================

describe('converterQuantidade', () => {
    it('retorna o mesmo valor quando unidades são iguais', () => {
        expect(converterQuantidade(500, 'mL', 'mL')).toBe(500);
        expect(converterQuantidade(2, 'L', 'L')).toBe(2);
    });

    it('converte mL para L', () => {
        expect(converterQuantidade(1000, 'mL', 'L')).toBe(1);
        expect(converterQuantidade(500, 'mL', 'L')).toBe(0.5);
    });

    it('converte L para mL', () => {
        expect(converterQuantidade(1, 'L', 'mL')).toBe(1000);
        expect(converterQuantidade(0.5, 'L', 'mL')).toBe(500);
    });

    it('converte g para kg', () => {
        expect(converterQuantidade(1000, 'g', 'kg')).toBe(1);
    });

    it('converte kg para g', () => {
        expect(converterQuantidade(1, 'kg', 'g')).toBe(1000);
    });
});

// ============================================
// calcular
// ============================================

describe('calcular', () => {
    const produtoLiquido = (id) => ({
        produtoSelecionado: id,
        unidade: 'mL',
    });

    it('proporção 1/1 divide o volume igualmente', () => {
        const produtos = [produtoLiquido('agua'), produtoLiquido('detergente')];
        const resultado = calcular(produtos, [1, 1], 1000, 'mL');

        expect(resultado[0].quantidade).toBe(500);
        expect(resultado[1].quantidade).toBe(500);
        expect(resultado[0].porcentagem).toBe(50);
    });

    it('proporção 1/9 resulta em 10% e 90%', () => {
        const produtos = [produtoLiquido('detergente'), produtoLiquido('agua')];
        const resultado = calcular(produtos, [1, 9], 1000, 'mL');

        expect(resultado[0].quantidade).toBeCloseTo(100);
        expect(resultado[1].quantidade).toBeCloseTo(900);
        expect(resultado[0].porcentagem).toBeCloseTo(10);
        expect(resultado[1].porcentagem).toBeCloseTo(90);
    });

    it('converte unidade do limite para a unidade do produto', () => {
        const produtos = [
            { produtoSelecionado: 'agua', unidade: 'L' },
            { produtoSelecionado: 'detergente', unidade: 'mL' },
        ];
        const resultado = calcular(produtos, [1, 1], 2000, 'mL');

        expect(resultado[0].quantidade).toBe(1);       // 1000 mL → 1 L
        expect(resultado[1].quantidade).toBe(1000);    // 1000 mL
    });

    it('três produtos com proporção 1/2/7', () => {
        const produtos = [
            produtoLiquido('desinfetante'),
            produtoLiquido('agua_sanitaria'),
            produtoLiquido('agua'),
        ];
        const resultado = calcular(produtos, [1, 2, 7], 1000, 'mL');

        expect(resultado[0].quantidade).toBeCloseTo(100);
        expect(resultado[1].quantidade).toBeCloseTo(200);
        expect(resultado[2].quantidade).toBeCloseTo(700);
    });

    it('retorna o nome correto de produto pré-cadastrado', () => {
        const produtos = [produtoLiquido('vinagre'), produtoLiquido('agua')];
        const resultado = calcular(produtos, [1, 1], 100, 'mL');

        expect(resultado[0].nome).toBe('Vinagre');
        expect(resultado[1].nome).toBe('Água');
    });
});

// ============================================
// obterNomeProduto
// ============================================

describe('obterNomeProduto', () => {
    it('retorna o nome do catálogo para produto pré-cadastrado', () => {
        expect(obterNomeProduto({ produtoSelecionado: 'detergente' })).toBe('Detergente');
        expect(obterNomeProduto({ produtoSelecionado: 'vinagre' })).toBe('Vinagre');
    });

    it('retorna o nome personalizado quando produto é "outro"', () => {
        expect(obterNomeProduto({
            produtoSelecionado: 'outro',
            nomePersonalizado: 'Removedor XYZ',
        })).toBe('Removedor XYZ');
    });

    it('retorna "Produto sem nome" quando "outro" sem nome preenchido', () => {
        expect(obterNomeProduto({ produtoSelecionado: 'outro', nomePersonalizado: '' }))
            .toBe('Produto sem nome');
        expect(obterNomeProduto({ produtoSelecionado: 'outro' }))
            .toBe('Produto sem nome');
    });

    it('retorna "Produto" para id desconhecido', () => {
        expect(obterNomeProduto({ produtoSelecionado: 'id_inexistente' })).toBe('Produto');
    });
});

// ============================================
// verificarIncompatibilidades
// ============================================

describe('verificarIncompatibilidades', () => {
    const p = (id) => ({ produtoSelecionado: id });

    it('não retorna avisos quando não há incompatibilidade', () => {
        const avisos = verificarIncompatibilidades([p('agua'), p('detergente')]);
        // detergente + agua não é um par cadastrado
        // mas agua_sanitaria + detergente é — confirmar ausência de falso positivo
        expect(avisos.every(a => !['agua'].includes(a.a) || !['detergente'].includes(a.b))).toBe(true);
    });

    it('detecta par agua_sanitaria + vinagre (perigo)', () => {
        const avisos = verificarIncompatibilidades([p('agua_sanitaria'), p('vinagre')]);
        expect(avisos.length).toBeGreaterThan(0);
        expect(avisos[0].severidade).toBe('perigo');
    });

    it('detecta par amonia + agua_sanitaria (perigo)', () => {
        const avisos = verificarIncompatibilidades([p('amonia'), p('agua_sanitaria'), p('agua')]);
        const encontrado = avisos.find(
            a => (a.a === 'amonia' && a.b === 'agua_sanitaria') ||
                 (a.a === 'agua_sanitaria' && a.b === 'amonia')
        );
        expect(encontrado).toBeDefined();
    });

    it('detecta par vinagre + bicarbonato (ineficaz)', () => {
        const avisos = verificarIncompatibilidades([p('vinagre'), p('bicarbonato')]);
        expect(avisos.length).toBeGreaterThan(0);
        expect(avisos[0].severidade).toBe('ineficaz');
    });

    it('retorna array vazio quando nenhum par é incompatível', () => {
        const avisos = verificarIncompatibilidades([p('agua'), p('aromatizante')]);
        expect(avisos).toHaveLength(0);
    });
});

// ============================================
// temPerigoAtivo / _maiorSeveridade
// ============================================

describe('temPerigoAtivo', () => {
    it('retorna true se houver ao menos um aviso de perigo', () => {
        expect(temPerigoAtivo([{ severidade: 'perigo' }])).toBe(true);
        expect(temPerigoAtivo([{ severidade: 'cuidado' }, { severidade: 'perigo' }])).toBe(true);
    });

    it('retorna false quando não há perigo', () => {
        expect(temPerigoAtivo([{ severidade: 'cuidado' }])).toBe(false);
        expect(temPerigoAtivo([{ severidade: 'ineficaz' }])).toBe(false);
        expect(temPerigoAtivo([])).toBe(false);
    });
});

describe('_maiorSeveridade', () => {
    it('perigo tem prioridade máxima', () => {
        expect(_maiorSeveridade([{ severidade: 'perigo' }, { severidade: 'ineficaz' }])).toBe('perigo');
    });

    it('cuidado tem prioridade intermediária', () => {
        expect(_maiorSeveridade([{ severidade: 'cuidado' }, { severidade: 'ineficaz' }])).toBe('cuidado');
    });

    it('retorna ineficaz quando é o único nível', () => {
        expect(_maiorSeveridade([{ severidade: 'ineficaz' }])).toBe('ineficaz');
    });
});

// ============================================
// formatarNumero
// ============================================

describe('formatarNumero', () => {
    it('valores >= 100 sem casas decimais', () => {
        expect(formatarNumero(100)).toBe('100');
        expect(formatarNumero(250.9)).toBe('251');
    });

    it('valores >= 10 com 1 casa decimal', () => {
        expect(formatarNumero(10)).toBe('10.0');
        expect(formatarNumero(99.99)).toBe('100.0');
    });

    it('valores >= 1 com 2 casas decimais', () => {
        expect(formatarNumero(1)).toBe('1.00');
        expect(formatarNumero(5.5)).toBe('5.50');
    });

    it('valores < 1 com 3 casas decimais', () => {
        expect(formatarNumero(0.5)).toBe('0.500');
        expect(formatarNumero(0.001)).toBe('0.001');
    });
});
