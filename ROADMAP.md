# Diluí – Roadmap

> Documento estratégico, alta granularidade. Para o backlog operacional ver as **[Issues](https://github.com/diegocostafuga/dilui/issues)**.

**Estágio atual:** Prototipagem inicial (cliente apenas, localStorage, sem backend) · _atualizado em 07 de maio de 2026_

---

## 🧪 Sobre o projeto

**Diluí** é uma calculadora web mobile-first para cálculo de proporções de diluição de produtos químicos de limpeza. Resolve a dificuldade comum de interpretar instruções como _"diluir na proporção 1/10"_ e calcular quanto usar de cada componente respeitando o limite do recipiente.

**Visão de futuro:** evoluir para um SaaS completo de gestão de limpeza doméstica e profissional, do qual a calculadora será um dos módulos.

---

## 📍 Como o trabalho é organizado

| Camada | Onde | Cadência |
|---|---|---|
| **Visão estratégica** (este arquivo) | `ROADMAP.md` | Muda raramente |
| **Backlog operacional** | [GitHub Issues](https://github.com/diegocostafuga/dilui/issues) com labels `area:*`, `priority:*`, `status:*`, `type:*` | Muda toda semana |
| **Decisões arquiteturais** | [`docs/decisions/`](docs/decisions/) (formato ADR, imutáveis após escritas) | Aditiva |

**Atalhos úteis:**
- 🟢 [Issues prontas pra implementar](https://github.com/diegocostafuga/dilui/issues?q=is%3Aopen+label%3Astatus%3Aready) (`status:ready`)
- 🎨 [Issues em design](https://github.com/diegocostafuga/dilui/issues?q=is%3Aopen+label%3Astatus%3Adesign) (`status:design`)
- ✅ [Features já implementadas](https://github.com/diegocostafuga/dilui/issues?q=is%3Aclosed+label%3Astatus%3Adone) (closed + `status:done`)
- 🔥 [Prioridade alta](https://github.com/diegocostafuga/dilui/issues?q=is%3Aopen+label%3Apriority%3Ap1) (`priority:p1`)

---

## 🎯 Próximas prioridades (resumo)

A lista canônica está nas issues. Aqui só o panorama:

1. **Curadoria técnica dos pares de incompatibilidade** ([#7](https://github.com/diegocostafuga/dilui/issues/7)) — bloqueia o lançamento público; precisa fontes (Anvisa, FISPQ, NIOSH)
2. **Calculadora de custos / orçamento** ([#9](https://github.com/diegocostafuga/dilui/issues/9)) — feature de alto valor percebido

Tudo abaixo de `priority:p3` é polimento e fica para depois da tração inicial.

---

## 📊 Critérios de priorização (fase de prototipagem)

1. ✅ **Validam hipóteses do produto** — descobrem se a ideia funciona com usuários reais
2. ✅ **Aumentam sensação de produto pronto** — fazem demos brilharem
3. ✅ **Testam decisões técnicas** antes de escalar
4. ✅ **Não bloqueiam pivôs** — não criam dívida técnica difícil de desfazer

Features que **NÃO fazem sentido agora**: pagamentos, multi-tenant, integrações pesadas, mobile nativo. Tudo isso é fase de produto, não de protótipo.

---

## 🔮 Visão de longo prazo (post-prototipagem)

Ideias que fazem sentido **depois** da fase de validação inicial. Não viram issues ainda — apenas direção.

- **Backend e SaaS real** — migração do `storage.js` para API real (Supabase é forte candidato), sincronização entre dispositivos, recuperação de senha por email, login social
- **Múltiplos módulos** — calculadora de diluição (atual) + gestão de estoque + lista de tarefas por cômodo + cálculo de tempo de limpeza por área (m²)
  > _Nota histórica:_ a ideia inicial do projeto incluía cálculo de **área a limpar** e **tempo necessário**. Esse escopo foi pivotado para foco em **diluição** primeiro, mas continua válido como módulo futuro.
- **Internacionalização** — Português (atual) → Espanhol (mercado LatAm) → Inglês (global)
- **Monetização** — Free tier (5 cálculos/dia), Pro tier (ilimitado, custos, marcas, estoque, sync), B2B (planos para empresas de faxina)
- **Notificações push (com PWA)** — lembretes de reposição, novas receitas
- **Integrações** — Instagram Stories, Mercado Livre/Amazon nos produtos cadastrados, IA para ler diluição diretamente da foto da embalagem

---

## 📋 Como usar este documento

- **Mudou de visão estratégica?** Edite aqui. Se for grande, faz PR.
- **Decisão arquitetural?** Cria um ADR em [`docs/decisions/`](docs/decisions/). Não edita decisão antiga — cria uma nova que substitui.
- **Backlog operacional?** Cria issue. **Não** documenta features candidatas neste arquivo — elas vão pras issues.
- **Tarefa fechada?** Marca a issue como closed com label `status:done`. Não move pra cá.
