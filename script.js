/* ============================================
   DILUÍ – Calculadora de Diluição
   Lógica modular com navegação por passos
   ============================================ */

// ============================================
// DADOS / CONFIGURAÇÃO
// ============================================

const PRODUTOS_PRECADASTRADOS = [
    { id: 'agua', nome: 'Água', tipoSugerido: 'liquido' },
    { id: 'multiuso', nome: 'Multiuso', tipoSugerido: 'liquido' },
    { id: 'desinfetante', nome: 'Desinfetante', tipoSugerido: 'liquido' },
    { id: 'agua_sanitaria', nome: 'Água sanitária', tipoSugerido: 'liquido' },
    { id: 'limpa_vidros', nome: 'Limpa vidros', tipoSugerido: 'liquido' },
    { id: 'peroxido', nome: 'Peróxido de hidrogênio', tipoSugerido: 'liquido' },
    { id: 'detergente', nome: 'Detergente', tipoSugerido: 'liquido' },
    { id: 'amaciante', nome: 'Amaciante', tipoSugerido: 'liquido' },
    { id: 'bicarbonato', nome: 'Bicarbonato de sódio', tipoSugerido: 'po' },
    { id: 'sabao_po', nome: 'Sabão em pó', tipoSugerido: 'po' },
    { id: 'soda', nome: 'Soda cáustica', tipoSugerido: 'po' },
    { id: 'outro', nome: 'Outro (digitar)', tipoSugerido: 'liquido' }
];

const UNIDADES = {
    liquido: ['mL', 'L'],
    po: ['g', 'kg']
};

const PROPORCOES_SUGERIDAS = {
    2: ['1/2', '1/3', '1/5', '1/10', '1/20', '1/50', '1/100'],
    3: ['1/1/3', '1/2/5', '1/2/10', '1/3/10'],
    4: ['1/1/2/5', '1/2/3/10', '1/1/1/10'],
    5: ['1/1/1/2/5', '1/2/2/3/10']
};

const TOTAL_PASSOS = 4;

// ============================================
// ESTADO DA APLICAÇÃO
// ============================================

const estado = {
    passoAtual: 0,
    quantidadeProdutos: 2,
    produtos: [],
    proporcao: '',
    proporcaoValida: false,
    limite: { valor: null, unidade: 'mL' }
};

// ============================================
// REFERÊNCIAS DOM
// ============================================

const dom = {
    steps: document.querySelectorAll('.step'),
    progressContainer: document.getElementById('progressContainer'),
    progressLabel: document.getElementById('progressLabel'),
    progressPercent: document.getElementById('progressPercent'),
    progressFillBar: document.getElementById('progressFillBar'),
    pillsCount: document.querySelectorAll('.pill[data-count]'),
    productsList: document.getElementById('productsList'),
    ratioInput: document.getElementById('ratioInput'),
    ratioPresets: document.getElementById('ratioPresets'),
    ratioStatus: document.getElementById('ratioStatus'),
    ratioError: document.getElementById('ratioError'),
    ratioHint: document.getElementById('ratioHint'),
    limitPresets: document.getElementById('limitPresets'),
    limitValue: document.getElementById('limitValue'),
    limitUnit: document.getElementById('limitUnit'),
    btnCalculate: document.getElementById('btnCalculate'),
    resultsList: document.getElementById('resultsList'),
    resultsSummary: document.getElementById('resultsSummary'),
    totalCard: document.getElementById('totalCard')
};

// ============================================
// NAVEGAÇÃO ENTRE PASSOS
// ============================================

function irParaPasso(novoPasso, direcao = 'forward') {
    if (novoPasso < 0 || novoPasso > 5) return;

    const passoAtualEl = document.querySelector(`.step[data-step="${estado.passoAtual}"]`);
    const novoPassoEl = document.querySelector(`.step[data-step="${novoPasso}"]`);

    if (!novoPassoEl) return;

    passoAtualEl.classList.remove('active');
    passoAtualEl.classList.remove('back-direction');

    novoPassoEl.classList.toggle('back-direction', direcao === 'back');

    requestAnimationFrame(() => {
        novoPassoEl.classList.add('active');
    });

    estado.passoAtual = novoPasso;

    if (novoPasso === 0) {
        dom.progressContainer.hidden = true;
    } else {
        dom.progressContainer.hidden = false;
        atualizarBarraProgresso();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
        const primeiroInput = novoPassoEl.querySelector('input, select, .pill, .btn-primary');
        if (primeiroInput && novoPasso !== 5 && novoPasso !== 0) {
            primeiroInput.focus({ preventScroll: true });
        }
    }, 350);
}

