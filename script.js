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
    productsError: document.getElementById('productsError'),
    resultsList: document.getElementById('resultsList'),
    resultsSummary: document.getElementById('resultsSummary'),
    totalCard: document.getElementById('totalCard'),

    // Conta e auth
    accountBtn: document.getElementById('accountBtn'),
    accountBtnGuest: document.getElementById('accountBtnGuest'),
    accountBtnLogged: document.getElementById('accountBtnLogged'),
    accountAvatar: document.getElementById('accountAvatar'),
    accountMenu: document.getElementById('accountMenu'),
    accountMenuName: document.getElementById('accountMenuName'),
    accountMenuEmail: document.getElementById('accountMenuEmail'),

    // Modal de auth
    authModal: document.getElementById('authModal'),
    authModalClose: document.getElementById('authModalClose'),
    authModalTitle: document.getElementById('authModalTitle'),
    authModalSubtitle: document.getElementById('authModalSubtitle'),
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginSenha: document.getElementById('loginSenha'),
    loginError: document.getElementById('loginError'),
    cadastroForm: document.getElementById('cadastroForm'),
    cadastroNome: document.getElementById('cadastroNome'),
    cadastroEmail: document.getElementById('cadastroEmail'),
    cadastroSenha: document.getElementById('cadastroSenha'),
    cadastroError: document.getElementById('cadastroError'),

    // Modal de histórico
    historicoModal: document.getElementById('historicoModal'),
    historicoModalClose: document.getElementById('historicoModalClose'),
    historicoList: document.getElementById('historicoList'),
    historicoEmpty: document.getElementById('historicoEmpty')
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
        const indicesInvalidos = estado.produtos
            .map((p, i) => (p.produtoSelecionado === 'outro' && !p.nomePersonalizado.trim()) ? i : -1)
            .filter(i => i !== -1);

        if (indicesInvalidos.length > 0) {
            mostrarErroProdutos(indicesInvalidos);
            return;
        }
        limparErroProdutos();
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
    irParaPasso(1, 'forward');
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

function obterProdutosOrdenados() {
    // Se logado, favoritos sobem para o topo (mantendo "Outro" sempre no fim)
    const favoritos = window.DiluiStorage.Favoritos.listar();

    if (!window.DiluiStorage.Auth.estaLogado() || favoritos.length === 0) {
        return PRODUTOS_PRECADASTRADOS;
    }

    const outro = PRODUTOS_PRECADASTRADOS.find(p => p.id === 'outro');
    const semOutro = PRODUTOS_PRECADASTRADOS.filter(p => p.id !== 'outro');

    const favoritados = semOutro.filter(p => favoritos.includes(p.id));
    const naoFavoritados = semOutro.filter(p => !favoritos.includes(p.id));

    return [...favoritados, ...naoFavoritados, outro];
}

