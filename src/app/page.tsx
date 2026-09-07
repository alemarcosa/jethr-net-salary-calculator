import { SalaryCalculator } from "@/components/calculator/salary-calculator";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      <header className="animate-rise mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-8 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            J
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Jet HR</p>
            <p className="text-xs text-muted-foreground">Product Builder exercise</p>
          </div>
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Anno fiscale 2026 · Milano
        </p>
      </header>

      <main className="animate-rise mx-auto w-full flex-1 px-6 py-10 sm:px-8 sm:py-14 [animation-delay:80ms]">
        <SalaryCalculator />
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-10 text-xs leading-relaxed text-muted-foreground sm:px-8">
        <p>
          Stima indicativa costruita per il take-home di Product Builder @ Jet HR.
          Non costituisce consulenza fiscale né sostituisce un cedolino elaborato
          da un consulente del lavoro.
        </p>
      </footer>
    </div>
  );
}