function atualizarBarraProgresso() {
    const passoVisivel = Math.min(estado.passoAtual, TOTAL_PASSOS);
    const percentual = (passoVisivel / TOTAL_PASSOS) * 100;

    if (estado.passoAtual === 5) {
        dom.progressFillBar.style.width = '100%';
        dom.progressLabel.textContent = 'Concluído!';
        dom.progressPercent.textContent = '100%';
    } else {
        dom.progressFillBar.style.width = percentual + '%';
        dom.progressLabel.textContent = `Passo ${passoVisivel} de ${TOTAL_PASSOS}`;
        dom.progressPercent.textContent = Math.round(percentual) + '%';
    }
}

function avancar() {
    if (estado.passoAtual === 2) {
        const produtosInvalidos = estado.produtos.some(p =>
            p.produtoSelecionado === 'outro' && !p.nomePersonalizado.trim()
        );
        if (produtosInvalidos) {
            alert('Por favor, dê um nome para os produtos personalizados.');
            return;
        }
    }

    if (estado.passoAtual === 3 && !estado.proporcaoValida) {
        return;
    }

    if (estado.passoAtual === 4) {
        executarCalculo();
        return;
    }

    irParaPasso(estado.passoAtual + 1, 'forward');
}

function voltar() {
    irParaPasso(estado.passoAtual - 1, 'back');
}

function reiniciar() {
    estado.quantidadeProdutos = 2;
    estado.proporcao = '';
    estado.proporcaoValida = false;
    estado.limite = { valor: null, unidade: 'mL' };

    selecionarQuantidade(2);

    dom.ratioInput.value = '';
    dom.ratioInput.classList.remove('error', 'success');
    dom.ratioStatus.className = 'input-icon';
    dom.ratioError.classList.remove('visible');
    dom.ratioPresets.querySelectorAll('.ratio-chip').forEach(c => c.classList.remove('active'));

    dom.limitValue.value = '';
    dom.limitPresets.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    dom.limitUnit.value = 'mL';

    atualizarBotoesNavegacao();
    irParaPasso(0, 'back');
}

// ============================================
// PRODUTOS – Renderização dinâmica
// ============================================

function inicializarProdutos(quantidade) {
    estado.produtos = [];
    for (let i = 0; i < quantidade; i++) {
        estado.produtos.push({
            id: `produto-${i}`,
            indice: i,
            produtoSelecionado: i === 0 ? 'multiuso' : 'agua',
            nomePersonalizado: '',
            tipo: 'liquido',
            unidade: 'mL'
        });
    }
    renderizarProdutos();
}

function renderizarProdutos() {
    dom.productsList.innerHTML = '';
    estado.produtos.forEach((produto, idx) => {
        dom.productsList.appendChild(criarCardProduto(produto, idx));
    });
}

