import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import type { ProjectData } from '@/types/project';
import { Target } from 'lucide-react';

interface Props {
  project: ProjectData;
  onUpdate: (updates: Partial<ProjectData>) => void;
}

export function DecisionParametersSection({ project, onUpdate }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Parametri Decisionali
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
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
      </CardContent>
    </Card>
  );
}
