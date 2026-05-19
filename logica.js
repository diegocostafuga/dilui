/* ============================================
   DILUÍ – Lógica pura (sem DOM)
   Exportado como ES module para uso em script.js
   e nos testes Vitest.
   ============================================ */

// ============================================
// DADOS / CONFIGURAÇÃO
// ============================================

export const PRODUTOS_PRECADASTRADOS = [
    { id: 'agua', nome: 'Água', tipoSugerido: 'liquido' },
    { id: 'multiuso', nome: 'Multiuso', tipoSugerido: 'liquido' },
    { id: 'desinfetante', nome: 'Desinfetante', tipoSugerido: 'liquido' },
    { id: 'alcool_70', nome: 'Álcool 70%', tipoSugerido: 'liquido' },
    { id: 'alcool_46', nome: 'Álcool 46°', tipoSugerido: 'liquido' },
    { id: 'agua_sanitaria', nome: 'Água sanitária', tipoSugerido: 'liquido' },
    { id: 'amonia', nome: 'Amônia', tipoSugerido: 'liquido' },
    { id: 'limpa_vidros', nome: 'Limpa vidros', tipoSugerido: 'liquido' },
    { id: 'peroxido', nome: 'Peróxido de hidrogênio', tipoSugerido: 'liquido' },
    { id: 'detergente', nome: 'Detergente', tipoSugerido: 'liquido' },
    { id: 'sabao_coco_liquido', nome: 'Sabão de coco líquido', tipoSugerido: 'liquido' },
    { id: 'sabao_neutro_liquido', nome: 'Sabão neutro líquido', tipoSugerido: 'liquido' },
    { id: 'desengordurante', nome: 'Desengordurante', tipoSugerido: 'liquido' },
    { id: 'limpa_piso', nome: 'Limpa-piso concentrado', tipoSugerido: 'liquido' },
    { id: 'amaciante', nome: 'Amaciante', tipoSugerido: 'liquido' },
    { id: 'aromatizante', nome: 'Aromatizante concentrado', tipoSugerido: 'liquido' },
    { id: 'vinagre', nome: 'Vinagre', tipoSugerido: 'liquido' },
    { id: 'bicarbonato', nome: 'Bicarbonato de sódio', tipoSugerido: 'po' },
    { id: 'sabao_po', nome: 'Sabão em pó', tipoSugerido: 'po' },
    { id: 'soda', nome: 'Soda cáustica', tipoSugerido: 'po' },
    { id: 'outro', nome: 'Outro (digitar)', tipoSugerido: 'liquido' }
];

export const UNIDADES = {
    liquido: ['mL', 'L'],
    po: ['g', 'kg']
};

export const PROPORCOES_SUGERIDAS = {
    2: ['1/2', '1/3', '1/5', '1/10', '1/20', '1/50', '1/100'],
    3: ['1/1/3', '1/2/5', '1/2/10', '1/3/10'],
    4: ['1/1/2/5', '1/2/3/10', '1/1/1/10'],
    5: ['1/1/1/2/5', '1/2/2/3/10']
};

// ============================================
// INCOMPATIBILIDADES QUÍMICAS
// ============================================
//
// Compilação técnica baseada em fontes públicas — pendente validação por
// especialista antes da v1 pública (issue #7). Cada par traz `fontes` com
// referências de agências de saúde/segurança (NIOSH, CDC, ATSDR, OSHA),
// normas regulatórias brasileiras (Anvisa, ABNT) e literatura química.
//
// Falso positivo erode confiança; falso negativo machuca pessoa. A barra
// de qualidade tem que ser alta antes de virar produto final.
//
// Convenções de `fontes`:
//   tipo: 'agencia'    — NIOSH/CDC/OSHA/ATSDR e equivalentes
//        'norma'      — Anvisa, ABNT, regulamentação brasileira
//        'fispq'      — Ficha de Informação de Segurança de fabricante
//        'literatura' — periódicos científicos, ACS, livros-texto
//   url é opcional — incluído apenas para portais estáveis de agência;
//   FISPQs e periódicos são citados pelo nome para evitar links quebrados.
//
// Severidades:
//   'perigo'   — não misturar (gás tóxico, reação violenta) — bloqueia o
//                fluxo até o usuário marcar "Estou ciente do risco"
//   'cuidado'  — pode misturar com EPI e ventilação adequada (não bloqueia)
//   'ineficaz' — combinação anula efeito de limpeza (não bloqueia)

