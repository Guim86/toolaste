import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { ProjectData, AuctionStartFrom, AuctionMode, TaxBase } from '@/types/project';
import { Gavel, Calculator } from 'lucide-react';
import { formatEuro } from '@/utils/formatting';

interface Props {
  project: ProjectData;
  onUpdate: (updates: Partial<ProjectData>) => void;
}

export function AuctionSimulationSection({ project, onUpdate }: Props) {
  const startPrice = project.startFrom === 'base' ? project.prezzoBase : project.offertaMinima;
  const simPrice = project.auctionMode === 'simulazione'
    ? startPrice + project.numRilanci * project.rilancioMinimo
    : project.prezzoAggiudicazione;

  // Update aggiudicazione when simulation changes
  const handleSimChange = (field: string, value: number) => {
    const updates: Partial<ProjectData> = { [field]: value };
    if (project.auctionMode === 'simulazione') {
      const base = field === 'numRilanci'
        ? startPrice + value * project.rilancioMinimo
        : startPrice + project.numRilanci * (field === 'rilancioMinimo' ? value : project.rilancioMinimo);
      updates.prezzoAggiudicazione = base;
    }
    onUpdate(updates);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Gavel className="h-4 w-4 text-primary" />
          Simulazione Asta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CurrencyInput value={project.prezzoBase} onChange={v => onUpdate({ prezzoBase: v })} label="Prezzo base" />
          <CurrencyInput value={project.offertaMinima} onChange={v => onUpdate({ offertaMinima: v })} label="Offerta minima" />
          <CurrencyInput value={project.rilancioMinimo} onChange={v => handleSimChange('rilancioMinimo', v)} label="Rilancio minimo" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Partenza da</label>
            <Select value={project.startFrom} onValueChange={v => onUpdate({ startFrom: v as AuctionStartFrom })}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="base">Prezzo base</SelectItem>
                <SelectItem value="offertaMinima">Offerta minima</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Modalità</label>
            <Select value={project.auctionMode} onValueChange={v => {
              const mode = v as AuctionMode;
              const updates: Partial<ProjectData> = { auctionMode: mode };
              if (mode === 'simulazione') {
                updates.prezzoAggiudicazione = startPrice + project.numRilanci * project.rilancioMinimo;
              }
              onUpdate(updates);
            }}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manuale">Manuale</SelectItem>
                <SelectItem value="simulazione">Simulazione rilanci</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {project.auctionMode === 'simulazione' ? (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Numero rilanci</label>
            <Input
              type="number"
              value={project.numRilanci || ''}
              onChange={e => handleSimChange('numRilanci', Number(e.target.value) || 0)}
              className="text-sm font-mono"
              min={0}
            />
          </div>
        ) : (
          <CurrencyInput
            value={project.prezzoAggiudicazione}
            onChange={v => onUpdate({ prezzoAggiudicazione: v })}
            label="Prezzo di aggiudicazione"
          />
        )}

        <div className="bg-computed rounded-md p-3 flex items-center justify-between">
          <span className="text-sm font-medium">Prezzo aggiudicazione</span>
          <span className="font-mono text-lg font-semibold text-primary">
            {formatEuro(project.prezzoAggiudicazione)}
          </span>
        </div>

        {/* Manual range override */}
        <div className="border-t pt-3">
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Range acquisto manuale (opzionale)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <CurrencyInput
              value={project.manualRangeMin ?? 0}
              onChange={v => onUpdate({ manualRangeMin: v || null })}
              label="Minimo"
              placeholder="Auto"
            />
            <CurrencyInput
              value={project.manualRangeMax ?? 0}
              onChange={v => onUpdate({ manualRangeMax: v || null })}
              label="Massimo"
              placeholder="Auto"
            />
          </div>
        </div>

        {/* Tax settings */}
        <div className="border-t pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Base imponibile</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Prezzo asta</span>
              <Switch
                checked={project.taxBase === 'catastale'}
                onCheckedChange={v => onUpdate({ taxBase: v ? 'catastale' : 'prezzoAsta' })}
              />
              <span className="text-xs text-muted-foreground">Valore catastale</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Aliquota</label>
              <Select value={String(project.taxRate)} onValueChange={v => onUpdate({ taxRate: parseFloat(v) })}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.02">2% (prima casa)</SelectItem>
                  <SelectItem value="0.09">9% (seconda casa)</SelectItem>
                  <SelectItem value="0.04">4% IVA (prima casa)</SelectItem>
                  <SelectItem value="0.1">10% IVA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {project.taxBase === 'catastale' && (
              <CurrencyInput
                value={project.renditaCatastale}
                onChange={v => onUpdate({ renditaCatastale: v })}
                label="Rendita catastale"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
