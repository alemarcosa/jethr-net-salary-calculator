import { describe, expect, it } from "vitest";
import {
  additionalEmployeeDeduction,
  calculateNetSalary,
  employeeWorkDeduction,
  municipalSurtaxMilano,
  progressiveTax,
} from "./calculate";
import { IRPEF_BRACKETS_2026 } from "./constants";

describe("progressiveTax IRPEF 2026", () => {
  it("calcola correttamente sotto i 28k", () => {
    expect(progressiveTax(20_000, IRPEF_BRACKETS_2026).total).toBe(4_600);
  });

  it("calcola correttamente tra 28k e 50k (aliquota 33%)", () => {
    // 6440 + 33% * 2000 = 6440 + 660 = 7100
    expect(progressiveTax(30_000, IRPEF_BRACKETS_2026).total).toBe(7_100);
  });

  it("calcola correttamente oltre 50k", () => {
    // 6440 + 33%*22000 = 6440+7260 = 13700; +43%*10000 = 4300 → 18000
    expect(progressiveTax(60_000, IRPEF_BRACKETS_2026).total).toBe(18_000);
  });
});

describe("employeeWorkDeduction", () => {
  it("massa piena sotto 15k", () => {
    expect(employeeWorkDeduction(14_000)).toBe(1_955);
  });

  it("si azzera oltre 50k", () => {
    expect(employeeWorkDeduction(55_000)).toBe(0);
  });

  it("include +65 tra 25k e 35k", () => {
    const base = 1_910 * ((50_000 - 30_000) / 22_000);
    expect(employeeWorkDeduction(30_000)).toBeCloseTo(base + 65, 1);
  });
});

describe("additionalEmployeeDeduction", () => {
  it("vale 1000 tra 20k e 32k", () => {
    expect(additionalEmployeeDeduction(25_000)).toBe(1_000);
  });

  it("decade linearmente tra 32k e 40k", () => {
    expect(additionalEmployeeDeduction(36_000)).toBe(500);
  });
});

describe("municipalSurtaxMilano", () => {
  it("è esente sotto 23k", () => {
    expect(municipalSurtaxMilano(22_000)).toBe(0);
  });

  it("applica 0,8% sopra soglia", () => {
    expect(municipalSurtaxMilano(40_000)).toBe(320);
  });
});

describe("calculateNetSalary — sanità del flusso", () => {
  it("produce netto < RAL e mensile coerente", () => {
    const r = calculateNetSalary({ ral: 35_000, payPeriods: 13 });
    expect(r.netAnnual).toBeLessThan(35_000);
    expect(r.netAnnual).toBeGreaterThan(20_000);
    expect(r.netMonthly).toBeCloseTo(r.netAnnual / 13, 1);
    expect(r.taxableIncome).toBeCloseTo(35_000 * (1 - 0.0919), 0);
  });

  it("RAL 0 → tutto a zero", () => {
    const r = calculateNetSalary({ ral: 0, payPeriods: 13 });
    expect(r.netAnnual).toBe(0);
    expect(r.totalWithholdings).toBe(0);
  });

  it("include le voci di breakdown attese", () => {
    const r = calculateNetSalary({ ral: 40_000, payPeriods: 13 });
    const ids = r.lineItems.map((i) => i.id);
    expect(ids).toContain("inps");
    expect(ids).toContain("irpef-net");
    expect(ids).toContain("regional");
    expect(ids).toContain("municipal");
  });
});
