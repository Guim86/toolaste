import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw } from 'lucide-react';
import type { MetricKey, ScenarioRange } from '@/utils/resultsCalculations';

interface Props {
  metric: MetricKey;
  setMetric: (m: MetricKey) => void;
  speseFactor: number;
  setSpeseFactor: (f: number) => void;
  mesi: number;
  setMesi: (m: number) => void;
  targetRoi: number;
  setTargetRoi: (r: number) => void;
  visibleScenarios: Record<string, boolean>;
  toggleScenario: (id: string) => void;
  scenarios: ScenarioRange[];
  onReset: () => void;
}

const metricOptions: { value: MetricKey; label: string }[] = [
  { value: 'roi', label: 'ROI %' },
  { value: 'roiAnnualizzato', label: 'ROI annualizzato %' },
  { value: 'utileNetto', label: 'Utile netto €' },
  { value: 'score', label: 'Score' },
];

const speseOptions = [
  { value: '0.7', label: 'Basse' },
  { value: '1', label: 'Medie' },
  { value: '1.3', label: 'Alte' },
];

export function ResultsControls(props: Props) {
  const { metric, setMetric, speseFactor, setSpeseFactor, mesi, setMesi, targetRoi, setTargetRoi, visibleScenarios, toggleScenario, scenarios, onReset } = props;

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl bg-card border shadow-sm p-4 animate-fade-in">
      {/* Metric */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Metrica</label>
        <Select value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {metricOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Spese */}
      <div className="flex flex-col gap-1 min-w-[120px]">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Scenario spese</label>
        <Select value={String(speseFactor)} onValueChange={(v) => setSpeseFactor(parseFloat(v))}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {speseOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Mesi slider */}
      <div className="flex flex-col gap-1 min-w-[160px] flex-1 max-w-[240px]">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Durata: <span className="font-mono text-foreground">{mesi} mesi</span>
        </label>
        <Slider value={[mesi]} min={2} max={36} step={1} onValueChange={([v]) => setMesi(v)} />
      </div>

      {/* ROI minimo */}
      <div className="flex flex-col gap-1 w-[100px]">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ROI min %</label>
        <Input
          type="number"
          className="h-9 text-sm font-mono"
          value={targetRoi}
          onChange={(e) => setTargetRoi(Math.max(0, Number(e.target.value)))}
        />
      </div>

      {/* Scenario toggles */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Scenari</label>
        <div className="flex gap-3 h-9 items-center">
          {scenarios.map(s => (
            <label key={s.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <Checkbox
                checked={visibleScenarios[s.id] ?? true}
                onCheckedChange={() => toggleScenario(s.id)}
              />
              <span className="text-xs">{s.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset */}
      <Button variant="ghost" size="sm" onClick={onReset} className="h-9">
        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
      </Button>
    </div>
  );
}
