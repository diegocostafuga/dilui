# Diluí – Roadmap de Features

> Documento vivo de planejamento do produto. Atualizar conforme as features são implementadas, descartadas ou repriorizadas.

**Última atualização:** 06 de maio de 2026
**Estágio atual:** Prototipagem inicial (cliente apenas, localStorage)

---

## 🧪 Sobre o projeto

**Diluí** é uma calculadora web mobile-first para cálculo de proporções de diluição de produtos químicos de limpeza. Resolve a dificuldade comum de interpretar instruções como *"diluir na proporção 1/10"* e calcular quanto usar de cada componente respeitando o limite do recipiente.

**Visão de futuro:** evoluir para um SaaS completo de gestão de limpeza doméstica e profissional, do qual a calculadora será um dos módulos.

---

## ✅ Features já implementadas

### 1. Calculadora de proporções
- Suporte a 2-5 produtos por mistura
- 11 produtos pré-cadastrados (Multiuso, Desinfetante, Água sanitária, etc.) + opção "Outro" para entrada livre
- Toggle entre estado físico líquido (mL/L) e pó/sólido (g/kg)
- Proporções com sugestões adaptativas (ex: 1/10, 1/2/5)
- Limite total com presets (250mL, 500mL, 1L, 5L) ou personalizado
- Cálculo proporcional preciso com cards de resultado animados
- Resultado respeita a unidade de cada produto (líquido em mL/L, pó em g/kg) com conversão automática a partir da unidade do limite — aproximação 1:1 (densidade da água) por simplicidade

### 2. Fluxo de passos navegável
- 4 passos sequenciais com transições fluidas (slide horizontal)
- Barra de progresso preenchendo aos poucos
- Botões "Voltar" em cada passo, atalho Enter para avançar
- Validação por passo (botão Próximo desabilita até estar válido)

### 3. Tela inicial (welcome)
- Logo, tagline e introdução curta
- Botão "Iniciar cálculo"
- Reaparece a cada acesso (no futuro: rota dentro do SaaS)

### 4. Sistema de autenticação local
- Cadastro/login com email e senha (localStorage)
- Modo convidado (sem cadastro) ou usuário autenticado
- Avatar com inicial no header quando logado
- Disclaimer de transparência: *"dados ficam apenas neste navegador"*
- ⚠️ **Migração futura:** trocar `storage.js` por integração com backend real (Supabase/Firebase/custom)

### 5. Histórico de misturas
- Salvamento automático de cada cálculo (apenas se logado)
- Modal acessível pelo menu da conta
- Últimas 20 misturas com data relativa ("há 2 horas", "ontem", etc.)
- Botão "Refazer" restaura tudo e vai direto pro resultado
- Botão "Remover" com confirmação

### 6. Favoritos de produtos
- Estrela ao lado do select (visível apenas quando logado)
- Produtos favoritados sobem para o topo da lista
- Marcador visual ★ no nome

---

## 🎯 Features candidatas (backlog priorizado)

### 🚨 Alertas de incompatibilidade química

**Status:** 🟢 Recomendada para próxima iteração
**Esforço:** Pouco (MVP par-a-par) / Médio (com curadoria expandida e modal técnico)
**Impacto:** Alto — segurança física do usuário

**Descrição**
Quando o usuário seleciona dois produtos cuja mistura é perigosa, contraindicada ou simplesmente ineficaz (ex: água sanitária + peróxido, água sanitária + detergente com amônia), o app exibe um aviso visual proeminente já no passo 2 (escolha de produtos) e reforça no resultado final. Foco em proteger fisicamente o usuário antes de qualquer outra coisa.

**Como funciona (MVP)**
- Tabela `INCOMPATIBILIDADES` no topo de [script.js](script.js), ao lado de `PRODUTOS_PRECADASTRADOS`
- Cada item do array tem: `a`, `b` (ids dos produtos), `severidade` (`perigo` | `cuidado` | `ineficaz`), `mensagem` curta, `recomendacao` prática
- Função `verificarIncompatibilidades(produtos)` é chamada dentro de `atualizarProduto()` e retorna a lista de avisos ativos
- Banner inline acima dos cards do passo 2, cor + ícone + texto por severidade:
  - 🔴 vermelho = perigo (não misture)
  - 🟡 âmbar = cuidado (use EPI, ambiente ventilado)
  - ⚪ cinza = ineficaz (combinação anula efeito)
