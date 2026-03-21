import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import type { ProjectData, SaleScenario } from '@/types/project';
import { TrendingUp, Plus, X } from 'lucide-react';
import { formatEuro } from '@/utils/formatting';

interface Props {
  project: ProjectData;
  onUpdate: (updates: Partial<ProjectData>) => void;
}

export function SaleScenariosSection({ project, onUpdate }: Props) {
  const updateScenario = (id: string, updates: Partial<SaleScenario>) => {
    onUpdate({
      saleScenarios: project.saleScenarios.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  const addScenario = () => {
    const newScenario: SaleScenario = {
      id: crypto.randomUUID(),
      name: `Scenario ${project.saleScenarios.length + 1}`,
      euroPerMq: 0,
    };
    onUpdate({ saleScenarios: [...project.saleScenarios, newScenario] });
  };

  const removeScenario = (id: string) => {
    if (project.saleScenarios.length <= 2) return;
    onUpdate({ saleScenarios: project.saleScenarios.filter(s => s.id !== id) });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Scenari di Vendita
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {project.saleScenarios.map((scenario, i) => (
          <div key={scenario.id} className="flex flex-col sm:flex-row sm:items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {i < 3 ? '' : 'Nome'}
              </label>
              <Input
                value={scenario.name}
                onChange={e => updateScenario(scenario.id, { name: e.target.value })}
                className="text-sm"
                placeholder="Nome scenario"
              />
            </div>
            <div className="flex items-end gap-2">
              <CurrencyInput
                value={scenario.euroPerMq}
                onChange={v => updateScenario(scenario.id, { euroPerMq: v })}
                label="€/mq"
                suffix="€/mq"
                className="w-32"
              />
              <div className="w-32">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Totale</label>
                <div className="h-10 flex items-center px-3 bg-computed rounded-md font-mono text-sm">
                  {formatEuro(project.mq * scenario.euroPerMq)}
                </div>
              </div>
              {project.saleScenarios.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => removeScenario(scenario.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addScenario} className="w-full">
          <Plus className="h-3 w-3 mr-1" /> Aggiungi scenario
        </Button>
      </CardContent>
    </Card>
  );
}
