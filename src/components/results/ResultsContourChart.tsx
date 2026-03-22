import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import type { MetricKey, ScenarioRange, PointMetrics } from '@/utils/resultsCalculations';
import { calcPoint, getHeatColor, calcScenarioMetrics } from '@/utils/resultsCalculations';
import { formatEuro, formatPercent } from '@/utils/formatting';

interface Props {
  scenarios: ScenarioRange[];
  visibleScenarios: Record<string, boolean>;
  metric: MetricKey;
  speseFactor: number;
  mesi: number;
  taxRate: number;
  agenziaPerc: number;
  targetRoi: number;
  onScenarioClick: (id: string) => void;
}

const GRID = 50;
const CONTOUR_THRESHOLDS = [10, 20, 30, 40]; // ROI %

export function ResultsContourChart(props: Props) {
  const { scenarios, visibleScenarios, metric, speseFactor, mesi, taxRate, agenziaPerc, targetRoi, onScenarioClick } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: PointMetrics } | null>(null);
  const [scenarioTooltip, setScenarioTooltip] = useState<{ x: number; y: number; id: string } | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 500 });

  // Axis ranges derived from scenarios
  const axisRange = useMemo(() => {
    const allBuy = scenarios.flatMap(s => [s.acquistoMin, s.acquistoMax]);
    const allSell = scenarios.flatMap(s => [s.rivenditaMin, s.rivenditaMax]);
    const buyMin = Math.max(0, Math.min(...allBuy) * 0.6);
    const buyMax = Math.max(...allBuy) * 1.4;
    const sellMin = Math.max(0, Math.min(...allSell) * 0.6);
    const sellMax = Math.max(...allSell) * 1.4;
    return { buyMin, buyMax, sellMin, sellMax };
  }, [scenarios]);

  const spese = useMemo(() => {
    if (scenarios.length === 0) return 0;
    return scenarios[Math.floor(scenarios.length / 2)].speseBase * speseFactor;
  }, [scenarios, speseFactor]);

  // Resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: Math.floor(width), h: Math.floor(height) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Draw heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = dims;
    canvas.width = w;
    canvas.height = h;
    const { buyMin, buyMax, sellMin, sellMax } = axisRange;

    const cellW = w / GRID;
    const cellH = h / GRID;

    for (let ix = 0; ix < GRID; ix++) {
      for (let iy = 0; iy < GRID; iy++) {
        const acquisto = buyMin + (ix / (GRID - 1)) * (buyMax - buyMin);
        const rivendita = sellMax - (iy / (GRID - 1)) * (sellMax - sellMin);
        const p = calcPoint(acquisto, rivendita, spese, mesi, taxRate, agenziaPerc);
        const value = p[metric];
        ctx.fillStyle = getHeatColor(value, metric);
        ctx.fillRect(ix * cellW, iy * cellH, cellW + 1, cellH + 1);
      }
    }

    // Contour lines (ROI thresholds)
    if (metric === 'roi' || metric === 'roiAnnualizzato') {
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      ctx.font = '10px IBM Plex Sans';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for (const threshold of CONTOUR_THRESHOLDS) {
        ctx.beginPath();
        let started = false;
        for (let ix = 0; ix < GRID; ix++) {
          const acquisto = buyMin + (ix / (GRID - 1)) * (buyMax - buyMin);
          // Find rivendita where metric ≈ threshold via binary search
          let lo = sellMin, hi = sellMax;
          for (let iter = 0; iter < 20; iter++) {
            const mid = (lo + hi) / 2;
            const p = calcPoint(acquisto, mid, spese, mesi, taxRate, agenziaPerc);
            if (p[metric] < threshold) lo = mid; else hi = mid;
          }
          const rivendita = (lo + hi) / 2;
          const px = (ix / (GRID - 1)) * w;
          const py = ((sellMax - rivendita) / (sellMax - sellMin)) * h;
          if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke();
        // label
        const labelX = w * 0.92;
        const acq = buyMin + 0.92 * (buyMax - buyMin);
        let lo2 = sellMin, hi2 = sellMax;
        for (let iter = 0; iter < 20; iter++) {
          const mid = (lo2 + hi2) / 2;
          const p = calcPoint(acq, mid, spese, mesi, taxRate, agenziaPerc);
          if (p[metric] < threshold) lo2 = mid; else hi2 = mid;
        }
        const labelY = ((sellMax - (lo2 + hi2) / 2) / (sellMax - sellMin)) * h;
        ctx.fillText(`${threshold}%`, labelX, labelY - 4);
      }
    }

    // Axis labels on edges
    ctx.fillStyle = 'hsl(215, 15%, 47%)';
    ctx.font = '11px IBM Plex Sans';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const val = buyMin + (i / 4) * (buyMax - buyMin);
      ctx.fillText(`${Math.round(val / 1000)}k`, (i / 4) * w, h - 4);
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = sellMax - (i / 4) * (sellMax - sellMin);
      ctx.fillText(`${Math.round(val / 1000)}k`, w - 4, (i / 4) * h + 14);
    }
  }, [dims, axisRange, metric, spese, mesi, taxRate, agenziaPerc]);

  // Convert data coords to pixel
  const toPixel = useCallback((acq: number, riv: number) => {
    const { buyMin, buyMax, sellMin, sellMax } = axisRange;
    return {
      x: ((acq - buyMin) / (buyMax - buyMin)) * dims.w,
      y: ((sellMax - riv) / (sellMax - sellMin)) * dims.h,
    };
  }, [axisRange, dims]);

  // From pixel to data
  const toData = useCallback((px: number, py: number) => {
    const { buyMin, buyMax, sellMin, sellMax } = axisRange;
    return {
      acquisto: buyMin + (px / dims.w) * (buyMax - buyMin),
      rivendita: sellMax - (py / dims.h) * (sellMax - sellMin),
    };
  }, [axisRange, dims]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Check if hovering a scenario marker
    for (const s of scenarios) {
      if (!(visibleScenarios[s.id] ?? true)) continue;
      const sp = toPixel(s.acquistoBase, s.rivenditaBase);
      const dist = Math.hypot(px - sp.x, py - sp.y);
      if (dist < 20) {
        setScenarioTooltip({ x: px, y: py, id: s.id });
        setTooltip(null);
        return;
      }
    }
    setScenarioTooltip(null);

    const { acquisto, rivendita } = toData(px, py);
    if (acquisto > 0 && rivendita > 0) {
      const data = calcPoint(acquisto, rivendita, spese, mesi, taxRate, agenziaPerc);
      setTooltip({ x: px, y: py, data });
    }
  }, [scenarios, visibleScenarios, toPixel, toData, spese, mesi, taxRate, agenziaPerc]);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    setScenarioTooltip(null);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    for (const s of scenarios) {
      if (!(visibleScenarios[s.id] ?? true)) continue;
      const sp = toPixel(s.acquistoBase, s.rivenditaBase);
      if (Math.hypot(px - sp.x, py - sp.y) < 25) {
        onScenarioClick(s.id);
        return;
      }
    }
  }, [scenarios, visibleScenarios, toPixel, onScenarioClick]);

  const hoveredScenario = scenarioTooltip ? scenarios.find(s => s.id === scenarioTooltip.id) : null;
  const hoveredMetrics = hoveredScenario ? calcScenarioMetrics(hoveredScenario, speseFactor, mesi, taxRate, agenziaPerc) : null;

  return (
    <div className="rounded-xl bg-card border shadow-sm p-4 animate-fade-in">
      {/* Axis labels */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">← Prezzo acquisto (€) →</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">↑ Prezzo rivendita (€)</span>
      </div>

      <div
        ref={containerRef}
        className="relative w-full cursor-crosshair"
        style={{ minHeight: '500px', height: 'calc(100vh - 380px)', maxHeight: '700px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full rounded-lg" style={{ opacity: 0.85, transition: 'opacity 0.3s' }} />

        {/* SVG overlay for markers */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${dims.w} ${dims.h}`}>
          {scenarios.map(s => {
            if (!(visibleScenarios[s.id] ?? true)) return null;
            const center = toPixel(s.acquistoBase, s.rivenditaBase);
            const topLeft = toPixel(s.acquistoMin, s.rivenditaMax);
            const botRight = toPixel(s.acquistoMax, s.rivenditaMin);
            const rx = Math.abs(botRight.x - topLeft.x) / 2;
            const ry = Math.abs(botRight.y - topLeft.y) / 2;
            return (
              <g key={s.id}>
                {/* Uncertainty halo */}
                <ellipse
                  cx={center.x} cy={center.y} rx={rx} ry={ry}
                  fill={s.color} fillOpacity={0.12}
                  stroke={s.color} strokeWidth={1.5} strokeOpacity={0.4}
                  style={{ transition: 'all 0.4s ease' }}
                />
                {/* Center dot */}
                <circle
                  cx={center.x} cy={center.y} r={7}
                  fill={s.color} stroke="white" strokeWidth={2.5}
                  style={{ transition: 'all 0.4s ease', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                />
                {/* Label */}
                <text
                  x={center.x} y={center.y - 14}
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="600"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)', transition: 'all 0.4s ease' }}
                >
                  {s.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Background tooltip */}
        {tooltip && (
          <div
            className="absolute z-20 bg-popover/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 pointer-events-none text-xs space-y-1"
            style={{ left: Math.min(tooltip.x + 16, dims.w - 200), top: Math.min(tooltip.y + 16, dims.h - 200) }}
          >
            <div className="font-semibold text-foreground text-sm mb-1.5">{tooltip.data.stato}</div>
            <Row label="Acquisto" value={formatEuro(tooltip.data.acquisto)} />
            <Row label="Rivendita" value={formatEuro(tooltip.data.rivendita)} />
            <Row label="Utile netto" value={formatEuro(tooltip.data.utileNetto)} />
            <Row label="ROI" value={formatPercent(tooltip.data.roi)} />
            <Row label="ROI ann." value={formatPercent(tooltip.data.roiAnnualizzato)} />
            <Row label="Score" value={`${tooltip.data.score}/100`} />
          </div>
        )}

        {/* Scenario tooltip */}
        {hoveredScenario && hoveredMetrics && scenarioTooltip && (
          <div
            className="absolute z-20 bg-popover/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 pointer-events-none text-xs space-y-1.5 min-w-[220px]"
            style={{ left: Math.min(scenarioTooltip.x + 16, dims.w - 240), top: Math.min(scenarioTooltip.y + 16, dims.h - 280) }}
          >
            <div className="font-semibold text-foreground text-sm">{hoveredScenario.name}</div>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
              <span className="text-muted-foreground">Acquisto</span>
              <span className="font-mono">{formatEuro(hoveredScenario.acquistoMin)} – {formatEuro(hoveredScenario.acquistoMax)}</span>
              <span className="text-muted-foreground">Rivendita</span>
              <span className="font-mono">{formatEuro(hoveredScenario.rivenditaMin)} – {formatEuro(hoveredScenario.rivenditaMax)}</span>
              <span className="text-muted-foreground">Spese</span>
              <span className="font-mono">{formatEuro(hoveredScenario.speseMin)} – {formatEuro(hoveredScenario.speseMax)}</span>
              <span className="text-muted-foreground">Mesi</span>
              <span className="font-mono">{hoveredScenario.mesiMin} – {hoveredScenario.mesiMax}</span>
              <span className="text-muted-foreground">ROI range</span>
              <span className="font-mono">{formatPercent(hoveredMetrics.roiMin)} – {formatPercent(hoveredMetrics.roiMax)}</span>
              <span className="text-muted-foreground">Utile range</span>
              <span className="font-mono">{formatEuro(hoveredMetrics.utileMin)} – {formatEuro(hoveredMetrics.utileMax)}</span>
              <span className="text-muted-foreground">Robustezza</span>
              <span className="font-mono">{Math.round(hoveredMetrics.robustezza)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(0, 70%, 60%)' }} />
          Debole
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(38, 92%, 55%)' }} />
          Borderline
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(130, 60%, 45%)' }} />
          Buona
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(150, 70%, 35%)' }} />
          Molto interessante
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium text-foreground">{value}</span>
    </div>
  );
}
