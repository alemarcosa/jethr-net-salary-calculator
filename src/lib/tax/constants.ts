/**
 * Parametri fiscali del prototipo — Anno d'imposta 2026
 *
 * Fonti principali (consultate per il task Jet HR):
 * - Agenzia delle Entrate — Aliquote e calcolo IRPEF (agg. 13 gen 2026)
 * - Legge 30 dicembre 2025, n. 199 (Bilancio 2026) — seconda aliquota al 33%
 * - art. 13 TUIR — detrazioni per lavoro dipendente
 * - Regione Lombardia — addizionale regionale IRPEF (scaglioni)
 * - Comune di Milano / MEF — addizionale comunale 0,8%, esenzione ≤ €23.000
 * - Prassi INPS — aliquota IVS dipendente privato ~9,19% (incl. Fondo di garanzia)
 */

export const TAX_YEAR = 2026;

/** Aliquota contributi IVS a carico del dipendente (settore privato, semplificata) */
export const INPS_EMPLOYEE_RATE = 0.0919;

/** Scaglioni IRPEF 2026 (art. 11 TUIR come modificato dalla L. 199/2025) */
export const IRPEF_BRACKETS_2026 = [
  { upTo: 28_000, rate: 0.23 },
  { upTo: 50_000, rate: 0.33 },
  { upTo: Infinity, rate: 0.43 },
] as const;

/**
 * Addizionale regionale Lombardia — aliquote differenziate per scaglioni IRPEF.
 * Fonte: Regione Lombardia / MEF (pubblicazione 28-GEN-26).
 */
export const LOMBARDIA_REGIONAL_BRACKETS = [
  { upTo: 15_000, rate: 0.0123 },
  { upTo: 28_000, rate: 0.0158 },
  { upTo: 50_000, rate: 0.0172 },
  { upTo: Infinity, rate: 0.0173 },
] as const;

/** Addizionale comunale Milano */
export const MILANO_MUNICIPAL_RATE = 0.008;
/** Soglia di esenzione addizionale comunale Milano */
export const MILANO_MUNICIPAL_EXEMPTION = 23_000;

/** Profilo fisso del prototipo */
export const PROFILE = {
  contract: "Impiegato a tempo indeterminato — settore privato",
  residence: "Milano (MI), Lombardia",
  familyLoad: "Nessun familiare a carico",
  benefits: "Nessuna agevolazione particolare",
  ccnl: "Mensilità tipiche CCNL (configurabili 12/13/14)",
} as const;

export const ASSUMPTIONS: string[] = [
  "Dipendente privato a tempo indeterminato, full-time, intero anno solare.",
  "Residenza fiscale a Milano → addizionale regionale Lombardia + comunale Milano.",
  "Nessun familiare a carico, nessun onere deducibile oltre ai contributi INPS.",
  "Nessuna agevolazione (under 36, impatriati, apprendistato, part-time, ecc.).",
  "Contributi INPS dipendente semplificati al 9,19% sulla RAL (IVS + Fondo garanzia).",
  "TFR non trattenuto dal netto: matura a parte (azienda o fondo pensione).",
  "Nessun fringe benefit, buoni pasto, straordinari o welfare aziendale.",
  "Il trattamento integrativo (ex bonus) è modellato in forma semplificata.",
  "Stima indicativa: non sostituisce cedolino, CU o consulente del lavoro.",
];

export const SOURCES = [
  {
    label: "Agenzia delle Entrate — Aliquote IRPEF",
    href: "https://www.agenziaentrate.gov.it/portale/imposta-sul-reddito-delle-persone-fisiche-irpef-/aliquote-e-calcolo-dell-irpef-cittadini",
  },
  {
    label: "MEF — Addizionali IRPEF locali",
    href: "https://www.finanze.gov.it/opencms/it/fiscalita-locali/addizionali-irpef/",
  },
  {
    label: "Regione Lombardia — Addizionale regionale",
    href: "https://www.regione.lombardia.it/wps/portal/istituzionale/HP/DettaglioRedazionale/servizi-e-informazioni/cittadini/tributi/addizionale-regionale-irpef",
  },
  {
    label: "Comune di Milano — Addizionale comunale",
    href: "https://www.comune.milano.it/argomenti/tributi/addizionale-comunale-irpef",
  },
  {
    label: "INPS — Contributi previdenziali",
    href: "https://www.inps.it/",
  },
] as const;
