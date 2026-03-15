import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectData } from '@/types/project';
import { FileText } from 'lucide-react';

interface Props {
  project: ProjectData;
  onUpdate: (updates: Partial<ProjectData>) => void;
}

export function NotesSection({ project, onUpdate }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Note
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={project.note}
          onChange={e => onUpdate({ note: e.target.value })}
          placeholder="Appunti, considerazioni, link alla perizia..."
          rows={4}
          className="text-sm"
        />
      </CardContent>
    </Card>
  );
}