function criarCardProduto(produto, idx) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.idx = idx;

    const opcoes = PRODUTOS_PRECADASTRADOS.map(p =>
        `<option value="${p.id}" ${p.id === produto.produtoSelecionado ? 'selected' : ''}>${p.nome}</option>`
    ).join('');

    const unidadesOpcoes = UNIDADES[produto.tipo].map(u =>
        `<option value="${u}" ${u === produto.unidade ? 'selected' : ''}>${u}</option>`
    ).join('');

    const mostrarCustom = produto.produtoSelecionado === 'outro';

    card.innerHTML = `
        <div class="product-card-header">
            <span class="product-number">${idx + 1}</span>
            <span>Produto ${idx + 1}</span>
        </div>
        <select class="select" data-field="produtoSelecionado" aria-label="Escolher produto ${idx + 1}">
            ${opcoes}
        </select>
        <div class="custom-product-input ${mostrarCustom ? 'visible' : ''}">
            <input
                type="text"
                class="input"
                data-field="nomePersonalizado"
                placeholder="Digite o nome do produto"
                value="${produto.nomePersonalizado || ''}"
                maxlength="40"
            >
        </div>
        <div class="toggle-group" role="radiogroup" aria-label="Estado físico">
            <button class="toggle-btn ${produto.tipo === 'liquido' ? 'active' : ''}"
                    data-tipo="liquido"
                    type="button">Líquido</button>
            <button class="toggle-btn ${produto.tipo === 'po' ? 'active' : ''}"
                    data-tipo="po"
                    type="button">Pó / Sólido</button>
        </div>
        <div class="product-row">
            <div></div>
            <select class="select" data-field="unidade" aria-label="Unidade">
                ${unidadesOpcoes}
            </select>
        </div>
    `;

    const select = card.querySelector('[data-field="produtoSelecionado"]');
    select.addEventListener('change', e => atualizarProduto(idx, 'produtoSelecionado', e.target.value));

    const customInput = card.querySelector('[data-field="nomePersonalizado"]');
    if (customInput) {
        customInput.addEventListener('input', e => atualizarProduto(idx, 'nomePersonalizado', e.target.value));
    }

    card.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => atualizarProduto(idx, 'tipo', btn.dataset.tipo));
    });

    const unitSelect = card.querySelector('[data-field="unidade"]');
    unitSelect.addEventListener('change', e => atualizarProduto(idx, 'unidade', e.target.value));

    return card;
}

function atualizarProduto(idx, campo, valor) {
    const produto = estado.produtos[idx];
    produto[campo] = valor;

    if (campo === 'produtoSelecionado') {
        const dadosProduto = PRODUTOS_PRECADASTRADOS.find(p => p.id === valor);
        if (dadosProduto && dadosProduto.id !== 'outro') {
            produto.tipo = dadosProduto.tipoSugerido;
            produto.unidade = UNIDADES[produto.tipo][0];
            produto.nomePersonalizado = '';
        }
        renderizarProdutos();
    }

    if (campo === 'tipo') {
        if (!UNIDADES[valor].includes(produto.unidade)) {
            produto.unidade = UNIDADES[valor][0];
        }
        renderizarProdutos();
    }

    sugerirUnidadeLimite();
}

// ============================================
// QUANTIDADE DE PRODUTOS
// ============================================

function selecionarQuantidade(quantidade) {
    estado.quantidadeProdutos = quantidade;

    dom.pillsCount.forEach(pill => {
        const isActive = parseInt(pill.dataset.count) === quantidade;
        pill.classList.toggle('active', isActive);
        pill.setAttribute('aria-checked', isActive);
    });

    inicializarProdutos(quantidade);
    atualizarPresetsProporcao();

    if (estado.proporcao) {
        const partes = estado.proporcao.split('/').length;
        if (partes !== quantidade) {
            estado.proporcao = '';
            estado.proporcaoValida = false;
            dom.ratioInput.value = '';
            dom.ratioInput.classList.remove('error', 'success');
            dom.ratioStatus.className = 'input-icon';
            dom.ratioError.classList.remove('visible');
        }
    }

    atualizarBotoesNavegacao();
}

// ============================================
// PROPORÇÃO
// ============================================

function atualizarPresetsProporcao() {
    const sugestoes = PROPORCOES_SUGERIDAS[estado.quantidadeProdutos] || [];
    dom.ratioPresets.innerHTML = sugestoes.map(s =>
        `<button class="ratio-chip" type="button" data-ratio="${s}">${s}</button>`
    ).join('');

    dom.ratioPresets.querySelectorAll('.ratio-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            dom.ratioPresets.querySelectorAll('.ratio-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            dom.ratioInput.value = chip.dataset.ratio;
            validarProporcao();
        });
    });

    const exemplo = sugestoes[0] || '';
    dom.ratioHint.textContent = `Use ${estado.quantidadeProdutos} partes – ex: ${exemplo}`;
}

