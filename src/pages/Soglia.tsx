import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/useProject';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { formatEuro, formatPercent } from '@/utils/formatting';
import type { ProjectData } from '@/types/project';

/* ─── Calculation helpers ─── */

function calcFixedExpenses(project: ProjectData): number {
  let total = 0;
  for (const cat of project.expenses) {
    if (cat.id === 'vendita') continue;
    for (const item of cat.items) {
      if (item.isMonthly) {
        total += item.amount * project.durataOperazione;
      } else {
        total += item.amount;
      }
    }
  }
  return total;
}

function getAgencyInfo(project: ProjectData): { label: string; pct: number } {
  const vendita = project.expenses.find(c => c.id === 'vendita');
  if (!vendita) return { label: 'Agenzia', pct: 0 };
  const agenzia = vendita.items.find(i => i.id === 'agenzia');
  if (!agenzia) return { label: 'Agenzia', pct: 0 };
  return { label: agenzia.label, pct: agenzia.percentage ?? 0 };
}

function getSalePercentage(project: ProjectData): number {
  const vendita = project.expenses.find(c => c.id === 'vendita');
  if (!vendita) return 0;
  let pct = 0;
  for (const item of vendita.items) {
    if (item.isPercentage && item.percentage) pct += item.percentage;
  }
  return pct;
}

function calcTax(project: ProjectData, purchasePrice: number): number {
  if (project.taxBase === 'catastale' && project.renditaCatastale > 0) {
    return project.renditaCatastale * 126 * project.taxRate;
  }
  return purchasePrice * project.taxRate;
}

function calcTotalInvested(project: ProjectData, purchasePrice: number, fixedExp: number): number {
  return purchasePrice + calcTax(project, purchasePrice) + fixedExp;
}

function calcMinResale(totalInvested: number, roiTarget: number, salePct: number): number {
  return totalInvested * (1 + roiTarget / 100) / (1 - salePct / 100);
}

function calcROI(resale: number, totalInvested: number, salePct: number): number {
  if (totalInvested <= 0) return 0;
  return ((resale * (1 - salePct / 100) - totalInvested) / totalInvested) * 100;
}

function calcMaxPurchase(project: ProjectData, resale: number, roiTarget: number, fixedExp: number, salePct: number): number {
  const netResale = resale * (1 - salePct / 100);
  const required = netResale / (1 + roiTarget / 100);
  if (project.taxBase === 'catastale' && project.renditaCatastale > 0) {
    const taxFixed = project.renditaCatastale * 126 * project.taxRate;
    return Math.max(0, required - fixedExp - taxFixed);
  }
  return Math.max(0, (required - fixedExp) / (1 + project.taxRate));
}

/* ─── Canvas chart ─── */

interface ChartProps {
  project: ProjectData;
  purchasePrice: number;
  resalePrice: number;
  roiTarget: number;
  fixedExp: number;
  salePct: number;
  purchaseRange: [number, number];
}

