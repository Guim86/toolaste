import { useMemo } from 'react';
import type { ProjectData, ScenarioResult } from '@/types/project';
import { calcScenarioResult, getPurchaseRange } from '@/utils/calculations';
import { FeasibilityBar, esitoConfig } from './FeasibilityBar';
import { formatEuro } from '@/utils/formatting';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  project: ProjectData;
}

export function ResultsSidebar({ project }: Props) {
  const results = useMemo(() => {
    return project.saleScenarios.map(s => calcScenarioResult(project, s));
  }, [project]);

  const purchaseRange = useMemo(() => getPurchaseRange(project), [project]);

  const allPositive = results.every(r => r.utileNetto > 0);
  const somePositive = results.some(r => r.utileNetto > 0);

  // Feasibility zone summary
  const minTetto = Math.min(...results.map(r => r.tettoMassimo));
  const maxTetto = Math.max(...results.map(r => r.tettoMassimo));
  const worstScenario = results.find(r => r.tettoMassimo === minTetto);
  const bestScenario = results.find(r => r.tettoMassimo === maxTetto);

  const hasData = project.mq > 0 && project.saleScenarios.some(s => s.euroPerMq > 0);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm">Risultati</h2>
        {project.nome && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{project.nome}</p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {!hasData ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Inserisci i dati del progetto per vedere i risultati</p>
              <p className="text-xs mt-1">Superficie, prezzo aggiudicazione e almeno uno scenario di vendita</p>
            </div>
          ) : (
            <>
              {/* Tetto massimo per scenario */}
              <div className="space-y-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tetto Max per scenario
                </h3>
                {results.map(r => (
                  <div key={r.scenarioId} className="flex justify-between items-center py-1">
                    <span className="text-sm">{r.scenarioName}</span>
                    <span className="font-mono text-sm font-semibold text-primary">
                      {formatEuro(r.tettoMassimo)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Feasibility zone summary */}
              <div className="bg-computed rounded-lg p-3 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Zona di fattibilità
                </h3>
                {minTetto > 0 ? (
                  <div className="space-y-1 text-sm">
                    <p>
                      ✅ Tutti gli scenari OK sotto{' '}
                      <span className="font-mono font-semibold text-success">{formatEuro(minTetto)}</span>
                    </p>
                    {maxTetto > minTetto && (
                      <p>
                        ⚠️ Solo {bestScenario?.scenarioName} sotto{' '}
                        <span className="font-mono font-semibold text-warning">{formatEuro(maxTetto)}</span>
                      </p>
                    )}
                    {project.prezzoAggiudicazione > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Prezzo attuale:{' '}
                        <span className={`font-mono font-semibold ${project.prezzoAggiudicazione <= minTetto ? 'text-success' : project.prezzoAggiudicazione <= maxTetto ? 'text-warning' : 'text-danger'}`}>
                          {formatEuro(project.prezzoAggiudicazione)}
                        </span>
                        {project.prezzoAggiudicazione <= minTetto && ' — dentro la zona sicura'}
                        {project.prezzoAggiudicazione > minTetto && project.prezzoAggiudicazione <= maxTetto && ' — zona rischiosa'}
                        {project.prezzoAggiudicazione > maxTetto && ' — fuori zona'}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-danger">Nessuno scenario risulta fattibile con i parametri attuali</p>
                )}
              </div>

              {/* Feasibility bars */}
              <div className="space-y-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Barre di fattibilità
                </h3>
                {results.map(r => (
                  <FeasibilityBar
                    key={r.scenarioId}
                    result={r}
                    purchaseRange={purchaseRange}
                    currentPrice={project.prezzoAggiudicazione}
                  />
                ))}
              </div>

              {/* Detailed results per scenario */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Dettaglio scenari
                </h3>
                {results.map(r => (
                  <div key={r.scenarioId} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{r.scenarioName}</span>
                      <span className="font-mono text-xs">{formatEuro(r.prezzoVendita)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo totale</span>
                        <span className="font-mono">{formatEuro(r.costoTotale)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profitto lordo</span>
                        <span className="font-mono">{formatEuro(r.profittoLordo)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Utile/mese</span>
                        <span className="font-mono">{formatEuro(r.utileNettoMensile)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROI/mese</span>
                        <span className="font-mono">{r.roiMensile.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