function validarProporcao() {
    const valor = dom.ratioInput.value.trim();
    estado.proporcao = valor;

    dom.ratioPresets.querySelectorAll('.ratio-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.ratio === valor);
    });

    if (!valor) {
        dom.ratioInput.classList.remove('error', 'success');
        dom.ratioStatus.className = 'input-icon';
        dom.ratioError.classList.remove('visible');
        estado.proporcaoValida = false;
        atualizarBotoesNavegacao();
        return;
    }

    const partes = valor.split('/').map(p => p.trim());

    if (partes.length !== estado.quantidadeProdutos) {
        const exemplo = PROPORCOES_SUGERIDAS[estado.quantidadeProdutos]?.[0] || '1/2';
        mostrarErroProporcao(`Você tem ${estado.quantidadeProdutos} produtos – informe ${estado.quantidadeProdutos} partes (ex: ${exemplo}).`);
        return;
    }

    const numeros = partes.map(p => {
        const n = parseFloat(p.replace(',', '.'));
        return isNaN(n) ? null : n;
    });

    if (numeros.some(n => n === null || n <= 0)) {
        mostrarErroProporcao('Use apenas números positivos separados por barra (/).');
        return;
    }

    dom.ratioInput.classList.remove('error');
    dom.ratioInput.classList.add('success');
    dom.ratioStatus.className = 'input-icon success';
    dom.ratioError.classList.remove('visible');
    estado.proporcaoValida = true;
    atualizarBotoesNavegacao();
}

function mostrarErroProporcao(mensagem) {
    dom.ratioInput.classList.remove('success');
    dom.ratioInput.classList.add('error');
    dom.ratioStatus.className = 'input-icon error';
    dom.ratioError.textContent = mensagem;
    dom.ratioError.classList.add('visible');
    estado.proporcaoValida = false;
    atualizarBotoesNavegacao();
}

// ============================================
// LIMITE
// ============================================

function selecionarLimitePreset(valor, unidade) {
    estado.limite.valor = parseFloat(valor);
    estado.limite.unidade = unidade;
    dom.limitValue.value = valor;
    dom.limitUnit.value = unidade;

    dom.limitPresets.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    const ativo = dom.limitPresets.querySelector(`.pill[data-limit="${valor}"][data-unit="${unidade}"]`);
    if (ativo) ativo.classList.add('active');

    atualizarBotoesNavegacao();
}

function atualizarLimiteCustomizado() {
    const valor = parseFloat(dom.limitValue.value);
    estado.limite.valor = isNaN(valor) ? null : valor;
    estado.limite.unidade = dom.limitUnit.value;

    dom.limitPresets.querySelectorAll('.pill').forEach(pill => {
        const presetValor = parseFloat(pill.dataset.limit);
        const presetUnidade = pill.dataset.unit;
        const bate = presetValor === valor && presetUnidade === estado.limite.unidade;
        pill.classList.toggle('active', bate);
    });

    atualizarBotoesNavegacao();
}

function sugerirUnidadeLimite() {
    const tipos = [...new Set(estado.produtos.map(p => p.tipo))];
    const unidadesDisponiveis = tipos.length === 1
        ? UNIDADES[tipos[0]]
        : ['mL', 'L', 'g', 'kg'];

    const unidadeAtual = estado.limite.unidade;
    const unidadeNova = unidadesDisponiveis.includes(unidadeAtual)
        ? unidadeAtual
        : unidadesDisponiveis[0];

    estado.limite.unidade = unidadeNova;
    dom.limitUnit.innerHTML = unidadesDisponiveis.map(u =>
        `<option value="${u}" ${u === unidadeNova ? 'selected' : ''}>${u}</option>`
    ).join('');
}

// ============================================
// VALIDAÇÃO E NAVEGAÇÃO DOS BOTÕES
// ============================================

function atualizarBotoesNavegacao() {
    const btnPasso3 = document.querySelector('.step[data-step="3"] .btn-primary');
    if (btnPasso3) {
        btnPasso3.disabled = !estado.proporcaoValida;
    }

    const limiteValido = estado.limite.valor !== null && estado.limite.valor > 0;
    if (dom.btnCalculate) {
        dom.btnCalculate.disabled = !limiteValido;
    }
}

// ============================================
// CÁLCULO
// ============================================