function ThresholdChart({ project, purchasePrice, resalePrice, roiTarget, fixedExp, salePct, purchaseRange }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; purchase: number; resale: number; minResale: number; roi: number; margin: number; valid: boolean } | null>(null);

  const scenarios = useMemo(() =>
    project.saleScenarios
      .filter(s => s.euroPerMq > 0)
      .map(s => ({ name: s.name, resale: s.euroPerMq * project.mq })),
    [project.saleScenarios, project.mq]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const W = rect.width;
    const H = Math.min(480, rect.width * 0.6);

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const pad = { top: 20, right: 30, bottom: 50, left: 80 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;

    const xMin = purchaseRange[0];
    const xMax = purchaseRange[1];

    const yAtMin = calcMinResale(calcTotalInvested(project, xMin, fixedExp), roiTarget, salePct);
    const yAtMax = calcMinResale(calcTotalInvested(project, xMax, fixedExp), roiTarget, salePct);
    const allResales = [yAtMin, yAtMax, resalePrice, ...scenarios.map(s => s.resale)];
    const yDataMin = Math.min(...allResales) * 0.8;
    const yDataMax = Math.max(...allResales) * 1.2;

    const toX = (v: number) => pad.left + ((v - xMin) / (xMax - xMin)) * cw;
    const toY = (v: number) => pad.top + ch - ((v - yDataMin) / (yDataMax - yDataMin)) * ch;
    const fromX = (px: number) => xMin + ((px - pad.left) / cw) * (xMax - xMin);
    const fromY = (py: number) => yDataMin + ((ch - (py - pad.top)) / ch) * (yDataMax - yDataMin);

    ctx.clearRect(0, 0, W, H);

    // Threshold line points
    const steps = 200;
    const thresholdPoints: { x: number; y: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const p = xMin + (i / steps) * (xMax - xMin);
      const inv = calcTotalInvested(project, p, fixedExp);
      const minR = calcMinResale(inv, roiTarget, salePct);
      thresholdPoints.push({ x: toX(p), y: toY(minR) });
    }

    // Green above
    ctx.beginPath();
    ctx.moveTo(thresholdPoints[0].x, pad.top);
    for (const pt of thresholdPoints) ctx.lineTo(pt.x, pt.y);
    ctx.lineTo(thresholdPoints[thresholdPoints.length - 1].x, pad.top);
    ctx.closePath();
    ctx.fillStyle = 'hsla(160, 84%, 39%, 0.08)';
    ctx.fill();

    // Red below
    ctx.beginPath();
    ctx.moveTo(thresholdPoints[0].x, pad.top + ch);
    for (const pt of thresholdPoints) ctx.lineTo(pt.x, pt.y);
    ctx.lineTo(thresholdPoints[thresholdPoints.length - 1].x, pad.top + ch);
    ctx.closePath();
    ctx.fillStyle = 'hsla(0, 84%, 60%, 0.08)';
    ctx.fill();

    // Threshold line
    ctx.beginPath();
    ctx.moveTo(thresholdPoints[0].x, thresholdPoints[0].y);
    for (let i = 1; i < thresholdPoints.length; i++) {
      ctx.lineTo(thresholdPoints[i].x, thresholdPoints[i].y);
    }
    ctx.strokeStyle = 'hsl(160, 84%, 39%)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dashed reference lines
    const px = toX(purchasePrice);
    const py = toY(resalePrice);
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'hsl(215, 15%, 60%)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, pad.top); ctx.lineTo(px, pad.top + ch); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.left, py); ctx.lineTo(pad.left + cw, py); ctx.stroke();
    ctx.setLineDash([]);

    // Scenario markers
    for (const sc of scenarios) {
      const sx = toX(purchasePrice);
      const sy = toY(sc.resale);
      if (sy >= pad.top && sy <= pad.top + ch) {
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(38, 92%, 50%)';
        ctx.fill();
        ctx.strokeStyle = 'hsl(38, 92%, 35%)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = 'hsl(38, 92%, 35%)';
        ctx.font = '11px IBM Plex Sans, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(sc.name, sx + 8, sy + 4);
      }
    }

    // Current position point
    const inv = calcTotalInvested(project, purchasePrice, fixedExp);
    const minR = calcMinResale(inv, roiTarget, salePct);
    const isValid = resalePrice >= minR;
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fillStyle = isValid ? 'hsl(160, 84%, 39%)' : 'hsl(0, 84%, 60%)';
    ctx.fill();
    ctx.strokeStyle = isValid ? 'hsl(160, 84%, 25%)' : 'hsl(0, 84%, 40%)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Axes
    ctx.strokeStyle = 'hsl(214, 25%, 80%)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + ch);
    ctx.lineTo(pad.left + cw, pad.top + ch);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = 'hsl(215, 15%, 47%)';
    ctx.font = '11px IBM Plex Sans, sans-serif';
    ctx.textAlign = 'center';

    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const v = xMin + (i / xTicks) * (xMax - xMin);
      const x = toX(v);
      ctx.fillText(formatCompact(v), x, pad.top + ch + 20);
      ctx.beginPath(); ctx.moveTo(x, pad.top + ch); ctx.lineTo(x, pad.top + ch + 5); ctx.strokeStyle = 'hsl(214, 25%, 80%)'; ctx.stroke();
    }

    ctx.textAlign = 'right';
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const v = yDataMin + (i / yTicks) * (yDataMax - yDataMin);
      const y = toY(v);
      ctx.fillText(formatCompact(v), pad.left - 8, y + 4);
      ctx.beginPath(); ctx.moveTo(pad.left - 4, y); ctx.lineTo(pad.left, y); ctx.strokeStyle = 'hsl(214, 25%, 80%)'; ctx.stroke();
    }

    ctx.fillStyle = 'hsl(215, 15%, 47%)';
    ctx.font = '12px IBM Plex Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Prezzo di acquisto (€)', pad.left + cw / 2, H - 5);

    ctx.save();
    ctx.translate(14, pad.top + ch / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Prezzo di rivendita (€)', 0, 0);
    ctx.restore();

    (canvas as any)._chartMeta = { pad, cw, ch, xMin, xMax, yDataMin, yDataMax, fromX, fromY };
  }, [project, purchasePrice, resalePrice, roiTarget, fixedExp, salePct, purchaseRange, scenarios]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const meta = (canvas as any)._chartMeta;
    if (!meta) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (mx < meta.pad.left || mx > meta.pad.left + meta.cw || my < meta.pad.top || my > meta.pad.top + meta.ch) {
      setTooltip(null);
      return;
    }

    const purchase = meta.fromX(mx);
    const resale = meta.fromY(my);
    const inv = calcTotalInvested(project, purchase, fixedExp);
    const minResale = calcMinResale(inv, roiTarget, salePct);
    const roi = calcROI(resale, inv, salePct);
    const margin = resale - minResale;

    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, purchase, resale, minResale, roi, margin, valid: resale >= minResale });
  }, [project, fixedExp, roiTarget, salePct]);

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      />
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none rounded-lg border bg-popover p-3 shadow-md text-xs space-y-1 max-w-[220px]"
          style={{ left: Math.min(tooltip.x + 12, (containerRef.current?.clientWidth ?? 300) - 230), top: tooltip.y - 10 }}
        >
          <div className="font-medium text-foreground">Acquisto: {formatEuro(tooltip.purchase)}</div>
          <div className="text-foreground">Rivendita: {formatEuro(tooltip.resale)}</div>
          <div className="text-muted-foreground">Rivendita min.: {formatEuro(tooltip.minResale)}</div>
          <div className="text-muted-foreground">ROI: {formatPercent(tooltip.roi)}</div>
          <div className="text-muted-foreground">Margine: {formatEuro(tooltip.margin)}</div>
          <Badge variant={tooltip.valid ? 'default' : 'destructive'} className="mt-1">
            {tooltip.valid ? 'Zona valida' : 'Zona non valida'}
          </Badge>
        </div>
      )}
    </div>
  );
}

