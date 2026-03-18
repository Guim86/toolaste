import type { ScenarioResult, RoiThresholds } from '@/types/project';
import { formatEuro, formatPercent } from '@/utils/formatting';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  result: ScenarioResult;
  purchaseRange: { min: number; max: number };
  currentPrice: number;
  roiThresholds: RoiThresholds;
  euroPerMq: number;
}

export const esitoConfig: Record<ScenarioResult['esito'], { label: string; className: string; dotClass: string }> = {
  non_conviene: { label: 'Non conviene', className: 'bg-danger text-danger-foreground', dotClass: 'bg-danger' },
  borderline: { label: 'Borderline', className: 'bg-warning text-warning-foreground', dotClass: 'bg-warning' },
  conviene: { label: 'Conviene', className: 'bg-success/70 text-success-foreground', dotClass: 'bg-success/70' },
  ottima: { label: 'Ottima', className: 'bg-success text-success-foreground', dotClass: 'bg-success' },
  eccellente: { label: 'Eccellente', className: 'bg-primary text-primary-foreground', dotClass: 'bg-primary' },
};

export function FeasibilityBar({ result, purchaseRange, currentPrice, roiThresholds, euroPerMq }: Props) {
  const { min, max } = purchaseRange;
  const range = max - min;
  if (range <= 0) return null;

  const tettoPercent = Math.min(100, Math.max(0, ((result.tettoMassimo - min) / range) * 100));
  const currentPercent = Math.min(100, Math.max(0, ((currentPrice - min) / range) * 100));

  const esito = esitoConfig[result.esito];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium truncate">{result.scenarioName} ({euroPerMq} €/mq)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${esito.className}`}>
            {esito.label}
          </span>
        </div>

        {/* Bar */}
        <div className="relative h-6 rounded-full overflow-hidden bg-muted">
          {/* Green zone (feasible) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute inset-y-0 left-0 bg-success/30 rounded-l-full cursor-help"
                style={{ width: `${tettoPercent}%` }}
              />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Zona sicura: prezzi di acquisto che rispettano i parametri</p>
            </TooltipContent>
          </Tooltip>

          {/* Red zone (not feasible) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute inset-y-0 right-0 bg-danger/20 rounded-r-full cursor-help"
                style={{ width: `${100 - tettoPercent}%` }}
              />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Zona rischiosa: prezzi che non rispettano i vincoli minimi</p>
            </TooltipContent>
          </Tooltip>

          {/* Tetto max marker */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute inset-y-0 w-0.5 bg-success cursor-help"
                style={{ left: `${tettoPercent}%` }}
              />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Prezzo agg. max: {formatEuro(result.tettoMassimo)}</p>
              <p className="text-xs text-muted-foreground">Prezzo massimo di acquisto per rispettare ROI e utile minimo impostati</p>
            </TooltipContent>
          </Tooltip>

          {/* Current price marker */}
          {currentPrice > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute top-0 bottom-0 flex flex-col items-center justify-center cursor-help"
                  style={{ left: `${currentPercent}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-3 h-3 rounded-full border-2 border-foreground bg-card shadow-sm" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Prezzo di aggiudicazione attuale: {formatEuro(currentPrice)}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>{formatEuro(min)}</span>
          <span className="text-success font-medium">Tetto Max: {formatEuro(result.tettoMassimo)}</span>
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
            <span className={`font-mono font-semibold ${result.roi >= roiThresholds.ottima ? 'text-success' : result.roi >= roiThresholds.borderline ? 'text-warning' : 'text-danger'}`}>
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
    </TooltipProvider>
  );
}
