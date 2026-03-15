import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProjectData } from '@/types/project';
import { Plus, Copy, Trash2, Download, Upload } from 'lucide-react';
import { useRef } from 'react';

interface Props {
  projects: ProjectData[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (data: ProjectData) => void;
}

export function ProjectManager({
  projects,
  activeId,
  onSelect,
  onNew,
  onDuplicate,
  onDelete,
  onExport,
  onImport,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        onImport(data);
      } catch {
        alert('File non valido');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={activeId} onValueChange={onSelect}>
        <SelectTrigger className="w-52 text-sm h-8">
          <SelectValue placeholder="Seleziona progetto" />
        </SelectTrigger>
        <SelectContent>
          {projects.map(p => (
            <SelectItem key={p.id} value={p.id}>
              {p.nome || 'Senza nome'} — {p.comune || '?'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNew} title="Nuovo">
        <Plus className="h-3.5 w-3.5" />
      </Button>
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onDuplicate(activeId)} title="Duplica">
        <Copy className="h-3.5 w-3.5" />
      </Button>
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={onExport} title="Esporta JSON">
        <Download className="h-3.5 w-3.5" />
      </Button>
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => fileRef.current?.click()} title="Importa JSON">
        <Upload className="h-3.5 w-3.5" />
      </Button>
      {projects.length > 1 && (
        <Button variant="outline" size="icon" className="h-8 w-8 text-danger" onClick={() => {
          if (confirm('Eliminare questo progetto?')) onDelete(activeId);
        }} title="Elimina">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
    </div>
  );
}