function formatCompact(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return v.toFixed(0);
}

function HomeButton() {
  const navigate = useNavigate();
  return (
    <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => navigate('/')}>
      <Home className="h-3 w-3" />
      HOME
    </Button>
  );
}

/* ─── Main page ─── */

export default function Soglia() {
  const { project } = useProject();

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Nessun progetto attivo. Torna alla pagina principale e crea un progetto.
      </div>
    );
  }

  return <SogliaContent project={project} />;
}

function SogliaContent({ project }: { project: ProjectData }) {
  const basePrice = project.prezzoAggiudicazione > 0 ? project.prezzoAggiudicazione : project.prezzoBase;
  const mediumScenario = project.saleScenarios.find(s => s.id === 'medio');
  const baseResale = mediumScenario && mediumScenario.euroPerMq > 0 ? mediumScenario.euroPerMq * project.mq : basePrice * 1.3;

  const projectFixedExp = useMemo(() => calcFixedExpenses(project), [project.expenses, project.durataOperazione]);
  const salePct = useMemo(() => getSalePercentage(project), [project.expenses]);
  const agencyInfo = useMemo(() => getAgencyInfo(project), [project.expenses]);

  const [purchasePrice, setPurchasePrice] = useState(basePrice);
  const [resalePrice, setResalePrice] = useState(baseResale);
  const [roiTarget, setRoiTarget] = useState(project.minROI);
  const [fixedExp, setFixedExp] = useState(projectFixedExp);

  // Reset sliders when project defaults change
  useEffect(() => {
    const bp = project.prezzoAggiudicazione > 0 ? project.prezzoAggiudicazione : project.prezzoBase;
    setPurchasePrice(bp);
  }, [project.prezzoAggiudicazione, project.prezzoBase]);

  useEffect(() => {
    setRoiTarget(project.minROI);
  }, [project.minROI]);

  useEffect(() => {
    const ms = project.saleScenarios.find(s => s.id === 'medio');
    const br = ms && ms.euroPerMq > 0 ? ms.euroPerMq * project.mq : (project.prezzoAggiudicazione > 0 ? project.prezzoAggiudicazione : project.prezzoBase) * 1.3;
    setResalePrice(br);
  }, [project.saleScenarios, project.mq, project.prezzoAggiudicazione, project.prezzoBase]);

  useEffect(() => {
    setFixedExp(projectFixedExp);
  }, [projectFixedExp]);

  const totalInvested = calcTotalInvested(project, purchasePrice, fixedExp);
  const minResale = calcMinResale(totalInvested, roiTarget, salePct);
  const currentROI = calcROI(resalePrice, totalInvested, salePct);
  const margin = resalePrice - minResale;
  const maxPurchase = calcMaxPurchase(project, resalePrice, roiTarget, fixedExp, salePct);
  const isValid = resalePrice >= minResale;

  // Purchase range: min = offertaMinima (can't buy lower), max = 160% of base
  const purchaseMin = project.offertaMinima > 0 ? project.offertaMinima : Math.max(1, Math.round(basePrice * 0.5));
  const purchaseMax = Math.round(basePrice * 1.6);
  const resaleMin = Math.max(1, Math.round(baseResale * 0.6));
  const resaleMax = Math.round(baseResale * 1.5);
  const expMin = Math.max(0, Math.round(projectFixedExp * 0.3));
  const expMax = Math.round(projectFixedExp * 2.5);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{project.nome || 'Progetto senza nome'}</h1>
            {project.comune && <p className="text-sm text-muted-foreground">{project.comune}</p>}
          </div>
          <HomeButton />
        </div>

        {/* KPI Cards — compact row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="py-3 px-4 space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Max acquisto per ROI {roiTarget}%</p>
              <p className={`text-lg font-mono font-bold ${purchasePrice <= maxPurchase ? 'text-success' : 'text-destructive'}`}>
                {formatEuro(maxPurchase)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {purchasePrice <= maxPurchase ? 'Sotto il massimo ✓' : 'Supera il massimo ✗'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4 space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Margine dalla soglia</p>
              <p className={`text-lg font-mono font-bold ${margin > minResale * 0.1 ? 'text-success' : margin >= 0 ? 'text-warning' : 'text-destructive'}`}>
                {formatEuro(margin)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Rivendita min.: {formatEuro(minResale)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4 space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Stato operazione</p>
              <div className="flex items-center gap-2">
                <Badge variant={isValid ? 'default' : 'destructive'} className={isValid ? 'bg-success text-success-foreground' : ''}>
                  {isValid ? 'Valida' : 'Non valida'}
                </Badge>
                <span className="font-mono text-lg font-bold text-foreground">{formatPercent(currentROI)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Target: {formatPercent(roiTarget)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sliders — compact */}
        <Card>
          <CardContent className="py-4 px-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prezzo di acquisto</span>
                  <span className="font-mono font-semibold text-foreground">{formatEuro(purchasePrice)}</span>
                </div>
                <Slider
                  value={[purchasePrice]}
                  onValueChange={([v]) => setPurchasePrice(v)}
                  min={purchaseMin}
                  max={purchaseMax}
                  step={Math.max(100, Math.round((purchaseMax - purchaseMin) / 500))}
                />
                {project.offertaMinima > 0 && (
                  <p className="text-[10px] text-muted-foreground">Min: offerta minima {formatEuro(project.offertaMinima)}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prezzo di rivendita</span>
                  <span className="font-mono font-semibold text-foreground">{formatEuro(resalePrice)}</span>
                </div>
                <Slider
                  value={[resalePrice]}
                  onValueChange={([v]) => setResalePrice(v)}
                  min={resaleMin}
                  max={resaleMax}
                  step={Math.max(100, Math.round((resaleMax - resaleMin) / 500))}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spese fisse totali</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatEuro(fixedExp)}
                    {fixedExp !== projectFixedExp && (
                      <span className="text-muted-foreground font-normal text-xs ml-1">(progetto: {formatEuro(projectFixedExp)})</span>
                    )}
                  </span>
                </div>
                <Slider
                  value={[fixedExp]}
                  onValueChange={([v]) => setFixedExp(v)}
                  min={expMin}
                  max={expMax}
                  step={Math.max(100, Math.round((expMax - expMin) / 500))}
                />
                <p className="text-[10px] text-muted-foreground">
                  Valore progetto: {formatEuro(projectFixedExp)} — {agencyInfo.label} esclusa ({agencyInfo.pct}% sul prezzo di vendita)
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ROI target</span>
                  <span className="font-mono font-semibold text-foreground">{formatPercent(roiTarget)}</span>
                </div>
                <Slider
                  value={[roiTarget]}
                  onValueChange={([v]) => setRoiTarget(v)}
                  min={5}
                  max={60}
                  step={1}
                />
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-0.5 pt-2 border-t border-border">
              <span>Durata: <span className="font-medium text-foreground">{project.durataOperazione} mesi</span></span>
              <span>Aliquota tasse: <span className="font-medium text-foreground">{formatPercent(project.taxRate * 100)}</span></span>
              <span className="text-muted-foreground/70 italic">Modificabili nelle rispettive sezioni del progetto.</span>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Soglia rivendita minima per ROI {formatPercent(roiTarget)}</h2>
            <ThresholdChart
              project={project}
              purchasePrice={purchasePrice}
              resalePrice={resalePrice}
              roiTarget={roiTarget}
              fixedExp={fixedExp}
              salePct={salePct}
              purchaseRange={[purchaseMin, purchaseMax]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
