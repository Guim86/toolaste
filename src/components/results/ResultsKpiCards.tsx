import { formatEuro, formatPercent } from '@/utils/formatting';
import { getStatoColor, getStato } from '@/utils/resultsCalculations';
import { TrendingUp, DollarSign, Target, Award } from 'lucide-react';

interface Props {
  maxPurchase: number;
  utileNetto: number;
  roiAnnualizzato: number;
  score: number;
}

const cards = [
  { key: 'maxPurchase', label: 'Prezzo massimo consigliato', icon: Target, format: (v: number) => formatEuro(v) },
  { key: 'utileNetto', label: 'Utile netto atteso', icon: DollarSign, format: (v: number) => formatEuro(v) },
  { key: 'roiAnnualizzato', label: 'ROI annualizzato', icon: TrendingUp, format: (v: number) => formatPercent(v) },
  { key: 'score', label: 'Score operazione', icon: Award, format: (v: number) => `${v}/100` },
] as const;

export function ResultsKpiCards({ maxPurchase, utileNetto, roiAnnualizzato, score }: Props) {
  const values = { maxPurchase, utileNetto, roiAnnualizzato, score };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ key, label, icon: Icon, format }) => (
        <div
          key={key}
          className="rounded-xl bg-card border shadow-sm p-4 flex flex-col gap-1 animate-fade-in"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
          </div>
          <span className="font-mono text-xl font-bold text-foreground">
            {format(values[key])}
          </span>
          {key === 'score' && (
            <span
              className="text-xs font-semibold mt-0.5"
              style={{ color: getStatoColor(score) }}
            >
              {getStato(score)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
