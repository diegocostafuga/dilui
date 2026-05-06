# Alertas de incompatibilidade: bloquear em `perigo` por padrão

**Status:** Aceito · _2026-05-06_

## Contexto

Implementamos o MVP de alertas de incompatibilidade química ([#6](https://github.com/diegocostafuga/dilui/issues/6)). Quando o usuário seleciona dois produtos cuja mistura é perigosa (ex: água sanitária + peróxido), precisávamos decidir como o app reage:

- **Apenas avisar** o usuário, deixando ele continuar livremente
- **Bloquear** o avanço até ele confirmar explicitamente que entende o risco
- **Não fazer nada** e confiar na responsabilidade do usuário

O Diluí lida com produtos químicos cuja mistura errada pode liberar gás de cloro, causar queimaduras químicas ou reações exotérmicas com respingos quentes. Erro nesse fluxo tem consequência física real e potencial de processo legal contra o app.

A maior parte dos usuários do público-alvo (faxineiras, donas de casa) não tem formação química — não pode-se assumir que entendem a gravidade só pela cor de um banner.

## Decisão

Para severidade `perigo`, o botão **"Próximo" do passo 2 fica desabilitado** até o usuário marcar explicitamente um checkbox **"Estou ciente do risco"**. A ciência é resetada sempre que muda um produto da mistura — cada combinação perigosa nova exige nova confirmação.

Para severidades `cuidado` e `ineficaz`, apenas o banner aparece, sem bloqueio.

## Alternativas consideradas

### Apenas avisar (banner sem bloqueio)

**Por que descartado:** atrito visual sem custo de ação resulta em "banner blindness" — o usuário aprende a ignorar avisos vermelhos. Estudos de UX em sistemas críticos (formulários médicos, bancos) mostram que aviso passivo é desconsiderado em 70%+ dos casos quando o caminho positivo continua disponível.

### Bloquear sem checkbox (impedir totalmente a mistura)

**Por que descartado:** remove autonomia de quem sabe o que faz (química profissional em ambiente controlado). Cria caminho sem volta, força workaround (usuário troca o produto, faz o cálculo, volta o produto).

### Modal/popup intrusivo

**Por que descartado:** convenção do projeto é não usar `alert()` / `confirm()` — toda validação tem que ser inline, com `.error` / `.error-msg`. Modal de aviso quebra o flow visual da página e tem fricção de fechar.

### Confirmação dupla (dois cliques)

**Por que descartado:** sobrecarga sem ganho de segurança. Quem ignora o primeiro clique ignora o segundo.

## Consequências

### Habilita
- **Defaults seguros para o público leigo** — usuário novo não consegue acidentalmente prosseguir com mistura perigosa sem ter que parar e ler.
- **Caminho explícito de ciência** — checkbox marcado é evidência de que o usuário foi informado, mitigando risco legal.
- **Espaço para evolução** — futura preferência configurável ([#8](https://github.com/diegocostafuga/dilui/issues/8)) parte deste padrão como `'bloquear'` (default), permitindo `'avisar'` e `'silenciar'` como opt-in consciente.

### Bloqueia / custa
- **Atrito recorrente** para uso profissional — alguém que mistura água sanitária com detergente várias vezes por dia (ambiente controlado) é interrompido toda vez. Mitigado pela issue [#8](https://github.com/diegocostafuga/dilui/issues/8) (preferência configurável com revelação progressiva).
- **Estado adicional** (`estado.cienteIncompatibilidade`) que precisa ser resetado em vários pontos do fluxo (quando muda produto, quando reinicia, quando carrega mistura via link). Já é um cuidado real no MVP — qualquer feature que leia/edite produtos precisa lembrar de resetar.

### Quando revisitar
- Se métricas (pós-backend) mostrarem que **>30% dos usuários** marcam o checkbox e prosseguem rotineiramente, é sinal de que o atrito está virando ruído. Considerar tornar `'avisar'` (banner sem bloqueio) o novo default para usuários experientes.
- Se **incidente real** (usuário se machucou seguindo o app) ocorrer mesmo com bloqueio em vigor, considerar bloqueio mais forte: impedir totalmente para classes específicas de mistura, sem opção de override.

## Relacionado

- Issue [#6](https://github.com/diegocostafuga/dilui/issues/6) — MVP de alertas (implementação)
- Issue [#8](https://github.com/diegocostafuga/dilui/issues/8) — Preferência configurável + revelação progressiva (evolução)
- Issue [#7](https://github.com/diegocostafuga/dilui/issues/7) — Curadoria dos pares com fonte técnica (pré-requisito de produção)
- Commit [`8dfbbfb`](https://github.com/diegocostafuga/dilui/commit/8dfbbfb) — implementação do MVP