- O mesmo banner reaparece no card de resultados (passo 5) como lembrete antes do uso real
- Banner respeita a convenção do projeto: classe `.error` / `.error-msg` no padrão atual, **sem `alert()` / `confirm()`**
- Para severidade `perigo`, **bloqueia o cálculo por padrão** — exige checkbox "Estou ciente do risco" antes de habilitar Próximo. Severidades `cuidado` e `ineficaz` apenas mostram o banner sem bloquear o fluxo

**Preferência de comportamento (autonomia do usuário)**
A regra de bloquear em `perigo` é o padrão seguro, mas o usuário pode ajustá-la — alguém que trabalha com química profissional em ambiente controlado não deve ser interrompido toda vez. Modelo:

- Estado `preferenciaAlertasPerigo` salvo em [storage.js](storage.js) com 3 valores:
  - `'bloquear'` — padrão. Mostra banner + exige checkbox "Estou ciente" antes de Próximo
  - `'avisar'` — mostra banner mas libera Próximo direto
  - `'silenciar'` — não mostra alerta de `perigo` (`cuidado`/`ineficaz` continuam visíveis)
- Persistência: `localStorage` para convidado e logado por enquanto; migra junto com o resto quando virar backend
- Acessível e reversível em qualquer momento via item **"Segurança / Alertas"** no menu da conta — nunca pode ser caminho sem volta

**Como o usuário descobre essa preferência**
Para evitar que alguém clique em `silenciar` no impulso só pra se livrar do popup na primeira vez, a oferta das 3 opções é progressiva:

1. **Primeira aparição de alerta `perigo`**: só o banner + checkbox "Estou ciente". Atrito mínimo, sem opção de silenciar ainda
2. **A partir da 2ª–3ª vez** que o usuário marcar "ciente": aparece um link discreto no banner — *"trabalha com isso com frequência? ajuste como os alertas aparecem"* — abrindo modal com as 3 opções (radio + texto explicando consequência de cada uma)
3. **Sempre disponível depois** em "Configurações > Alertas", para reverter

**Versionamento dos alertas (futuro próximo)**
Quando publicarmos um par crítico novo, quem está em `silenciar` precisa ser notificado — senão alguém que silenciou em 2026 nunca vê alertas adicionados depois. Solução: campo `versaoAlertasReconhecida` no perfil; ao detectar versão maior, retroceder para `avisar` automaticamente uma única vez, com toast explicativo ("novos riscos foram catalogados — revise em Configurações").

**Pares iniciais relevantes ao catálogo atual (a curar com fonte)**
- 🔴 Água sanitária + Peróxido de hidrogênio → reação exotérmica liberando oxigênio
- 🔴 Água sanitária + Detergente / Amaciante → risco de gás de cloro (alguns têm amônia)
- 🟡 Soda cáustica + qualquer ácido → reação exotérmica forte, queimaduras
- 🟡 Soda cáustica + Peróxido → oxidação acelerada
- ⚪ Bicarbonato + Vinagre (quando adicionado ao catálogo) → reação ácido-base anula efeito de limpeza

**Por que é estratégica**
- Único item do backlog que **protege fisicamente o usuário** — diferencial sério em app de produtos químicos
- Reduz risco reputacional / legal se alguém se machucar seguindo um cálculo do app
- Casa com a nota histórica do roadmap sobre "Receitas prontas" (postergada justamente porque *"algumas misturas caseiras são perigosas — água sanitária + amoníaco solta gás tóxico"*)
- Pavimenta features futuras: receitas seguras curadas, página técnica por produto, integração com FISPQ/Anvisa, modo profissional

