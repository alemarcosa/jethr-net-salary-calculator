"use client";

import { useMemo, useState, useTransition } from "react";
import { Calculator, MapPin, Briefcase, Info } from "lucide-react";
import { calculateNetSalary } from "@/lib/tax/calculate";
import { ASSUMPTIONS, PROFILE, SOURCES, TAX_YEAR } from "@/lib/tax/constants";
import { formatEUR, formatPercent, parseRalInput } from "@/lib/tax/format";
import type { PayPeriods } from "@/lib/tax/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const PRESETS = [25_000, 30_000, 35_000, 40_000, 45_000, 50_000, 60_000, 80_000];

export function SalaryCalculator() {
  const [ralDraft, setRalDraft] = useState("35000");
  const [payPeriods, setPayPeriods] = useState<PayPeriods>(13);
  const [submittedRal, setSubmittedRal] = useState(35_000);
  const [hasCalculated, setHasCalculated] = useState(true);
  const [isPending, startTransition] = useTransition();

  const result = useMemo(
    () => calculateNetSalary({ ral: submittedRal, payPeriods }),
    [submittedRal, payPeriods],
  );

  function handleCalculate(e?: React.FormEvent) {
    e?.preventDefault();
    const value = parseRalInput(ralDraft);
    startTransition(() => {
      setSubmittedRal(value);
      setHasCalculated(true);
    });
  }

  const withholdShare =
    result.input.ral > 0 ? (result.totalWithholdings / result.input.ral) * 100 : 0;
  const netShare = 100 - withholdShare;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
      {/* INPUT COLUMN */}
      <section className="flex flex-col gap-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 font-medium">
              Prototipo · Anno {TAX_YEAR}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 font-medium">
              Product Builder @ Jet HR
            </Badge>
          </div>
          <h1 className="font-display text-[clamp(2.1rem,4vw,3.25rem)] leading-[1.05] tracking-tight text-foreground">
            Da RAL a{" "}
            <span className="text-primary">netto</span>
            <br />
            in chiaro.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Proiezione della retribuzione netta annuale e mensile, con tutte le
            trattenute tipiche di un dipendente standard a Milano.
          </p>
        </header>

        <form
          onSubmit={handleCalculate}
          className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-6 shadow-[0_24px_60px_-36px_rgba(17,40,28,0.45)] backdrop-blur-sm sm:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/8 blur-2xl"
          />

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ral" className="text-sm font-medium">
                Retribuzione Annua Lorda (RAL)
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  €
                </span>
                <Input
                  id="ral"
                  inputMode="decimal"
                  value={ralDraft}
                  onChange={(e) => setRalDraft(e.target.value)}
                  className="h-14 rounded-xl border-border/80 bg-background pl-9 pr-4 font-display text-2xl tracking-tight"
                  placeholder="35000"
                  aria-describedby="ral-hint"
                />
              </div>
              <p id="ral-hint" className="text-xs text-muted-foreground">
                Inserisci il lordo annuo contrattuale, prima delle trattenute.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setRalDraft(String(preset));
                    startTransition(() => {
                      setSubmittedRal(preset);
                      setHasCalculated(true);
                    });
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    submittedRal === preset
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {formatEUR(preset)}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Mensilità</Label>
              <div
                role="radiogroup"
                aria-label="Numero di mensilità"
                className="grid grid-cols-3 gap-2"
              >
                {([12, 13, 14] as PayPeriods[]).map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={payPeriods === n}
                    onClick={() => setPayPeriods(n)}
                    className={cn(
                      "h-11 rounded-xl border text-sm font-medium transition-colors",
                      payPeriods === n
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {n}
                    {n === 13 ? (
                      <span className="ml-1 text-[10px] opacity-80">CCNL</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="h-12 w-full rounded-xl text-base font-semibold shadow-sm"
            >
              <Calculator className="size-4" />
              Calcola netto
            </Button>
          </div>

          <Separator className="my-6" />

          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-start gap-2.5">
              <Briefcase className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{PROFILE.contract}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{PROFILE.residence}</span>
            </li>
          </ul>
        </form>
      </section>

      {/* RESULTS COLUMN */}
      <section
        className={cn(
          "flex flex-col gap-5 transition-opacity duration-300",
          hasCalculated ? "opacity-100" : "opacity-50",
        )}
        aria-live="polite"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultHero
            label="Netto annuale"
            value={formatEUR(result.netAnnual)}
            hint={`Aliquota effettiva ${formatPercent(result.effectiveRate)}`}
            emphasize
          />
          <ResultHero
            label={`Netto / mensilità (${result.input.payPeriods})`}
            value={formatEUR(result.netMonthly)}
            hint={`${formatEUR(result.totalWithholdings)} di trattenute annue`}
          />
        </div>

        {/* Waterfall bar */}
        <div className="rounded-2xl border border-border/80 bg-card/70 p-5 sm:p-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Composizione del lordo
              </p>
              <p className="mt-1 font-display text-lg tracking-tight">
                {formatEUR(result.input.ral)} RAL
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Imponibile {formatEUR(result.taxableIncome)}
            </p>
          </div>

          <div className="flex h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="bg-primary transition-all duration-700 ease-out"
              style={{ width: `${netShare}%` }}
              title="Netto"
            />
            <div
              className="bg-chart-withhold transition-all duration-700 ease-out"
              style={{ width: `${withholdShare}%` }}
              title="Trattenute"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" />
              Netto {formatPercent(netShare, 1)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-withhold" />
              Trattenute {formatPercent(withholdShare, 1)}
            </span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="rounded-2xl border border-border/80 bg-card/70 p-5 sm:p-6">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-display text-xl tracking-tight">Voci trattenute</h2>
            <Badge variant="outline" className="rounded-full">
              dal lordo
            </Badge>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">
            Dalla RAL alle trattenute previdenziali e fiscali, fino al netto.
          </p>

          <div className="space-y-0">
            <BreakdownRow
              label="RAL"
              value={formatEUR(result.input.ral)}
              strong
            />
            {result.lineItems
              .filter((item) => item.id !== "irpef-gross")
              .map((item) => (
                <BreakdownRow
                  key={item.id}
                  label={item.label}
                  value={formatEUR(item.amount, { signed: item.kind === "credit" })}
                  hint={item.description}
                  muted={item.kind === "credit" && item.amount === 0}
                  credit={item.kind === "credit" && item.amount !== 0}
                />
              ))}
            <Separator className="my-3" />
            <BreakdownRow
              label="Netto annuale"
              value={formatEUR(result.netAnnual)}
              strong
            />
            <BreakdownRow
              label="Totale tasse (IRPEF + addizionali − crediti)"
              value={formatEUR(result.totalTaxes)}
            />
            <BreakdownRow
              label="Contributi INPS dipendente"
              value={formatEUR(result.inpsEmployee)}
            />
          </div>

          {/* IRPEF brackets detail */}
          <Accordion className="mt-5" defaultValue={[]}>
            <AccordionItem value="brackets">
              <AccordionTrigger className="text-sm">
                Dettaglio scaglioni IRPEF
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm">
                  {result.irpefBrackets.map((b) => (
                    <li
                      key={`${b.from}-${b.to}`}
                      className="flex items-center justify-between gap-3 text-muted-foreground"
                    >
                      <span>
                        {formatEUR(b.from)}
                        {" → "}
                        {b.to == null ? "oltre" : formatEUR(b.to)}{" "}
                        <span className="text-foreground/80">
                          ({formatPercent(b.rate * 100, 0)})
                        </span>
                      </span>
                      <span className="tabular-nums text-foreground">
                        {formatEUR(b.tax)}
                      </span>
                    </li>
                  ))}
                  <li className="flex items-center justify-between border-t border-border/70 pt-2 font-medium text-foreground">
                    <span>IRPEF lorda</span>
                    <span className="tabular-nums">{formatEUR(result.irpefGross)}</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Assumptions */}
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Info className="size-4 text-primary" />
            <h2 className="font-display text-lg tracking-tight">
              Ipotesi e semplificazioni
            </h2>
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            {ASSUMPTIONS.map((a) => (
              <li key={a} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-primary/70" />
                <span>{a}</span>
              </li>
            ))}
          </ul>

          <Separator className="my-4" />

          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Fonti
          </p>
          <ul className="flex flex-col gap-1.5 text-sm">
            {SOURCES.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function ResultHero({
  label,
  value,
  hint,
  emphasize,
}: {
  label: string;
  value: string;
  hint: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 sm:p-6",
        emphasize
          ? "border-primary/20 bg-primary text-primary-foreground shadow-[0_20px_50px_-28px_rgba(17,40,28,0.55)]"
          : "border-border/80 bg-card/80",
      )}
    >
      <p
        className={cn(
          "text-xs font-medium uppercase tracking-[0.14em]",
          emphasize ? "text-primary-foreground/70" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p className="mt-2 font-display text-[clamp(1.85rem,3vw,2.45rem)] leading-none tracking-tight tabular-nums">
        {value}
      </p>
      <p
        className={cn(
          "mt-3 text-sm",
          emphasize ? "text-primary-foreground/75" : "text-muted-foreground",
        )}
      >
        {hint}
      </p>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  hint,
  strong,
  muted,
  credit,
}: {
  label: string;
  value: string;
  hint?: string;
  strong?: boolean;
  muted?: boolean;
  credit?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border/50 py-3 last:border-0",
        muted && "opacity-40",
      )}
    >
      <div className="min-w-0">
        <p className={cn("text-sm", strong ? "font-semibold text-foreground" : "text-foreground/90")}>
          {label}
        </p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <p
        className={cn(
          "shrink-0 tabular-nums text-sm",
          strong && "font-semibold text-base",
          credit && "text-[oklch(0.42_0.09_150)]",
        )}
      >
        {value}
      </p>
    </div>
  );
}
