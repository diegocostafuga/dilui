# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Diluí** — a single-page chemical-cleaning dilution calculator in Brazilian Portuguese. The user picks N products (2–5), assigns each one a substance and physical state, enters a ratio (e.g. `1/10` or `1/2/5`) and a total volume, and gets the per-product breakdown.

The UI, comments, and identifiers throughout the codebase are in **Portuguese (pt-BR)**. Match the existing language when adding code; mixing English identifiers into the Portuguese codebase reads as inconsistent.

## Stack & commands

Pure static site — no build step, no package manager, no tests. Three files do everything: [index.html](index.html), [script.js](script.js), [styles.css](styles.css).

- **Local dev:** `python3 -m http.server 8000` from the project root, then open `http://localhost:8000`. Any static server works; live-reload is not configured.
- **Deploy:** project is linked to Vercel (see [.vercel/project.json](.vercel/project.json)). `vercel` for preview, `vercel --prod` for production. There is no `vercel.json` — Vercel auto-detects the static site.
- **Syntax sanity-check JS:** `node -e "new Function(require('fs').readFileSync('script.js','utf8'))"`

## Architecture

### Single state machine, no framework

[script.js](script.js) is one module that hand-rolls a step-based wizard. Two top-level singletons drive everything:

- `estado` — the entire app state: `passoAtual` (0–5), `quantidadeProdutos`, `produtos[]`, `proporcao` + `proporcaoValida`, `limite { valor, unidade }`. Mutated in place.
- `dom` — cached `getElementById` / `querySelectorAll` refs, populated once at script load.

Steps are `<section class="step" data-step="N">` blocks in [index.html](index.html). `irParaPasso(n, direcao)` toggles the `.active` class to swap which one is visible; the `back-direction` class flips the slide animation. Step 0 is the welcome screen (progress bar hidden); steps 1–4 are the wizard (progress bar visible); step 5 is results. `reiniciar()` returns to step 1, **not** step 0 — the welcome screen is intentionally only shown on first load.

### Re-render on every change

Product cards in step 2 are not surgically updated. Any change to a product (`atualizarProduto`) calls `renderizarProdutos()`, which wipes `productsList.innerHTML` and rebuilds every card from `estado.produtos`. This is fine at this scale and keeps the DOM in sync with state without diffing — but it means **DOM-attached state (focus, selection, transient input) is lost on re-render**. If you add a field that needs to survive a re-render, store it in `estado.produtos[i]` first.

### Configuration is data at the top of script.js

`PRODUTOS_PRECADASTRADOS`, `UNIDADES`, and `PROPORCOES_SUGERIDAS` are plain arrays/objects at the top of [script.js](script.js). Adding a new pre-set product or ratio suggestion is a one-line edit there — no other file needs to change. The `'outro'` product id is special-cased to reveal a custom-name input; preserve that behavior if you reorder the list.

### Validation pattern

Inline error UI, not `alert()`. The convention:

1. Add `.error` class to the offending input (red border + `--error-bg`, defined in [styles.css](styles.css)).
2. Set text on a sibling `<p class="error-msg" role="alert">` and toggle `.visible` on it.
3. Clear both as soon as the user's next input makes the field valid.

The ratio step ([script.js](script.js) `validarProporcao` / `mostrarErroProporcao`) and the products step (`mostrarErroProdutos` / `limparErroProdutos`) both follow this pattern. Don't introduce `alert()` / `confirm()` for validation — the project deliberately moved away from them.

### Calculation

`calcular(produtos, proporcoes, limiteValor, limiteUnidade)` is pure: sum the ratio parts, divide the limit by the sum to get one "part" in target units, multiply each ratio number by that. Unit conversion is **not** performed — the chosen `limiteUnidade` is reused verbatim for every result. Mixing liquid + powder products in a single mixture is allowed and `sugerirUnidadeLimite()` widens the limit-unit dropdown to all four units when types are mixed.

## Conventions

- Portuguese identifiers (`estado`, `produtos`, `avancar`, `voltar`, `proporcao`). User-facing strings are also in Portuguese.
- Selectors are driven by `data-*` attributes (`data-step`, `data-action`, `data-field`, `data-count`, `data-ratio`, `data-limit`, `data-unit`, `data-idx`) rather than ad-hoc IDs or classes. Add new interactions the same way and wire them in `registrarEventos()`.
- Buttons use `data-action="next|back|calculate|restart|start"` and are dispatched centrally in `registrarEventos()`. Add a new action by extending that switch rather than attaching an ad-hoc listener.
