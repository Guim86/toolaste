import { useState, useMemo, useCallback } from 'react';
import { useProject } from '@/hooks/useProject';
import { ResultsKpiCards } from '@/components/results/ResultsKpiCards';
import { ResultsControls } from '@/components/results/ResultsControls';
import { ResultsContourChart } from '@/components/results/ResultsContourChart';
import { ScenarioDrawer } from '@/components/results/ScenarioDrawer';
import {
  buildScenariosFromProject,
  getAgenziaPerc,
  calcPoint,
  calcMaxPurchase,
  calcScenarioMetrics,
  type MetricKey,
} from '@/utils/resultsCalculations';

const Results = () => {
  const { project } = useProject();

  const scenarios = useMemo(() => project ? buildScenariosFromProject(project) : [], [project]);
  const agenziaPerc = project ? getAgenziaPerc(project) : 3;
  const taxRate = project?.taxRate ?? 0.09;
  const defaultMesi = project?.durataOperazione ?? 12;
  const defaultTargetRoi = project?.minROI ?? 30;

  const [metric, setMetric] = useState<MetricKey>('roiAnnualizzato');
  const [speseFactor, setSpeseFactor] = useState(1);
  const [mesi, setMesi] = useState(defaultMesi);
  const [targetRoi, setTargetRoi] = useState(defaultTargetRoi);
  const [visibleScenarios, setVisibleScenarios] = useState<Record<string, boolean>>({});
  const [drawerScenarioId, setDrawerScenarioId] = useState<string | null>(null);

  const toggleScenario = useCallback((id: string) => {
    setVisibleScenarios(prev => ({ ...prev, [id]: !(prev[id] ?? true) }));
  }, []);

  const handleReset = useCallback(() => {
    setMetric('roiAnnualizzato');
    setSpeseFactor(1);
    setMesi(defaultMesi);
    setTargetRoi(defaultTargetRoi);
    setVisibleScenarios({});
  }, [defaultMesi, defaultTargetRoi]);

  // KPI values from middle scenario (equilibrato)
  const middleScenario = scenarios[Math.floor(scenarios.length / 2)] ?? scenarios[0];
  const kpi = useMemo(() => {
    if (!middleScenario) return { maxPurchase: 0, utileNetto: 0, roiAnnualizzato: 0, score: 0 };
    const spese = middleScenario.speseBase * speseFactor;
    const m = calcScenarioMetrics(middleScenario, speseFactor, mesi, taxRate, agenziaPerc);
    const maxPurchase = calcMaxPurchase(middleScenario.rivenditaBase, spese, mesi, taxRate, agenziaPerc, targetRoi);
    return { maxPurchase, utileNetto: m.utileNetto, roiAnnualizzato: m.roiAnnualizzato, score: m.score };
  }, [middleScenario, speseFactor, mesi, taxRate, agenziaPerc, targetRoi]);

  // Drawer
  const drawerScenario = drawerScenarioId ? scenarios.find(s => s.id === drawerScenarioId) ?? null : null;
  const drawerMetrics = drawerScenario ? calcScenarioMetrics(drawerScenario, speseFactor, mesi, taxRate, agenziaPerc) : null;

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Nessun progetto trovato. Crea un progetto nella pagina principale.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Motore Decisionale
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {project.nome || 'Progetto senza nome'} · {project.mq} mq · {project.comune}
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            TOO-LA<span className="text-primary">(S)</span>TE
          </span>
        </div>

        {/* KPI Cards */}
        <ResultsKpiCards
          maxPurchase={kpi.maxPurchase}
          utileNetto={kpi.utileNetto}
          roiAnnualizzato={kpi.roiAnnualizzato}
          score={kpi.score}
        />

        {/* Controls */}
        <ResultsControls
          metric={metric}
          setMetric={setMetric}
          speseFactor={speseFactor}
          setSpeseFactor={setSpeseFactor}
          mesi={mesi}
          setMesi={setMesi}
          targetRoi={targetRoi}
          setTargetRoi={setTargetRoi}
          visibleScenarios={visibleScenarios}
          toggleScenario={toggleScenario}
          scenarios={scenarios}
          onReset={handleReset}
        />

        {/* Main Chart */}
        <ResultsContourChart
          scenarios={scenarios}
          visibleScenarios={visibleScenarios}
          metric={metric}
          speseFactor={speseFactor}
          mesi={mesi}
          taxRate={taxRate}
          agenziaPerc={agenziaPerc}
          targetRoi={targetRoi}
          onScenarioClick={setDrawerScenarioId}
        />
      </div>

      {/* Scenario Drawer */}
      <ScenarioDrawer
        open={!!drawerScenarioId}
        onClose={() => setDrawerScenarioId(null)}
        scenario={drawerScenario}
        metrics={drawerMetrics}
      />
    </div>
  );
};

export default Results;