export const INCOMPATIBILIDADES = [
    {
        a: 'agua_sanitaria',
        b: 'peroxido',
        severidade: 'perigo',
        titulo: 'Água sanitária + Peróxido de hidrogênio',
        mensagem: 'Dois oxidantes fortes em contato geram reação exotérmica e liberação rápida de oxigênio, com risco de respingos quentes.',
        recomendacao: 'Use os produtos em momentos separados, com enxágue completo entre as aplicações.',
        fontes: [
            { tipo: 'agencia', referencia: 'NIOSH Pocket Guide to Chemical Hazards — Sodium Hypochlorite', url: 'https://www.cdc.gov/niosh/npg/' },
            { tipo: 'agencia', referencia: 'NIOSH Pocket Guide to Chemical Hazards — Hydrogen Peroxide', url: 'https://www.cdc.gov/niosh/npg/' },
            { tipo: 'literatura', referencia: 'ACS — Reatividade entre oxidantes domésticos' }
        ]
    },
    {
        a: 'agua_sanitaria',
        b: 'detergente',
        severidade: 'perigo',
        titulo: 'Água sanitária + Detergente',
        mensagem: 'Muitos detergentes contêm amônia ou derivados. Em contato com hipoclorito (água sanitária), pode liberar gás de cloro — irritante e tóxico para vias aéreas.',
        recomendacao: 'Limpe primeiro com detergente, enxágue bem e só depois desinfete com água sanitária diluída.',
        fontes: [
            { tipo: 'agencia', referencia: 'CDC — Cleaning and Disinfecting Safely (alerta de cloramina)' },
            { tipo: 'agencia', referencia: 'NIOSH Pocket Guide — Chloramine', url: 'https://www.cdc.gov/niosh/npg/' },
            { tipo: 'norma', referencia: 'Anvisa — Regulamentação de saneantes domissanitários' }
        ]
    },
    {
        a: 'agua_sanitaria',
        b: 'amaciante',
        severidade: 'perigo',
        titulo: 'Água sanitária + Amaciante',
        mensagem: 'Amaciantes podem reagir com hipoclorito liberando gases irritantes em ambientes fechados.',
        recomendacao: 'Não combine na mesma água — use em ciclos de lavagem distintos.',
        fontes: [
            { tipo: 'agencia', referencia: 'CDC — Mixing cleaning chemicals: hazards' },
            { tipo: 'literatura', referencia: 'NIOSH — Quaternary ammonium compounds (QACs) safety' }
        ]
    },
    {
        a: 'agua_sanitaria',
        b: 'vinagre',
        severidade: 'perigo',
        titulo: 'Água sanitária + Vinagre',
        mensagem: 'A acidez do vinagre reage com hipoclorito liberando gás de cloro — uma das misturas caseiras mais perigosas, mesmo em pouca quantidade. É comum em "receitas naturais" mal informadas.',
        recomendacao: 'Nunca combine os dois. Limpe primeiro com vinagre, enxágue bem, e só depois aplique água sanitária diluída em outro momento.',
        fontes: [
            { tipo: 'agencia', referencia: 'NIOSH Pocket Guide — Chlorine', url: 'https://www.cdc.gov/niosh/npg/' },
            { tipo: 'agencia', referencia: 'ATSDR — Toxicological Profile for Chlorine', url: 'https://www.atsdr.cdc.gov/toxprofiles/' },
            { tipo: 'agencia', referencia: 'Washington State Department of Health — Mixing Cleaning Products' }
        ]
    },
    {
        a: 'soda',
        b: 'peroxido',
        severidade: 'cuidado',
        titulo: 'Soda cáustica + Peróxido',
        mensagem: 'A combinação acelera a oxidação e gera calor. Pode causar queimaduras e respingos.',
        recomendacao: 'Use óculos de proteção, luvas resistentes e ambiente bem ventilado, ou aplique os produtos separadamente.',
        fontes: [
            { tipo: 'agencia', referencia: 'NIOSH Pocket Guide — Sodium hydroxide', url: 'https://www.cdc.gov/niosh/npg/' },
            { tipo: 'agencia', referencia: 'NIOSH Pocket Guide — Hydrogen peroxide', url: 'https://www.cdc.gov/niosh/npg/' }
        ]
    },
    {
        a: 'soda',
        b: 'detergente',
        severidade: 'cuidado',
        titulo: 'Soda cáustica + Detergente',
        mensagem: 'Mistura altamente alcalina — risco de queimadura química em contato com a pele, mesmo diluída.',
        recomendacao: 'Use luvas de borracha resistente e óculos. Diluição alta não dispensa o EPI.',
        fontes: [
            { tipo: 'agencia', referencia: 'NIOSH Pocket Guide — Sodium hydroxide', url: 'https://www.cdc.gov/niosh/npg/' },
            { tipo: 'agencia', referencia: 'OSHA — Caustic chemicals: hazards de contato' }
        ]
    },
    {
        a: 'soda',
        b: 'vinagre',
        severidade: 'perigo',
        titulo: 'Soda cáustica + Vinagre',
        mensagem: 'Reação ácido-base entre base forte e ácido — libera calor intenso e respingos. Risco real de queimadura química.',
        recomendacao: 'Não misture na mesma diluição. Se precisar usar os dois para finalidades distintas, faça em momentos separados com enxágue completo.',
        fontes: [
            { tipo: 'agencia', referencia: 'NIOSH Pocket Guide — Sodium hydroxide', url: 'https://www.cdc.gov/niosh/npg/' },
            { tipo: 'literatura', referencia: 'ACS — Reações exotérmicas ácido-base (base forte + ácido fraco)' }
        ]
    },
    {
        a: 'vinagre',
        b: 'bicarbonato',
        severidade: 'ineficaz',
        titulo: 'Vinagre + Bicarbonato de sódio',
        mensagem: 'Reação ácido-base clássica: o resultado é água, acetato de sódio (sal sem ação detergente) e gás carbônico. A "espuminha" parece ativa, mas os dois produtos se neutralizam — sobra praticamente água com sal.',
        recomendacao: 'Use separadamente — bicarbonato como abrasivo seco ou em pasta, vinagre diluído para superfícies onde ácido funciona (calcário, manchas leves).',
        fontes: [
            { tipo: 'literatura', referencia: 'Journal of Chemical Education — Reações de neutralização ácido-base' },
            { tipo: 'literatura', referencia: 'PubChem — Acetato de sódio (produto da reação)', url: 'https://pubchem.ncbi.nlm.nih.gov/' }
        ]
    },
    {
        a: 'vinagre',
        b: 'sabao_po',
        severidade: 'ineficaz',
        titulo: 'Vinagre + Sabão em pó',
        mensagem: 'O vinagre neutraliza a alcalinidade do sabão — exatamente o que dá poder de remover gordura. A mistura perde eficácia e pode deixar resíduo pegajoso nas superfícies.',
        recomendacao: 'Lave primeiro com sabão e enxágue. Use o vinagre depois, separadamente, como amaciante de tecidos ou desincrustante.',
        fontes: [
            { tipo: 'literatura', referencia: 'Journal of Surfactants and Detergents — Efeito do pH em sabões' },
            { tipo: 'literatura', referencia: 'ACS — Química de surfactantes: dependência de pH' }
        ]
    },
    {
        a: 'amonia',
        b: 'agua_sanitaria',
        severidade: 'perigo',
        titulo: 'Amônia + Água sanitária',
        mensagem: 'Reage liberando gás cloramina — irritante grave de vias aéreas, mucosas e olhos, com risco de edema pulmonar em ambiente fechado. É uma das misturas caseiras mais perigosas que existem.',
        recomendacao: 'Nunca combine os dois. Use em momentos completamente separados, com ventilação total e enxágue abundante entre as aplicações.',
        fontes: [
            { tipo: 'agencia', referencia: 'NIOSH Pocket Guide — Chloramine', url: 'https://www.cdc.gov/niosh/npg/' },
            { tipo: 'agencia', referencia: 'CDC — Cleaning and Disinfecting Safely: alerta de mistura' },
            { tipo: 'agencia', referencia: 'Washington State Department of Health — Common Toxic Chemical Combinations' },
            { tipo: 'agencia', referencia: 'ATSDR — Toxicological Profile for Ammonia', url: 'https://www.atsdr.cdc.gov/toxprofiles/' }
        ]
    },
    {
        a: 'amonia',
        b: 'peroxido',
        severidade: 'cuidado',
        titulo: 'Amônia + Peróxido de hidrogênio',
        mensagem: 'A combinação pode formar hidrazina — composto tóxico — em concentrações altas, e libera oxigênio com geração de calor. Em produtos domésticos diluídos o risco é menor, mas não desprezível.',
        recomendacao: 'Evite a mistura. Se precisar dos dois, use separadamente, em superfícies enxaguadas, com ventilação adequada.',
        fontes: [
            { tipo: 'agencia', referencia: 'NIOSH Pocket Guide — Ammonia', url: 'https://www.cdc.gov/niosh/npg/' },
            { tipo: 'agencia', referencia: 'NIOSH Pocket Guide — Hydrogen peroxide', url: 'https://www.cdc.gov/niosh/npg/' },
            { tipo: 'literatura', referencia: 'PubChem — Hidrazina (potencial subproduto em alta concentração)', url: 'https://pubchem.ncbi.nlm.nih.gov/' }
        ]
    },
    {
        a: 'amonia',
        b: 'vinagre',
        severidade: 'ineficaz',
        titulo: 'Amônia + Vinagre',
        mensagem: 'Reação ácido-base entre base fraca e ácido fraco: o resultado é acetato de amônio (sal sem ação detergente) e água. Ambos perdem o poder de limpeza.',
        recomendacao: 'Use separadamente — vinagre para superfícies onde ácido funciona (calcário, gordura leve), amônia para vidros e desengordurar.',
        fontes: [
            { tipo: 'literatura', referencia: 'ACS — Neutralização ácido-base entre base e ácido fracos' },
            { tipo: 'literatura', referencia: 'PubChem — Acetato de amônio (produto da reação)', url: 'https://pubchem.ncbi.nlm.nih.gov/' }
        ]
    },
    {
        a: 'alcool_70',
        b: 'agua_sanitaria',
        severidade: 'cuidado',
        titulo: 'Álcool 70% + Água sanitária',
        mensagem: 'Em contato com hipoclorito o etanol pode oxidar e gerar pequenas quantidades de cloroformio e cloroacetona — irritantes respiratórios. Em concentração doméstica o risco é baixo, mas evitável.',
        recomendacao: 'Não misture na mesma aplicação. Limpe com um, enxágue bem, e só depois use o outro — sempre com ambiente ventilado.',
        fontes: [
            { tipo: 'literatura', referencia: 'Literatura sobre haloform reaction (etanol + hipoclorito)' },
            { tipo: 'agencia', referencia: 'CDC — Disinfectant interactions: ethanol e bleach' },
            { tipo: 'literatura', referencia: 'PubChem — Cloroformio (potencial subproduto)', url: 'https://pubchem.ncbi.nlm.nih.gov/' }
        ]
    },
    {
        a: 'alcool_46',
        b: 'agua_sanitaria',
        severidade: 'cuidado',
        titulo: 'Álcool 46° + Água sanitária',
        mensagem: 'Mesmo princípio do álcool 70%: o etanol pode reagir com hipoclorito gerando subprodutos clorados irritantes. Concentração menor reduz o risco, mas não elimina.',
        recomendacao: 'Use os produtos em momentos separados, com enxágue entre as aplicações e ambiente ventilado.',
        fontes: [
            { tipo: 'literatura', referencia: 'Literatura sobre haloform reaction (etanol + hipoclorito)' },
            { tipo: 'agencia', referencia: 'CDC — Disinfectant interactions: ethanol e bleach' },
            { tipo: 'literatura', referencia: 'PubChem — Cloroformio (potencial subproduto)', url: 'https://pubchem.ncbi.nlm.nih.gov/' }
        ]
    },
    {
        a: 'sabao_coco_liquido',
        b: 'vinagre',
        severidade: 'ineficaz',
        titulo: 'Sabão de coco líquido + Vinagre',
        mensagem: 'O vinagre neutraliza a alcalinidade do sabão de coco, anulando o poder de remoção de gordura. A mistura também pode formar grumos de ácidos graxos que deixam resíduo pegajoso.',
        recomendacao: 'Lave primeiro com o sabão e enxágue. Se for usar vinagre, aplique depois, separadamente.',
        fontes: [
            { tipo: 'literatura', referencia: 'Journal of Surfactants and Detergents — Saponificação e pH' },
            { tipo: 'literatura', referencia: 'ACS — Sabões de ácidos graxos e acidificação' }
        ]
    },
    {
        a: 'sabao_neutro_liquido',
        b: 'vinagre',
        severidade: 'ineficaz',
        titulo: 'Sabão neutro líquido + Vinagre',
        mensagem: 'A acidez do vinagre neutraliza a fórmula do sabão e reduz a capacidade de remover gordura. A combinação ainda pode embranquecer e turvar a mistura por precipitação dos tensoativos.',
        recomendacao: 'Use em momentos separados — sabão para limpar, vinagre depois, em outra aplicação.',
        fontes: [
            { tipo: 'literatura', referencia: 'Journal of Surfactants and Detergents — Sensibilidade ao pH em surfactantes neutros' },
            { tipo: 'literatura', referencia: 'ACS — Química de surfactantes: precipitação por pH' }
        ]
    }
];

