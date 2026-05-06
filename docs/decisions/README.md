# Decisões arquiteturais (ADRs)

Cada arquivo aqui registra **uma decisão de design ou arquitetura**, com o contexto da época em que foi tomada e as alternativas consideradas. ADRs respondem _"por que escolhemos X?"_ meses depois, quando o autor original já não está disponível ou esqueceu o motivo.

## Quando criar um ADR

Crie um ADR quando a decisão:

- **Não é óbvia** a partir do código (algum outro time chegando ao projeto teria perguntado "por quê?")
- **Tem alternativa real** que foi descartada (não vale registrar "escolhemos JS porque é o que existe pro browser")
- **É difícil de reverter** ou tem custo de mudança alto
- Envolve **trade-off explícito** (segurança vs. velocidade, simplicidade vs. flexibilidade, etc.)

Não crie ADR pra cada PR. Eles são raros, valiosos e duráveis.

## Formato

Cada ADR é um arquivo Markdown com nome `YYYY-MM-DD-titulo-curto-em-kebab.md`. A data fixa o contexto temporal (que tecnologias estavam disponíveis, qual era o estágio do projeto). O título não muda mesmo se a decisão depois for substituída.

Estrutura recomendada:

```markdown
# Título da decisão

**Status:** Aceito · _data_

## Contexto
O que estava acontecendo. Quais restrições existiam.

## Decisão
O que foi escolhido, em uma frase.

## Alternativas consideradas
Cada alternativa real e por que foi descartada.

## Consequências
O que essa decisão habilita, o que ela bloqueia, o que vai precisar mudar quando ela for revisitada.
```

## Substituindo um ADR

ADRs **não são editados** (exceto erros tipográficos). Se a decisão muda, crie um ADR novo que **substitui** o anterior:

```markdown
# Título novo

**Status:** Aceito · _2027-01-15_ · Substitui [2026-05-06-x.md](2026-05-06-x.md)
```

E atualize o ADR antigo:

```markdown
**Status:** Substituído por [2027-01-15-y.md](2027-01-15-y.md) · _2027-01-15_
```

Assim o histórico de decisões fica navegável.

## Por que não issues / wiki / Notion?

- **Issues** mudam de estado (open/closed) e somem da vista. ADRs são imutáveis.
- **Wiki** é editável por todos sem rastro de versão. ADRs precisam estar no git.
- **Notion** é fora do repo. ADRs precisam viajar com o código que descrevem.

## ADRs deste projeto

| Data | Título | Status |
|---|---|---|
| 2026-05-06 | [Alertas de incompatibilidade: bloquear em `perigo` por padrão](2026-05-06-alertas-bloqueio-padrao.md) | Aceito |