function criarCardProduto(produto, idx) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.idx = idx;

    const produtosOrdenados = obterProdutosOrdenados();
    const favoritos = window.DiluiStorage.Favoritos.listar();
    const ehFavorito = favoritos.includes(produto.produtoSelecionado);
    const podeSerFavoritado = window.DiluiStorage.Auth.estaLogado() && produto.produtoSelecionado !== 'outro';

    const opcoes = produtosOrdenados.map(p => {
        const star = favoritos.includes(p.id) ? '★ ' : '';
        return `<option value="${p.id}" ${p.id === produto.produtoSelecionado ? 'selected' : ''}>${star}${p.nome}</option>`;
    }).join('');

    const unidadesOpcoes = UNIDADES[produto.tipo].map(u =>
        `<option value="${u}" ${u === produto.unidade ? 'selected' : ''}>${u}</option>`
    ).join('');

    const mostrarCustom = produto.produtoSelecionado === 'outro';

    const estrelaHtml = podeSerFavoritado ? `
        <button class="favorite-btn ${ehFavorito ? 'active' : ''}" data-action="favoritar" type="button" aria-label="Favoritar produto" title="${ehFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
        </button>
    ` : '';

    card.innerHTML = `
        <div class="product-card-header">
            <span class="product-number">${idx + 1}</span>
            <span>Produto ${idx + 1}</span>
        </div>
        <div class="product-card-row">
            <select class="select" data-field="produtoSelecionado" aria-label="Escolher produto ${idx + 1}">
                ${opcoes}
            </select>
            ${estrelaHtml}
        </div>
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

    const btnFav = card.querySelector('[data-action="favoritar"]');
    if (btnFav) {
        btnFav.addEventListener('click', () => {
            window.DiluiStorage.Favoritos.alternar(produto.produtoSelecionado);
            renderizarProdutos();
        });
    }

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

    if (campo === 'nomePersonalizado' && valor.trim()) {
        const card = dom.productsList.querySelector(`.product-card[data-idx="${idx}"] [data-field="nomePersonalizado"]`);
        if (card) card.classList.remove('error');

        const aindaInvalido = estado.produtos.some(p =>
            p.produtoSelecionado === 'outro' && !p.nomePersonalizado.trim()
        );
        if (!aindaInvalido) limparErroProdutos();
    }

    sugerirUnidadeLimite();
}

function mostrarErroProdutos(indices) {
    dom.productsError.textContent = indices.length === 1
        ? 'Dê um nome para o produto personalizado.'
        : 'Dê um nome para os produtos personalizados.';
    dom.productsError.classList.add('visible');

    indices.forEach(i => {
        const input = dom.productsList.querySelector(`.product-card[data-idx="${i}"] [data-field="nomePersonalizado"]`);
        if (input) {
            input.classList.add('error');
            if (indices[0] === i) input.focus({ preventScroll: false });
        }
    });
}

function limparErroProdutos() {
    dom.productsError.classList.remove('visible');
    dom.productsError.textContent = '';
    dom.productsList.querySelectorAll('[data-field="nomePersonalizado"].error')
        .forEach(el => el.classList.remove('error'));
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

// Escala em relação à unidade base (mL ou g). Volume<->massa usa
// aproximação de densidade da água: 1 mL ≈ 1 g, 1 L ≈ 1 kg.
const ESCALA_UNIDADE = { mL: 1, g: 1, L: 1000, kg: 1000 };

function converterQuantidade(valor, unidadeOrigem, unidadeDestino) {
    if (unidadeOrigem === unidadeDestino) return valor;
    return valor * ESCALA_UNIDADE[unidadeOrigem] / ESCALA_UNIDADE[unidadeDestino];
}

function calcular(produtos, proporcoes, limiteValor, limiteUnidade) {
    const soma = proporcoes.reduce((a, b) => a + b, 0);
    const unidadeBase = limiteValor / soma;

    return produtos.map((produto, i) => {
        const quantidadeNoLimite = proporcoes[i] * unidadeBase;
        const quantidade = converterQuantidade(quantidadeNoLimite, limiteUnidade, produto.unidade);
        const porcentagem = (proporcoes[i] / soma) * 100;
        return {
            nome: obterNomeProduto(produto),
            quantidade,
            unidade: produto.unidade,
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

    if (window.DiluiStorage.Auth.estaLogado()) {
        window.DiluiStorage.Historico.adicionar({
            quantidadeProdutos: estado.quantidadeProdutos,
            produtos: estado.produtos.map(p => ({
                produtoSelecionado: p.produtoSelecionado,
                nomePersonalizado: p.nomePersonalizado,
                tipo: p.tipo,
                unidade: p.unidade
            })),
            proporcao: estado.proporcao,
            limite: { ...estado.limite },
            resultados
        });
    }

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
// AUTENTICAÇÃO E UI DE CONTA
// ============================================

function atualizarUIConta() {
    const usuario = window.DiluiStorage.Auth.usuarioAtual();

    if (usuario) {
        dom.accountBtnGuest.hidden = true;
        dom.accountBtnLogged.hidden = false;
        dom.accountAvatar.textContent = usuario.nome.charAt(0);
        dom.accountMenuName.textContent = usuario.nome;
        dom.accountMenuEmail.textContent = usuario.email;
    } else {
        dom.accountBtnGuest.hidden = false;
        dom.accountBtnLogged.hidden = true;
        dom.accountMenu.hidden = true;
    }

    renderizarProdutos();
}

function abrirModalAuth() {
    dom.authModal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => dom.loginEmail.focus(), 100);
}

function fecharModalAuth() {
    dom.authModal.hidden = true;
    document.body.style.overflow = '';
    dom.loginForm.reset();
    dom.cadastroForm.reset();
    dom.loginError.classList.remove('visible');
    dom.cadastroError.classList.remove('visible');
}

function alternarTabAuth(tab) {
    document.querySelectorAll('.modal-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });

    if (tab === 'login') {
        dom.loginForm.hidden = false;
        dom.cadastroForm.hidden = true;
        dom.authModalTitle.textContent = 'Bem-vindo de volta';
        dom.authModalSubtitle.textContent = 'Entre para acessar seu histórico e favoritos.';
        setTimeout(() => dom.loginEmail.focus(), 50);
    } else {
        dom.loginForm.hidden = true;
        dom.cadastroForm.hidden = false;
        dom.authModalTitle.textContent = 'Crie sua conta';
        dom.authModalSubtitle.textContent = 'Salve suas misturas e favorite seus produtos.';
        setTimeout(() => dom.cadastroNome.focus(), 50);
    }
}

function processarLogin(e) {
    e.preventDefault();
    dom.loginError.classList.remove('visible');

    const resultado = window.DiluiStorage.Auth.login(
        dom.loginEmail.value,
        dom.loginSenha.value
    );

    if (resultado.sucesso) {
        fecharModalAuth();
        atualizarUIConta();
    } else {
        dom.loginError.textContent = resultado.erro;
        dom.loginError.classList.add('visible');
    }
}

function processarCadastro(e) {
    e.preventDefault();
    dom.cadastroError.classList.remove('visible');

    const resultado = window.DiluiStorage.Auth.cadastrar(
        dom.cadastroNome.value,
        dom.cadastroEmail.value,
        dom.cadastroSenha.value
    );

    if (resultado.sucesso) {
        fecharModalAuth();
        atualizarUIConta();
    } else {
        dom.cadastroError.textContent = resultado.erro;
        dom.cadastroError.classList.add('visible');
    }
}

function fazerLogout() {
    window.DiluiStorage.Auth.logout();
    dom.accountMenu.hidden = true;
    atualizarUIConta();
}

// ============================================
// HISTÓRICO – UI
// ============================================

function abrirModalHistorico() {
    renderizarHistorico();
    dom.historicoModal.hidden = false;
    document.body.style.overflow = 'hidden';
}

function fecharModalHistorico() {
    dom.historicoModal.hidden = true;
    document.body.style.overflow = '';
}

function formatarDataHistorico(isoString) {
    const data = new Date(isoString);
    const agora = new Date();
    const diffMs = agora - data;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);

    if (diffHoras < 1) return 'Há instantes';
    if (diffHoras < 24) return `Há ${diffHoras}h`;
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `Há ${diffDias} dias`;
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function renderizarHistorico() {
    const lista = window.DiluiStorage.Historico.listar();

    if (lista.length === 0) {
        dom.historicoList.hidden = true;
        dom.historicoEmpty.hidden = false;
        return;
    }

    dom.historicoList.hidden = false;
    dom.historicoEmpty.hidden = true;

    dom.historicoList.innerHTML = lista.map(item => {
        const nomes = item.produtos.map(p => obterNomeProduto(p)).join(' + ');
        return `
            <div class="historico-item">
                <div class="historico-item-top">
                    <span class="historico-item-ratio">${item.proporcao}</span>
                    <span class="historico-item-date">${formatarDataHistorico(item.criadoEm)}</span>
                </div>
                <div class="historico-item-products">
                    ${nomes} · ${item.limite.valor} ${item.limite.unidade}
                </div>
                <div class="historico-item-actions">
                    <button class="historico-item-btn primary" data-historico-action="refazer" data-id="${item.id}" type="button">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3.51 15A9 9 0 1 0 6 5.3L1 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>Refazer</span>
                    </button>
                    <button class="historico-item-btn danger" data-historico-action="remover" data-id="${item.id}" type="button" aria-label="Remover">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M3 6H5H21M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    dom.historicoList.querySelectorAll('[data-historico-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const acao = btn.dataset.historicoAction;
            const id = btn.dataset.id;

            if (acao === 'refazer') {
                refazerMistura(id);
            } else if (acao === 'remover') {
                if (confirm('Remover esta mistura do histórico?')) {
                    window.DiluiStorage.Historico.remover(id);
                    renderizarHistorico();
                }
            }
        });
    });
}