function calcular(produtos, proporcoes, limiteValor, limiteUnidade) {
    const soma = proporcoes.reduce((a, b) => a + b, 0);
    const unidadeBase = limiteValor / soma;

    return produtos.map((produto, i) => {
        const quantidade = proporcoes[i] * unidadeBase;
        const porcentagem = (proporcoes[i] / soma) * 100;
        return {
            nome: obterNomeProduto(produto),
            quantidade,
            unidade: limiteUnidade,
            porcentagem
        };
    });
}

function obterNomeProduto(produto) {
    if (produto.produtoSelecionado === 'outro') {
        return produto.nomePersonalizado || 'Produto sem nome';
    }
    const dados = PRODUTOS_PRECADASTRADOS.find(p => p.id === produto.produtoSelecionado);
    return dados ? dados.nome : 'Produto';
}

function executarCalculo() {
    if (dom.btnCalculate.disabled) return;

    const proporcoes = estado.proporcao.split('/').map(p => parseFloat(p.replace(',', '.')));
    const resultados = calcular(
        estado.produtos,
        proporcoes,
        estado.limite.valor,
        estado.limite.unidade
    );

    renderizarResultados(resultados);
    irParaPasso(5, 'forward');
}

// ============================================
// RENDERIZAÇÃO DOS RESULTADOS
// ============================================

function formatarNumero(valor) {
    if (valor >= 100) return valor.toFixed(0);
    if (valor >= 10) return valor.toFixed(1);
    if (valor >= 1) return valor.toFixed(2);
    return valor.toFixed(3);
}

function renderizarResultados(resultados) {
    dom.resultsSummary.textContent =
        `${estado.proporcao} em ${estado.limite.valor} ${estado.limite.unidade}`;

    dom.resultsList.innerHTML = resultados.map(r => `
        <div class="result-item">
            <div class="result-top">
                <span class="result-name">${r.nome}</span>
                <span class="result-percent">${r.porcentagem.toFixed(1)}%</span>
            </div>
            <div class="result-amount">
                <span class="result-value">${formatarNumero(r.quantidade)}</span>
                <span class="result-unit">${r.unidade}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" data-width="${r.porcentagem}"></div>
            </div>
        </div>
    `).join('');

    setTimeout(() => {
        dom.resultsList.querySelectorAll('.progress-fill').forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
        });
    }, 600);

    dom.totalCard.innerHTML = `
        <div class="total-label">Total da mistura</div>
        <div class="total-value">${estado.limite.valor} ${estado.limite.unidade}</div>
    `;
}

// ============================================
// INICIALIZAÇÃO E EVENT LISTENERS
// ============================================

function registrarEventos() {
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const acao = btn.dataset.action;
            if (acao === 'next') avancar();
            else if (acao === 'back') voltar();
            else if (acao === 'calculate') avancar();
            else if (acao === 'restart') reiniciar();
            else if (acao === 'start') irParaPasso(1, 'forward');
        });
    });

    dom.pillsCount.forEach(pill => {
        pill.addEventListener('click', () => {
            selecionarQuantidade(parseInt(pill.dataset.count));
        });
    });

    dom.ratioInput.addEventListener('input', validarProporcao);
    dom.ratioInput.addEventListener('blur', validarProporcao);

    dom.limitPresets.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => {
            selecionarLimitePreset(pill.dataset.limit, pill.dataset.unit);
        });
    });

    dom.limitValue.addEventListener('input', atualizarLimiteCustomizado);
    dom.limitUnit.addEventListener('change', atualizarLimiteCustomizado);

    document.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            const tag = e.target.tagName;
            if (tag === 'SELECT' || tag === 'TEXTAREA') return;

            const passoAtivo = document.querySelector('.step.active');
            const btnPrincipal = passoAtivo?.querySelector('.btn-primary:not(:disabled)');
            if (btnPrincipal) {
                e.preventDefault();
                btnPrincipal.click();
            }
        }
    });
}

function inicializar() {
    inicializarProdutos(estado.quantidadeProdutos);
    atualizarPresetsProporcao();
    registrarEventos();
    atualizarBotoesNavegacao();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}
