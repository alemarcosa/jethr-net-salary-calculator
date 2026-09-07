import {
  INPS_EMPLOYEE_RATE,
  IRPEF_BRACKETS_2026,
  LOMBARDIA_REGIONAL_BRACKETS,
  MILANO_MUNICIPAL_EXEMPTION,
  MILANO_MUNICIPAL_RATE,
} from "./constants";
import type { CalculationResult, CalculatorInput, LineItem } from "./types";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Imposta progressiva per scaglioni (IRPEF / addizionale regionale). */
export function progressiveTax(
  income: number,
  brackets: readonly { upTo: number; rate: number }[],
): { total: number; parts: { from: number; to: number | null; rate: number; tax: number }[] } {
  if (income <= 0) return { total: 0, parts: [] };

  const parts: { from: number; to: number | null; rate: number; tax: number }[] = [];
  let remaining = income;
  let lower = 0;
  let total = 0;

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const span = Number.isFinite(bracket.upTo)
      ? Math.min(remaining, bracket.upTo - lower)
      : remaining;
    const tax = span * bracket.rate;
    parts.push({
      from: lower,
      to: Number.isFinite(bracket.upTo) ? bracket.upTo : null,
      rate: bracket.rate,
      tax: round2(tax),
    });
    total += tax;
    remaining -= span;
    lower = bracket.upTo;
  }

  return { total: round2(total), parts };
}

/**
 * Detrazione lavoro dipendente — art. 13 comma 1 TUIR (importo 2025/2026).
 * Assumiamo rapporto di lavoro per l'intero anno (365/365).
 */
export function employeeWorkDeduction(taxableIncome: number): number {
  const r = taxableIncome;
  if (r <= 0) return 0;

  let deduction = 0;

  if (r <= 15_000) {
    deduction = 1_955;
    // Minimo garantito per tempo indeterminato
    deduction = Math.max(deduction, 690);
  } else if (r <= 28_000) {
    deduction = 1_910 + 1_190 * ((28_000 - r) / 13_000);
  } else if (r <= 50_000) {
    deduction = 1_910 * ((50_000 - r) / 22_000);
  } else {
    deduction = 0;
  }

  // Ulteriore detrazione art. 13 c.1.1 — tra 25.000 e 35.000
  if (r > 25_000 && r <= 35_000) {
    deduction += 65;
  }

  return round2(Math.max(0, deduction));
}

/**
 * Detrazione aggiuntiva per redditi da lavoro dipendente (L. 207/2024).
 * Tra €20.000 e €40.000 di reddito complessivo.
 */
export function additionalEmployeeDeduction(taxableIncome: number): number {
  const r = taxableIncome;
  if (r <= 20_000 || r > 40_000) return 0;
  if (r <= 32_000) return 1_000;
  return round2(1_000 * ((40_000 - r) / 8_000));
}

/**
 * Trattamento integrativo (ex bonus Renzi) — modello semplificato 2026.
 * - ≤ €15.000: €1.200
 * - €15.001–€28.000: fino a €1.200 se c'è capienza IRPEF dopo le detrazioni
 * - > €28.000: non spetta
 */
export function treatmentIntegrative(
  taxableIncome: number,
  irpefAfterDeductions: number,
): number {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 15_000) return 1_200;
  if (taxableIncome <= 28_000) {
    return round2(Math.max(0, Math.min(1_200, irpefAfterDeductions)));
  }
  return 0;
}

export function municipalSurtaxMilano(taxableIncome: number): number {
  if (taxableIncome <= MILANO_MUNICIPAL_EXEMPTION) return 0;
  return round2(taxableIncome * MILANO_MUNICIPAL_RATE);
}