function refazerMistura(id) {
    const lista = window.DiluiStorage.Historico.listar();
    const mistura = lista.find(m => m.id === id);
    if (!mistura) return;

    estado.quantidadeProdutos = mistura.quantidadeProdutos;
    estado.produtos = mistura.produtos.map((p, i) => ({
        id: `produto-${i}`,
        indice: i,
        ...p
    }));
    estado.proporcao = mistura.proporcao;
    estado.proporcaoValida = true;
    estado.limite = { ...mistura.limite };

    dom.pillsCount.forEach(pill => {
        const isActive = parseInt(pill.dataset.count) === mistura.quantidadeProdutos;
        pill.classList.toggle('active', isActive);
        pill.setAttribute('aria-checked', isActive);
    });

    renderizarProdutos();
    atualizarPresetsProporcao();
    dom.ratioInput.value = mistura.proporcao;
    dom.ratioInput.classList.add('success');
    dom.ratioStatus.className = 'input-icon success';
    dom.limitValue.value = mistura.limite.valor;
    dom.limitUnit.value = mistura.limite.unidade;

    fecharModalHistorico();

    const proporcoes = mistura.proporcao.split('/').map(p => parseFloat(p.replace(',', '.')));
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
// COMPARTILHAMENTO VIA LINK
// ============================================

// Codifica/decodifica base64 com segurança UTF-8 e URL-safe
// (necessário porque btoa não suporta caracteres acentuados)
function _encodeBase64Url(str) {
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function _decodeBase64Url(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return decodeURIComponent(escape(atob(str)));
}

function gerarUrlCompartilhavel() {
    const dados = {
        p: estado.produtos.map(p => [
            p.produtoSelecionado,
            p.tipo,
            p.unidade,
            p.nomePersonalizado || ''
        ]),
        r: estado.proporcao,
        l: [estado.limite.valor, estado.limite.unidade]
    };
    const encoded = _encodeBase64Url(JSON.stringify(dados));
    return `${location.origin}${location.pathname}?m=${encoded}`;
}

function montarTextoCompartilhamento(url) {
    const proporcoes = estado.proporcao.split('/').map(p => parseFloat(p.replace(',', '.')));
    const resultados = calcular(
        estado.produtos,
        proporcoes,
        estado.limite.valor,
        estado.limite.unidade
    );

    const linhas = resultados.map(r =>
        `• ${r.nome}: ${formatarNumero(r.quantidade)} ${r.unidade}`
    );

    return `🧪 Mistura no Diluí\n\n${linhas.join('\n')}\n\nTotal: ${estado.limite.valor} ${estado.limite.unidade} (proporção ${estado.proporcao})\n\n${url}`;
}

async function compartilharMistura() {
    const url = gerarUrlCompartilhavel();
    const texto = montarTextoCompartilhamento(url);

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Mistura no Diluí',
                text: texto
            });
            return;
        } catch (e) {
            if (e.name === 'AbortError') return; // usuário cancelou
            // outras falhas → cai pro fallback
        }
    }

    try {
        await navigator.clipboard.writeText(url);
        mostrarToast('Link copiado! 🔗');
    } catch {
        mostrarToast('Não foi possível copiar o link');
    }
}