**Caminho evolutivo (pós-MVP)**
- Botão "Saiba mais" no banner → modal com explicação química, EPI recomendado e fontes
- Detecção por **classe química** ao invés de par-a-par: cadastrar cada produto como hipoclorito / ácido / base forte / oxidante / surfactante, e derivar incompatibilidades por regra (escala muito melhor quando o catálogo crescer)
- Página de detalhes técnicos por produto (pH, classe, EPI, link FISPQ do fabricante)
- Modo "uso profissional" com texto técnico vs modo "doméstico" com linguagem leiga
- Reaproveitar a base na futura biblioteca de receitas prontas (filtro automático: receitas que disparariam alerta não são publicáveis)

**Cuidados**
- **Curadoria com fonte confiável obrigatória**: Anvisa, FISPQ dos fabricantes, literatura de química de limpeza. Não inventar avisos — falso positivo erode confiança, falso negativo machuca pessoa
- Tom dos textos: alertar sem causar pânico, sempre acompanhado de recomendação prática ("não misture X com Y; se precisar dos dois, use em momentos diferentes e enxágue entre")
- Acessibilidade: cor + ícone + texto (não apenas cor) — daltonismo e leitores de tela
- Compartilhamento via link: se uma mistura compartilhada disparar alerta, mostrar logo ao carregar — não esconder o risco em link recebido

**Decisões já fechadas**
- ✅ Bloquear em `perigo` por padrão, com checkbox "Estou ciente"
- ✅ Preferência de comportamento (3 opções) revelada progressivamente, não no primeiro encontro
- ✅ Configuração persistente em `localStorage`, sempre reversível em "Configurações > Alertas"

**Decisões a fechar antes de implementar**
- Onde guardar o disclaimer legal ("informativo, não substitui orientação técnica") — rodapé do banner ou modal único de boas-vindas?
- Lista de fontes a consultar para a curadoria inicial dos pares (Anvisa, FISPQ específicas, papers)
- Limiar exato de "2ª–3ª vez" para revelar as opções avançadas — fixar em 3 ou tornar configurável depois

---

### 🔥 Compartilhar mistura via link

**Status:** 🟢 Recomendada para próxima iteração
**Esforço:** Pouco
**Impacto:** Alto

**Descrição**
Botão "Compartilhar" na tela de resultado que gera uma URL contendo a mistura completa. Quem abre o link vê a calculadora pré-preenchida com aquela receita.

**Como funciona**
- URL com query params (ex: `?m=2-multiuso-liquido-mL_agua-liquido-mL-1/10-500-mL`)
- Encoding compacto para URLs curtas
- Validação ao carregar (URL malformada → erro amigável)
- Botão extra: "Compartilhar no WhatsApp" com texto pronto

**Por que é estratégica**
- Único item do backlog com **efeito de rede** (usuários atraem novos usuários)
- Em prototipagem, compartilhamentos são o melhor sinal de tração
- Alinhada com o canal nº 1 do público-alvo brasileiro (WhatsApp)
- Não precisa de backend — funciona inteiro com URL

**O que não inclui (pra não escopar demais)**
- Encurtamento de URL (bit.ly etc.) — fica pra depois
- Analytics de cliques — fica pra depois com backend

---

### 🔥 PWA (Progressive Web App)

**Status:** 🟡 Forte candidata
**Esforço:** Médio
**Impacto:** Alto

**Descrição**
Transformar o site em app instalável no celular. Após visitar 1-2 vezes, o navegador oferece "Adicionar à tela inicial". Abre em tela cheia, sem barra de navegador, com ícone próprio. Funciona offline (cache do service worker).

**O que precisa**
- `manifest.json` com nome, ícone, cores
- Conjunto de ícones PNG (192px, 512px, maskable)
- Service worker com estratégia de cache (cache-first para assets, network-first para dados)
- Splash screen automática
- Detecção de modo standalone para esconder elementos web (ex: footer)

**Por que é estratégica**
- Sensação imediata de "produto pronto" — fundamental em demos
- Engajamento sobe muito com app instalado vs. site no navegador
- Diferencial competitivo no público mobile (faxineiras, donas de casa)
- Caminho natural para notificações push depois (reembalagem mensal, lembretes de estoque)