export function calculateNetSalary(input: CalculatorInput): CalculationResult {
  const ral = Math.max(0, input.ral);
  const payPeriods = input.payPeriods;

  const inpsEmployee = round2(ral * INPS_EMPLOYEE_RATE);
  const taxableIncome = round2(Math.max(0, ral - inpsEmployee));

  const irpef = progressiveTax(taxableIncome, IRPEF_BRACKETS_2026);
  const irpefGross = irpef.total;

  const employeeDeduction = employeeWorkDeduction(taxableIncome);
  const additionalDeduction = additionalEmployeeDeduction(taxableIncome);
  const rawDeductions = employeeDeduction + additionalDeduction;
  const totalDeductionsApplied = round2(Math.min(irpefGross, rawDeductions));

  const irpefAfterDeductions = round2(Math.max(0, irpefGross - totalDeductionsApplied));
  const treatment = treatmentIntegrative(taxableIncome, irpefAfterDeductions);

  // Il trattamento integrativo è un credito: riduce l'IRPEF effettivamente trattenuta
  const irpefNet = round2(Math.max(0, irpefAfterDeductions - treatment));

  const regional = progressiveTax(taxableIncome, LOMBARDIA_REGIONAL_BRACKETS);
  const regionalSurtax = regional.total;
  const municipal = municipalSurtaxMilano(taxableIncome);

  const totalTaxes = round2(irpefNet + regionalSurtax + municipal);
  const totalWithholdings = round2(inpsEmployee + totalTaxes);
  const netAnnual = round2(ral - totalWithholdings);
  const netMonthly = round2(netAnnual / payPeriods);
  const effectiveRate = ral > 0 ? round2((totalWithholdings / ral) * 100) : 0;

  const lineItems: LineItem[] = [
    {
      id: "inps",
      label: "Contributi INPS (dipendente)",
      amount: inpsEmployee,
      rateOnRal: INPS_EMPLOYEE_RATE * 100,
      description:
        "Aliquota IVS semplificata 9,19% sulla RAL (include Fondo di garanzia TFR).",
      kind: "contribution",
    },
    {
      id: "irpef-gross",
      label: "IRPEF lorda",
      amount: irpefGross,
      rateOnTaxable: taxableIncome > 0 ? round2((irpefGross / taxableIncome) * 100) : 0,
      description: "Scaglioni 2026: 23% / 33% / 43%.",
      kind: "tax",
    },
    {
      id: "deduction-employee",
      label: "Detrazione lavoro dipendente",
      amount: -employeeDeduction,
      description: "Art. 13 TUIR — rapportata all'intero anno.",
      kind: "credit",
    },
    {
      id: "deduction-additional",
      label: "Detrazione aggiuntiva (20k–40k)",
      amount: -additionalDeduction,
      description: "Detrazione L. 207/2024 per redditi da lavoro dipendente.",
      kind: "credit",
    },
    {
      id: "treatment",
      label: "Trattamento integrativo",
      amount: -treatment,
      description: "Credito in busta fino a €1.200 per redditi ≤ €28.000.",
      kind: "credit",
    },
    {
      id: "irpef-net",
      label: "IRPEF netta trattenuta",
      amount: irpefNet,
      description: "IRPEF lorda − detrazioni − trattamento integrativo.",
      kind: "tax",
    },
    {
      id: "regional",
      label: "Addizionale regionale Lombardia",
      amount: regionalSurtax,
      description: "Scaglioni 1,23% / 1,58% / 1,72% / 1,73%.",
      kind: "tax",
    },
    {
      id: "municipal",
      label: "Addizionale comunale Milano",
      amount: municipal,
      rateOnTaxable: MILANO_MUNICIPAL_RATE * 100,
      description: `Aliquota 0,8% — esenzione fino a €${MILANO_MUNICIPAL_EXEMPTION.toLocaleString("it-IT")}.`,
      kind: "tax",
    },
  ];

  return {
    input: { ral, payPeriods },
    inpsEmployee,
    taxableIncome,
    irpefGross,
    employeeDeduction,
    additionalDeduction,
    totalDeductionsApplied,
    irpefNet,
    regionalSurtax,
    municipalSurtax: municipal,
    treatmentIntegrative: treatment,
    totalWithholdings,
    totalTaxes,
    netAnnual,
    netMonthly,
    effectiveRate,
    lineItems,
    irpefBrackets: irpef.parts,
  };
}
