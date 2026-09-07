# Proiezione Netto da RAL — Product Builder @ Jet HR

Calcolatore web che parte da una **RAL** e stima **netto annuale**, **netto mensile** e le **trattenute** (INPS + IRPEF + addizionali) per un caso standard.

**Profilo modellato:** impiegato a tempo indeterminato, residente a Milano, senza agevolazioni.

> Stima indicativa per dimostrare comprensione del dominio. Non sostituisce un cedolino.

## Demo locale

```bash
pnpm install
pnpm dev
```

Apri [http://localhost:3000](http://localhost:3000).

```bash
pnpm test      # unit test sul motore fiscale
pnpm build    # build produzione
```

## Come funziona il calcolo (2026)

```
RAL
 − contributi INPS dipendente (9,19%)
 = imponibile IRPEF
 → IRPEF lorda (scaglioni 23% / 33% / 43%)
 − detrazioni lavoro dipendente (art. 13 TUIR)
 − detrazione aggiuntiva 20k–40k (L. 207/2024)
 − trattamento integrativo (se spettante)
 + addizionale regionale Lombardia
 + addizionale comunale Milano (0,8%, esente ≤ €23.000)
 = trattenute totali
 → netto annuale / mensilità (12 · 13 · 14)
```

### Logiche implementate

| Voce | Scelta del prototipo |
| --- | --- |
| INPS dipendente | 9,19% flat sulla RAL |
| IRPEF | Scaglioni 2026 (seconda aliquota al **33%**, L. 199/2025) |
| Detrazioni | Art. 13 TUIR + ulteriore €65 (25k–35k) + detrazione L.207/2024 |
| Lombardia | Scaglioni 1,23% / 1,58% / 1,72% / 1,73% |
| Milano | 0,8% con esenzione fino a €23.000 |
| Mensilità | Default **13** (tipico CCNL), configurabile |

### Cosa è fuori scope (di proposito)

- Familiari a carico, part-time, apprendistato, dirigenti
- Agevolazioni (impatriati, under 36, ecc.)
- Fringe benefit, buoni pasto, straordinari, welfare
- TFR in busta (matura a parte)
- Differenze CCNL / massimali contributivi precisi

Ogni semplificazione è documentata in-app nella sezione *Ipotesi e semplificazioni*.

## Struttura

```
src/
  lib/tax/           ← motore puro, testabile, senza UI
    calculate.ts
    constants.ts
    format.ts
    types.ts
    calculate.test.ts
  components/
    calculator/      ← UI del prototipo (shadcn)
  app/               ← pagina Next.js
```

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + **shadcn/ui**
- Vitest per il motore fiscale

## Fonti

- [Agenzia delle Entrate — Aliquote IRPEF](https://www.agenziaentrate.gov.it/portale/imposta-sul-reddito-delle-persone-fisiche-irpef-/aliquote-e-calcolo-dell-irpef-cittadini)
- [MEF — Addizionali IRPEF](https://www.finanze.gov.it/opencms/it/fiscalita-locali/addizionali-irpef/)
- Regione Lombardia — addizionale regionale
- Comune di Milano — addizionale comunale
- Prassi INPS — aliquota IVS dipendente privato

## Autore

Prototipo realizzato per il take-home **Product Builder @ Jet HR**.