function compartilharNoWhatsApp() {
    const url = gerarUrlCompartilhavel();
    const texto = montarTextoCompartilhamento(url);
    const waUrl = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(waUrl, '_blank', 'noopener');
}

function carregarMisturaDeUrl() {
    const params = new URLSearchParams(location.search);
    const m = params.get('m');
    if (!m) return false;

    try {
        const dados = JSON.parse(_decodeBase64Url(m));

        if (!Array.isArray(dados.p) || dados.p.length < 2 || dados.p.length > 5) {
            throw new Error('Quantidade de produtos inválida');
        }
        if (typeof dados.r !== 'string' || !dados.r) {
            throw new Error('Proporção inválida');
        }
        if (!Array.isArray(dados.l) || dados.l.length !== 2 || typeof dados.l[0] !== 'number') {
            throw new Error('Limite inválido');
        }

        const idsValidos = new Set(PRODUTOS_PRECADASTRADOS.map(p => p.id));
        const tiposValidos = ['liquido', 'po'];
        const unidadesValidas = ['mL', 'L', 'g', 'kg'];

        estado.quantidadeProdutos = dados.p.length;
        estado.produtos = dados.p.map((linha, i) => {
            if (!Array.isArray(linha) || linha.length < 3) {
                throw new Error('Produto inválido');
            }
            const [idOrig, tipoOrig, unidadeOrig, nomeOrig = ''] = linha;
            // Se o id não existir no catálogo (versão antiga ou link forjado),
            // cai pra "Outro" preservando o nome original como custom.
            const id = idsValidos.has(idOrig) ? idOrig : 'outro';
            const nome = id === 'outro' ? (nomeOrig || idOrig || '') : (nomeOrig || '');
            return {
                id: `produto-${i}`,
                indice: i,
                produtoSelecionado: id,
                nomePersonalizado: nome,
                tipo: tiposValidos.includes(tipoOrig) ? tipoOrig : 'liquido',
                unidade: unidadesValidas.includes(unidadeOrig) ? unidadeOrig : 'mL'
            };
        });
        estado.proporcao = dados.r;
        estado.proporcaoValida = true;
        estado.limite = { valor: dados.l[0], unidade: dados.l[1] };

        // Sincroniza UI dos passos anteriores (caso usuário clique "Ajustar")
        dom.pillsCount.forEach(pill => {
            const isActive = parseInt(pill.dataset.count) === estado.quantidadeProdutos;
            pill.classList.toggle('active', isActive);
            pill.setAttribute('aria-checked', isActive);
        });
        renderizarProdutos();
        atualizarPresetsProporcao();
        dom.ratioInput.value = estado.proporcao;
        dom.ratioInput.classList.add('success');
        dom.ratioStatus.className = 'input-icon success';
        dom.limitValue.value = estado.limite.valor;
        sugerirUnidadeLimite();
        dom.limitUnit.value = estado.limite.unidade;
        atualizarBotoesNavegacao();

        const proporcoes = estado.proporcao.split('/').map(p => parseFloat(p.replace(',', '.')));
        const resultados = calcular(
            estado.produtos,
            proporcoes,
            estado.limite.valor,
            estado.limite.unidade
        );
        renderizarResultados(resultados);

        // Limpa o ?m= da URL pra refresh não recarregar e address bar ficar limpa
        history.replaceState({}, '', location.pathname);

        irParaPasso(5, 'forward');
        setTimeout(() => mostrarToast('Mistura carregada do link! ✨'), 400);
        return true;
    } catch (e) {
        console.warn('Link compartilhado inválido:', e);
        history.replaceState({}, '', location.pathname);
        setTimeout(() => mostrarToast('Link inválido — começando do zero'), 100);
        return false;
    }
}

