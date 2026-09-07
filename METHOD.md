# Metodologia — Product Builder @ Jet HR

## Obiettivo del prototipo

Mostrare di aver capito la catena **RAL → trattenute → netto** in un caso standard italiano, con logiche esplicite, testabili e discutibili in interview — non di replicare un motore payroll completo.

## Ricerca svolta

1. **IRPEF 2026** — Agenzia delle Entrate: scaglioni 23% / 33% / 43% (la seconda aliquota scende dal 35% al 33% con L. 199/2025).
2. **Detrazioni lavoro dipendente** — art. 13 TUIR (formule per fasce ≤15k / ≤28k / ≤50k + €65 tra 25–35k).
3. **Detrazione aggiuntiva** — L. 207/2024 per redditi 20–40k.
4. **Trattamento integrativo** — modellato in forma semplificata fino a €1.200.
5. **INPS dipendente** — 9,19% (semplificazione consolidata nei calcolatori pubblici).
6. **Lombardia** — addizionale a scaglioni 1,23% / 1,58% / 1,72% / 1,73% (MEF / Regione).
7. **Milano** — addizionale comunale 0,8% con esenzione ≤ €23.000.

## Scelte di product

- **Un solo profilo fisso** (Milano, TI, no carichi) per ridurre ambiguità e focalizzare il valore.
- **Mensilità configurabili** (12/13/14): unico input “reale” oltre alla RAL, perché cambia il netto percepito in busta.
- **Breakdown trasparente**: ogni voce ha label + descrizione; gli scaglioni IRPEF sono espandibili.
- **Ipotesi in pagina**: le semplificazioni non sono nascoste nel README — sono parte del prodotto.
- **Motore separato dalla UI** (`src/lib/tax`) con unit test: dimostra controllo sulle logiche.

## Cosa discuterei in interview

- Massimale contributivo INPS e differenze CCNL
- Capienza esatta del trattamento integrativo tra 15–28k
- Timing di acconto/saldo addizionali vs trattenuta mensile
- TFR (azienda vs fondo) e impatto sul “netto percepito”
- Estensione a più comuni / regioni senza far esplodere la UX
