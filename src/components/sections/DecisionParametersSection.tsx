import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import type { ProjectData, RoiThresholds } from '@/types/project';
import { Target } from 'lucide-react';

interface Props {
  project: ProjectData;
  onUpdate: (updates: Partial<ProjectData>) => void;
}

export function DecisionParametersSection({ project, onUpdate }: Props) {
  const updateThreshold = (key: keyof RoiThresholds, value: number) => {
    onUpdate({
      roiThresholds: {
        ...project.roiThresholds,
        [key]: value,
      },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Parametri Decisionali
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <CurrencyInput
            value={project.minROI}
            onChange={v => onUpdate({ minROI: v })}
            label="ROI minimo richiesto"
            suffix="%"
          />
          <CurrencyInput
            value={project.minUtileNetto}
            onChange={v => onUpdate({ minUtileNetto: v })}
            label="Utile netto minimo"
            suffix="€"
          />
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Soglie ROI (esito)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <CurrencyInput
              value={project.roiThresholds.borderline}
              onChange={v => updateThreshold('borderline', v)}
              label="Borderline da"
              suffix="%"
            />
            <CurrencyInput
              value={project.roiThresholds.conviene}
              onChange={v => updateThreshold('conviene', v)}
              label="Conviene da"
              suffix="%"
            />
            <CurrencyInput
              value={project.roiThresholds.ottima}
              onChange={v => updateThreshold('ottima', v)}
              label="Ottima da"
              suffix="%"
            />
            <CurrencyInput
              value={project.roiThresholds.eccellente}
              onChange={v => updateThreshold('eccellente', v)}
              label="Eccellente da"
              suffix="%"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