**Cuidados**
- Service worker mal configurado pode "travar" versões antigas — testar bem
- Ícones precisam ter qualidade boa em vários tamanhos
- iOS tem limitações específicas (testar em Safari)

---

### 🔥 Calculadora de custos / orçamento

**Status:** 🟡 Forte candidata
**Esforço:** Médio
**Impacto:** Alto

**Descrição**
Cada produto pode ter um preço cadastrado (ex: R$ 12,50 por 5L de Multiuso). A calculadora exibe quanto custa a mistura final, e quanto se economiza diluindo vs. comprando produto pronto.

**O que precisa**
- Campo opcional de preço em cada produto (com unidade e quantidade base)
- Persistência dos preços por usuário (localStorage por enquanto)
- Card de "Custo total" no resultado, ao lado do "Total da mistura"
- Comparativo: "Custo por mL" da diluição vs. de um produto pronto equivalente
- Talvez histórico de preços (subiu? desceu?)

**Por que é estratégica**
- Valor percebido enorme — economiza dinheiro real
- Diferenciação clara — calculadoras genéricas não fazem isso
- Plausível como feature premium no futuro (paywall)
- Conecta com o tema "limpeza profissional" (faxineiras precisam fazer orçamento)

**Cuidados**
- Adicionar preço no fluxo sem complicar a UX
- Decidir: preço editável a cada cálculo ou pré-cadastrado?

---

### 4. Marcas + controle de estoque

**Status:** 🔴 Postergar (até depois de tração inicial)
**Esforço:** Alto
**Impacto:** Médio

**Descrição**
Cada produto pode ter marca (ex: "Veja Multiuso", "Pinho Sol"). Usuário cadastra estoque (quanto tem em casa) e a calculadora avisa quando vai acabar.

**Por que postergar**
- Alta complexidade de modelo de dados (produto × marca × estoque × histórico de uso)
- Sem validação de tração ainda, pode ser feature que ninguém usa
- Pré-requisito: ter base de marcas brasileiras populares cadastradas (trabalho de curadoria)

**Quando reconsiderar**
- Quando tivermos 100+ usuários ativos pedindo isso
- Quando virar SaaS de fato (com backend)

---

### 5. Onboarding interativo

**Status:** 🔴 Polimento (não urgente)
**Esforço:** Pouco
**Impacto:** Baixo

**Descrição**
Tour guiado na primeira visita explicando cada passo da calculadora com tooltips e destaques.

**Por que postergar**
- A calculadora já é bastante intuitiva (4 passos claros, validação visível)
- Adicionar isso agora é otimização prematura
- Melhor coletar feedback de usuários reais para descobrir onde tropeçam *antes* de gastar tempo num tour

**Quando reconsiderar**
- Se métricas mostrarem que muita gente abandona no passo 1 ou 2
- Quando expandirmos pra mais features (aí sim vale guiar)

---

### 6. Receitas prontas (biblioteca)

**Status:** 🔴 Postergar
**Esforço:** Alto
**Impacto:** Médio

**Descrição**
Biblioteca de "receitas famosas" de mistura: limpa-piso, desinfetante natural, removedor de mofo, etc. Usuário escolhe uma receita pronta e ajusta o limite.

**Por que postergar agora**
- É mais sobre **conteúdo e curadoria** do que sobre desenvolvimento
- Precisa de pesquisa séria (algumas misturas caseiras são perigosas — água sanitária + amôniaco solta gás tóxico)
- Distração na fase de validação do produto

**Quando reconsiderar**
- Pode ser excelente conteúdo de SEO no futuro
- Boa porta de entrada de novos usuários (busca "como fazer desinfetante caseiro" → cai na receita → conhece a calculadora)

---

### 7. Densidade real por produto (precisão de conversão volume↔massa)

**Status:** 🔴 Polimento (não urgente)
**Esforço:** Pouco
**Impacto:** Baixo na prototipagem / Médio em uso profissional

