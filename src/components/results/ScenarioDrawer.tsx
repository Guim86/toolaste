import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { formatEuro, formatPercent } from '@/utils/formatting';
import { getStatoColor, getStato } from '@/utils/resultsCalculations';
import type { ScenarioRange, ScenarioMetrics } from '@/utils/resultsCalculations';

interface Props {
  open: boolean;
  onClose: () => void;
  scenario: ScenarioRange | null;
  metrics: ScenarioMetrics | null;
}

export function ScenarioDrawer({ open, onClose, scenario, metrics }: Props) {
  if (!scenario || !metrics) return null;

  const generatePhrase = () => {
    const maxBuy = formatEuro(scenario.acquistoMax);
    const mesi = scenario.mesiBase;
    if (metrics.score >= 75) return `Scenario molto solido. Margini interessanti anche nello scenario peggiore.`;
    if (metrics.score >= 50) return `Questo scenario resta interessante se l'acquisto rimane sotto ${maxBuy} e la rivendita avviene entro ${mesi} mesi.`;
    if (metrics.score >= 30) return `Scenario borderline: richiede attenzione su costi e tempistiche. Margini ridotti.`;
    return `Scenario debole: i margini non giustificano il rischio. Considerare un prezzo d'acquisto più basso.`;
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg">{scenario.name}</SheetTitle>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: getStatoColor(metrics.score) + '22', color: getStatoColor(metrics.score) }}
            >
              {getStato(metrics.score)}
            </span>
            <span className="font-mono text-sm font-bold">{metrics.score}/100</span>
          </div>
        </SheetHeader>

        {/* Section 1: Summary */}
        <div className="space-y-4 pb-6">
          <p className="text-sm text-muted-foreground italic">{generatePhrase()}</p>

          {/* Section 2: Financial breakdown */}
          <div className="rounded-lg border p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Breakdown finanziario</h4>
            <BreakdownRow label="Prezzo acquisto" value={formatEuro(metrics.acquisto)} />
            <BreakdownRow label="Imposte" value={formatEuro(metrics.registrationTax)} />
            <BreakdownRow label="Spese fisse" value={formatEuro(metrics.spese)} />
            <BreakdownRow label="Costi di vendita" value={formatEuro(metrics.rivendita * 0.03)} />
            <div className="border-t pt-2 mt-2">
              <BreakdownRow label="Costo totale" value={formatEuro(metrics.costoTotale)} bold />
            </div>
            <BreakdownRow label="Prezzo rivendita" value={formatEuro(metrics.rivendita)} />
            <div className="border-t pt-2 mt-2">
              <BreakdownRow label="Utile netto" value={formatEuro(metrics.utileNetto)} bold />
              <BreakdownRow label="ROI" value={formatPercent(metrics.roi)} />
              <BreakdownRow label="ROI annualizzato" value={formatPercent(metrics.roiAnnualizzato)} />
            </div>
          </div>

          {/* Section 3: Robustness */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Analisi di robustezza</h4>
            <SensitivityBar label="Sensibilità alle spese" value={metrics.sensibilitaSpese} />
            <SensitivityBar label="Sensibilità temporale" value={metrics.sensibilitaTempo} />
            <SensitivityBar label="Dipendenza dalla rivendita" value={metrics.sensibilitaRivendita} />
          </div>

          {/* Section 4: Visual indicators */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Indicatori</h4>
            <Indicator label="Rischio" value={100 - metrics.robustezza} />
            <Indicator label="Sensibilità temporale" value={metrics.sensibilitaTempo} />
            <Indicator label="Dipendenza rivendita" value={metrics.sensibilitaRivendita} />
          </div>

          {/* Range summary */}
          <div className="rounded-lg border p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Range scenario</h4>
            <RangeRow label="Acquisto" min={formatEuro(scenario.acquistoMin)} base={formatEuro(scenario.acquistoBase)} max={formatEuro(scenario.acquistoMax)} />
            <RangeRow label="Rivendita" min={formatEuro(scenario.rivenditaMin)} base={formatEuro(scenario.rivenditaBase)} max={formatEuro(scenario.rivenditaMax)} />
            <RangeRow label="Utile" min={formatEuro(metrics.utileMin)} base={formatEuro(metrics.utileNetto)} max={formatEuro(metrics.utileMax)} />
            <RangeRow label="ROI" min={formatPercent(metrics.roiMin)} base={formatPercent(metrics.roi)} max={formatPercent(metrics.roiMax)} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function BreakdownRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={bold ? 'font-semibold text-foreground' : 'text-muted-foreground'}>{label}</span>
      <span className={`font-mono ${bold ? 'font-bold text-foreground' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function SensitivityBar({ label, value }: { label: string; value: number }) {
  const color = value > 60 ? 'hsl(0, 70%, 60%)' : value > 30 ? 'hsl(38, 92%, 50%)' : 'hsl(130, 60%, 45%)';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
    </div>
  );
}

function Indicator({ label, value }: { label: string; value: number }) {
  const level = value > 60 ? 'Alto' : value > 30 ? 'Medio' : 'Basso';
  const color = value > 60 ? 'text-destructive' : value > 30 ? 'text-warning' : 'text-success';
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold text-xs ${color}`}>{level}</span>
    </div>
  );
}

function RangeRow({ label, min, base, max }: { label: string; min: string; base: string; max: string }) {
  return (
    <div className="text-xs space-y-0.5">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex gap-2 font-mono">
        <span className="text-muted-foreground">{min}</span>
        <span className="font-semibold text-foreground">{base}</span>
        <span className="text-muted-foreground">{max}</span>
      </div>
    </div>
  );
}
