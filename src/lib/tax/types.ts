export type PayPeriods = 12 | 13 | 14;

export interface CalculatorInput {
  /** Retribuzione Annua Lorda in euro */
  ral: number;
  /** Numero di mensilità (default 13, tipico CCNL) */
  payPeriods: PayPeriods;
}

export interface LineItem {
  id: string;
  label: string;
  amount: number;
  /** Percentuale sulla RAL, se sensata */
  rateOnRal?: number;
  /** Percentuale sull'imponibile, se sensata */
  rateOnTaxable?: number;
  description?: string;
  kind: "contribution" | "tax" | "credit" | "info";
}

export interface CalculationResult {
  input: CalculatorInput;
  /** Contributi previdenziali a carico del dipendente */
  inpsEmployee: number;
  /** Reddito imponibile IRPEF = RAL − INPS */
  taxableIncome: number;
  /** IRPEF lorda per scaglioni */
  irpefGross: number;
  /** Detrazione lavoro dipendente (art. 13 TUIR) */
  employeeDeduction: number;
  /** Detrazione aggiuntiva L. 207/2024 (20k–40k) */
  additionalDeduction: number;
  /** Totale detrazioni applicate (capate all'IRPEF lorda) */
  totalDeductionsApplied: number;
  /** IRPEF netta dopo detrazioni */
  irpefNet: number;
  /** Addizionale regionale Lombardia */
  regionalSurtax: number;
  /** Addizionale comunale Milano */
  municipalSurtax: number;
  /** Trattamento integrativo (ex bonus Renzi), credito in busta */
  treatmentIntegrative: number;
  /** Totale trattenute (INPS + tasse − crediti) */
  totalWithholdings: number;
  /** Totale imposte (IRPEF + addizionali − trattamento integrativo) */
  totalTaxes: number;
  /** Netto annuale */
  netAnnual: number;
  /** Netto per mensilità */
  netMonthly: number;
  /** Aliquota media effettiva sul lordo */
  effectiveRate: number;
  /** Breakdown ordinato per UI */
  lineItems: LineItem[];
  /** Scaglioni IRPEF usati (importo per fascia) */
  irpefBrackets: { from: number; to: number | null; rate: number; tax: number }[];
}