// ============================================
// CÁLCULO
// ============================================

// Escala em relação à unidade base (mL ou g). Volume<->massa usa
// aproximação de densidade da água: 1 mL ≈ 1 g, 1 L ≈ 1 kg.
export const ESCALA_UNIDADE = { mL: 1, g: 1, L: 1000, kg: 1000 };

export function converterQuantidade(valor, unidadeOrigem, unidadeDestino) {
    if (unidadeOrigem === unidadeDestino) return valor;
    return valor * ESCALA_UNIDADE[unidadeOrigem] / ESCALA_UNIDADE[unidadeDestino];
}

export function obterNomeProduto(produto) {
    if (produto.produtoSelecionado === 'outro') {
        return produto.nomePersonalizado || 'Produto sem nome';
    }
    const dados = PRODUTOS_PRECADASTRADOS.find(p => p.id === produto.produtoSelecionado);
    return dados ? dados.nome : 'Produto';
}

export function calcular(produtos, proporcoes, limiteValor, limiteUnidade) {
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

// ============================================
// INCOMPATIBILIDADES — lógica de verificação
// ============================================

export function verificarIncompatibilidades(produtos) {
    const ids = produtos.map(p => p.produtoSelecionado);
    return INCOMPATIBILIDADES.filter(inc =>
        ids.includes(inc.a) && ids.includes(inc.b)
    );
}

export function temPerigoAtivo(avisos) {
    return avisos.some(a => a.severidade === 'perigo');
}

export function _maiorSeveridade(avisos) {
    if (avisos.some(a => a.severidade === 'perigo')) return 'perigo';
    if (avisos.some(a => a.severidade === 'cuidado')) return 'cuidado';
    return 'ineficaz';
}

// ============================================
// FORMATAÇÃO
// ============================================

export function formatarNumero(valor) {
    if (valor >= 100) return valor.toFixed(0);
    if (valor >= 10) return valor.toFixed(1);
    if (valor >= 1) return valor.toFixed(2);
    return valor.toFixed(3);
}
