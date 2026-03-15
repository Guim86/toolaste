import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import type { ProjectData } from '@/types/project';
import { MapPin, Home, Calendar } from 'lucide-react';

interface Props {
  project: ProjectData;
  onUpdate: (updates: Partial<ProjectData>) => void;
}

export function ProjectInfoSection({ project, onUpdate }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Home className="h-4 w-4 text-primary" />
          Info Progetto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Nome progetto</label>
          <Input
            value={project.nome}
            onChange={e => onUpdate({ nome: e.target.value })}
            placeholder="Es. Appartamento Via Roma"
            className="text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              <MapPin className="h-3 w-3 inline mr-1" />Comune
            </label>
            <Input
              value={project.comune}
              onChange={e => onUpdate({ comune: e.target.value })}
              placeholder="Es. Milano"
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Indirizzo</label>
            <Input
              value={project.indirizzo}
              onChange={e => onUpdate({ indirizzo: e.target.value })}
              placeholder="Es. Via Roma 10"
              className="text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CurrencyInput
            value={project.mq}
            onChange={v => onUpdate({ mq: v })}
            label="Superficie (mq)"
            suffix="mq"
          />
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              <Calendar className="h-3 w-3 inline mr-1" />Durata (mesi)
            </label>
            <Input
              type="number"
              value={project.durataOperazione || ''}
              onChange={e => onUpdate({ durataOperazione: Number(e.target.value) || 0 })}
              placeholder="12"
              className="text-sm font-mono"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