// ============================================
// TOAST (feedback temporário)
// ============================================

let _toastTimeoutId = null;

function mostrarToast(mensagem, duracao = 3000) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'status');
        document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    requestAnimationFrame(() => toast.classList.add('visible'));

    clearTimeout(_toastTimeoutId);
    _toastTimeoutId = setTimeout(() => {
        toast.classList.remove('visible');
    }, duracao);
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
            else if (acao === 'share') compartilharMistura();
            else if (acao === 'share-whatsapp') compartilharNoWhatsApp();
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
            if (e.target.closest('form')) return; // Forms tem submit próprio

            const passoAtivo = document.querySelector('.step.active');
            const btnPrincipal = passoAtivo?.querySelector('.btn-primary:not(:disabled)');
            if (btnPrincipal) {
                e.preventDefault();
                btnPrincipal.click();
            }
        }
        if (e.key === 'Escape') {
            if (!dom.authModal.hidden) fecharModalAuth();
            else if (!dom.historicoModal.hidden) fecharModalHistorico();
            else if (!dom.accountMenu.hidden) dom.accountMenu.hidden = true;
        }
    });

    // ============================================
    // CONTA E AUTH
    // ============================================

    dom.accountBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (window.DiluiStorage.Auth.estaLogado()) {
            dom.accountMenu.hidden = !dom.accountMenu.hidden;
        } else {
            abrirModalAuth();
        }
    });

    document.addEventListener('click', e => {
        if (!dom.accountMenu.hidden &&
            !dom.accountMenu.contains(e.target) &&
            !dom.accountBtn.contains(e.target)) {
            dom.accountMenu.hidden = true;
        }
    });

    dom.accountMenu.querySelectorAll('[data-menu-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const acao = btn.dataset.menuAction;
            dom.accountMenu.hidden = true;

            if (acao === 'historico') abrirModalHistorico();
            else if (acao === 'logout') fazerLogout();
        });
    });

    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', () => alternarTabAuth(tab.dataset.tab));
    });

    dom.authModalClose.addEventListener('click', fecharModalAuth);
    dom.authModal.addEventListener('click', e => {
        if (e.target === dom.authModal) fecharModalAuth();
    });

    dom.loginForm.addEventListener('submit', processarLogin);
    dom.cadastroForm.addEventListener('submit', processarCadastro);

    dom.historicoModalClose.addEventListener('click', fecharModalHistorico);
    dom.historicoModal.addEventListener('click', e => {
        if (e.target === dom.historicoModal) fecharModalHistorico();
    });
}

function inicializar() {
    inicializarProdutos(estado.quantidadeProdutos);
    atualizarPresetsProporcao();
    registrarEventos();
    atualizarBotoesNavegacao();
    atualizarUIConta();

    // Se a URL tem ?m=<mistura-codificada>, salta direto pro resultado
    carregarMisturaDeUrl();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}