**Descrição**
Hoje a conversão entre volume e massa (mL ↔ g, L ↔ kg) usa aproximação 1:1 (densidade da água). Funciona bem para limpeza doméstica, mas é impreciso para produtos como soda cáustica em pó, cloro concentrado e detergentes muito viscosos — densidades reais variam significativamente.

**Como funcionaria**
- Adicionar campo `densidade` (g/mL) em cada item de `PRODUTOS_PRECADASTRADOS`
- Estender `converterQuantidade(valor, origem, destino, densidade)` para aplicar a densidade apenas em conversões cross-categoria (volume↔massa); conversões dentro da mesma categoria continuam puramente de escala
- Produtos "Outro" mantêm densidade 1.0 (ou, em modo avançado, o usuário pode informar)
- Eventualmente: tabela de densidades de referência para os principais produtos brasileiros

**Por que postergar**
- A aproximação 1:1 é mais que suficiente para o público-alvo atual (limpeza doméstica)
- Pesquisar densidades reais e curar a tabela é trabalho de fundo que não desbloqueia ninguém
- Sem reclamação de imprecisão de usuário real ainda

**Quando reconsiderar**
- Se o produto migrar para mercado profissional (faxina industrial, química técnica)
- Se algum usuário reportar resultado discrepante o suficiente para causar problema prático
- Em uma rodada de "polimento de cálculos" depois do MVP

---

## 🔮 Visão de longo prazo (post-prototipagem)

Ideias que fazem sentido **depois** da fase de validação inicial:

### Backend e SaaS real
- Migração do `storage.js` para API real (Supabase é forte candidato)
- Sincronização entre dispositivos
- Recuperação de senha por email
- Login social (Google, Apple)

### Múltiplos módulos do site
- Calculadora de diluição (atual) — módulo 1
- Gestão de estoque de produtos — módulo 2
- Lista de tarefas de limpeza por cômodo — módulo 3
- Cálculo de tempo de limpeza por área (m²) — módulo 4

> **Nota histórica:** a ideia inicial do projeto incluía cálculo de **área a limpar** e **tempo necessário**. Esse escopo foi pivotado para foco em **diluição** primeiro, mas continua válido como módulo futuro.

### Internacionalização
- Português (atual)
- Espanhol (mercado LatAm é grande pra produtos de limpeza)
- Inglês (mercado global)

### Monetização (longo prazo)
- Free tier: 5 cálculos/dia, sem histórico, sem favoritos
- Pro tier: ilimitado, custos, marcas, estoque, sincronização
- B2B: planos para empresas de faxina (multi-conta, relatórios)

### Notificações push (com PWA)
- "Você está há 30 dias sem comprar Multiuso — chegando ao fim?"
- "Nova receita publicada: Desinfetante natural com casca de laranja"

### Integrações
- Compartilhamento direto: WhatsApp (já listado), Instagram Stories
- Compras: link para Mercado Livre/Amazon nos produtos cadastrados
- IA: foto da embalagem → leitura automática da diluição recomendada

---

## 📊 Critérios de priorização usados

Em fase de **prototipagem**, priorizamos features que:

1. ✅ **Validam hipóteses do produto** — descobrem se a ideia funciona com usuários reais
2. ✅ **Aumentam sensação de produto pronto** — fazem demos brilharem
3. ✅ **Testam decisões técnicas** antes de escalar
4. ✅ **Não bloqueiam pivôs** — não criam dívida técnica difícil de desfazer

Features que **NÃO fazem sentido agora**: pagamentos, multi-tenant, integrações pesadas, mobile nativo. Tudo isso é fase de produto, não de protótipo.

---

## 📋 Como usar este documento

- **Marcar como ✅ implementada** quando concluir uma feature
- **Mover para "implementadas"** com data de release
- **Repriorizar livremente** conforme aprendemos com usuários reais
- **Adicionar novas ideias** na seção de candidatas, sempre justificando esforço/impacto
- **Revisar mensalmente** durante o protótipo, trimestralmente depois do MVP
