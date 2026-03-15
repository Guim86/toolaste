import type { ScenarioResult } from '@/types/project';
import { formatEuro, formatPercent } from '@/utils/formatting';

interface Props {
  result: ScenarioResult;
  purchaseRange: { min: number; max: number };
  currentPrice: number;
}

const esitoConfig: Record<ScenarioResult['esito'], { label: string; className: string }> = {
  non_conviene: { label: 'Non conviene', className: 'bg-danger text-danger-foreground' },
  borderline: { label: 'Borderline', className: 'bg-warning text-warning-foreground' },
  conviene: { label: 'Conviene', className: 'bg-success text-success-foreground' },
  ottima: { label: 'Ottima', className: 'bg-success text-success-foreground' },
  eccellente: { label: 'Eccellente', className: 'bg-primary text-primary-foreground' },
};

export function FeasibilityBar({ result, purchaseRange, currentPrice }: Props) {
  const { min, max } = purchaseRange;
  const range = max - min;
  if (range <= 0) return null;

  const tettoPercent = Math.min(100, Math.max(0, ((result.tettoMassimo - min) / range) * 100));
  const currentPercent = Math.min(100, Math.max(0, ((currentPrice - min) / range) * 100));

  const esito = esitoConfig[result.esito];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium truncate">{result.scenarioName}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${esito.className}`}>
          {esito.label}
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-6 rounded-full overflow-hidden bg-muted">
        {/* Green zone (feasible) */}
        <div
          className="absolute inset-y-0 left-0 bg-success/30 rounded-l-full"
          style={{ width: `${tettoPercent}%` }}
        />
        {/* Red zone (not feasible) */}
        <div
          className="absolute inset-y-0 right-0 bg-danger/20 rounded-r-full"
          style={{ width: `${100 - tettoPercent}%` }}
        />
        {/* Tetto max marker */}
        <div
          className="absolute inset-y-0 w-0.5 bg-success"
          style={{ left: `${tettoPercent}%` }}
          title={`Tetto max: ${formatEuro(result.tettoMassimo)}`}
        />
        {/* Current price marker */}
        {currentPrice > 0 && (
          <div
            className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
            style={{ left: `${currentPercent}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-3 h-3 rounded-full border-2 border-foreground bg-card shadow-sm" />
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
        <span>{formatEuro(min)}</span>
        <span className="text-success font-medium">Tetto: {formatEuro(result.tettoMassimo)}</span>
        <span>{formatEuro(max)}</span>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Vendita</span>
          <span className="font-mono">{formatEuro(result.prezzoVendita)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">ROI</span>
          <span className={`font-mono font-semibold ${result.roi >= 50 ? 'text-success' : result.roi >= 30 ? 'text-warning' : 'text-danger'}`}>
            {formatPercent(result.roi)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Utile</span>
          <span className={`font-mono font-semibold ${result.utileNetto >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatEuro(result.utileNetto)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Margine</span>
          <span className="font-mono">{formatPercent(result.margine)}</span>
        </div>
      </div>
    </div>
  );
}
