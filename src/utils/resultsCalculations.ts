import type { ProjectData } from '@/types/project';

// ─── Types ───────────────────────────────────────────────────────────
export interface ScenarioRange {
  id: string;
  name: string;
  acquistoMin: number;
  acquistoBase: number;
  acquistoMax: number;
  speseMin: number;
  speseBase: number;
  speseMax: number;
  rivenditaMin: number;
  rivenditaBase: number;
  rivenditaMax: number;
  mesiMin: number;
  mesiBase: number;
  mesiMax: number;
  color: string;
}

export type MetricKey = 'roi' | 'roiAnnualizzato' | 'utileNetto' | 'score';

export interface PointMetrics {
  acquisto: number;
  rivendita: number;
  spese: number;
  mesi: number;
  registrationTax: number;
  costoTotale: number;
  utileNetto: number;
  roi: number;
  roiAnnualizzato: number;
  score: number;
  stato: string;
}

export interface ScenarioMetrics extends PointMetrics {
  roiMin: number;
  roiMax: number;
  utileMin: number;
  utileMax: number;
  robustezza: number;
  sensibilitaSpese: number;
  sensibilitaTempo: number;
  sensibilitaRivendita: number;
}

// ─── Core calc for a single point ────────────────────────────────────
export function calcPoint(
  acquisto: number,
  rivendita: number,
  spese: number,
  mesi: number,
  taxRate: number,
  agenziaPerc: number,
): PointMetrics {
  const registrationTax = acquisto * taxRate;
  const costiVendita = rivendita * (agenziaPerc / 100);
  const costoTotale = acquisto + registrationTax + spese + costiVendita;
  const utileNetto = rivendita - costoTotale;
  const roi = costoTotale > 0 ? (utileNetto / costoTotale) * 100 : 0;
  const roiAnnualizzato = costoTotale > 0 && mesi > 0
    ? (Math.pow(1 + utileNetto / costoTotale, 12 / mesi) - 1) * 100
    : 0;
  const score = calcScore(roiAnnualizzato, utileNetto, mesi, roi);
  const stato = getStato(score);

  return { acquisto, rivendita, spese, mesi, registrationTax, costoTotale, utileNetto, roi, roiAnnualizzato, score, stato };
}

// ─── Score 0-100 ─────────────────────────────────────────────────────
function calcScore(roiAnn: number, utile: number, mesi: number, roi: number): number {
  // ROI annualizzato component (40%) — cap at 80%
  const roiNorm = Math.min(Math.max(roiAnn / 80, 0), 1);
  // Utile component (25%) — cap at 150k
  const utileNorm = Math.min(Math.max(utile / 150000, 0), 1);
  // Duration inverse (20%) — shorter is better, cap 2-36
  const durNorm = Math.min(Math.max((36 - mesi) / 34, 0), 1);
  // Safety margin (15%) — ROI > 0 needed
  const marginNorm = Math.min(Math.max(roi / 50, 0), 1);

  return Math.round((roiNorm * 40 + utileNorm * 25 + durNorm * 20 + marginNorm * 15));
}

export function getStato(score: number): string {
  if (score < 30) return 'Debole';
  if (score < 50) return 'Borderline';
  if (score < 75) return 'Buona';
  return 'Molto interessante';
}

export function getStatoColor(score: number): string {
  if (score < 30) return 'hsl(0, 70%, 60%)';
  if (score < 50) return 'hsl(38, 92%, 50%)';
  if (score < 75) return 'hsl(130, 60%, 45%)';
  return 'hsl(150, 70%, 35%)';
}

// ─── Heatmap color ───────────────────────────────────────────────────
export function getHeatColor(value: number, metric: MetricKey): string {
  let t: number;
  switch (metric) {
    case 'roi': t = (value + 10) / 60; break;         // -10..50 → 0..1
    case 'roiAnnualizzato': t = (value + 10) / 90; break; // -10..80 → 0..1
    case 'utileNetto': t = (value + 20000) / 170000; break; // -20k..150k → 0..1
    case 'score': t = value / 100; break;
    default: t = 0.5;
  }
  t = Math.max(0, Math.min(1, t));

  // Red → Amber → Green → Deep green
  if (t < 0.3) {
    const p = t / 0.3;
    return `hsl(${0 + p * 38}, ${70 + p * 22}%, ${60 - p * 5}%)`;
  }
  if (t < 0.6) {
    const p = (t - 0.3) / 0.3;
    return `hsl(${38 + p * 92}, ${92 - p * 32}%, ${55 - p * 10}%)`;
  }
  const p = (t - 0.6) / 0.4;
  return `hsl(${130 + p * 20}, ${60 + p * 10}%, ${45 - p * 10}%)`;
}

// ─── Extract project data into scenario ranges ──────────────────────
export function buildScenariosFromProject(project: ProjectData): ScenarioRange[] {
  const { prezzoAggiudicazione, mq, durataOperazione, saleScenarios, expenses } = project;

  // Fixed expenses
  let fixedExpenses = 0;
  for (const cat of expenses) {
    if (cat.id === 'vendita') continue;
    for (const item of cat.items) {
      fixedExpenses += item.isMonthly ? item.amount * durataOperazione : item.amount;
    }
  }

  // Agency percentage
  const vendita = expenses.find(c => c.id === 'vendita');
  const agenziaItem = vendita?.items.find(i => i.isPercentage);
  const agenziaPerc = agenziaItem?.percentage ?? 3;

  const colors = ['hsl(217, 80%, 56%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)'];

  const purchaseMin = project.manualRangeMin ?? prezzoAggiudicazione * 0.85;
  const purchaseMax = project.manualRangeMax ?? prezzoAggiudicazione * 1.15;

  return saleScenarios.map((s, i) => {
    const rivenditaBase = mq * s.euroPerMq;
    return {
      id: s.id,
      name: s.name,
      acquistoMin: purchaseMin,
      acquistoBase: prezzoAggiudicazione,
      acquistoMax: purchaseMax,
      speseMin: fixedExpenses * 0.7,
      speseBase: fixedExpenses,
      speseMax: fixedExpenses * 1.3,
      rivenditaMin: rivenditaBase * 0.85,
      rivenditaBase,
      rivenditaMax: rivenditaBase * 1.15,
      mesiMin: Math.max(2, Math.round(durataOperazione * 0.7)),
      mesiBase: durataOperazione,
      mesiMax: Math.round(durataOperazione * 1.3),
      color: colors[i % colors.length],
    };
  });
}

export function getAgenziaPerc(project: ProjectData): number {
  const vendita = project.expenses.find(c => c.id === 'vendita');
  const agenziaItem = vendita?.items.find(i => i.isPercentage);
  return agenziaItem?.percentage ?? 3;
}

export function getFixedExpenses(project: ProjectData, factor: number): number {
  let total = 0;
  for (const cat of project.expenses) {
    if (cat.id === 'vendita') continue;
    for (const item of cat.items) {
      total += item.isMonthly ? item.amount * project.durataOperazione : item.amount;
    }
  }
  return total * factor;
}

// ─── Scenario full metrics ───────────────────────────────────────────
export function calcScenarioMetrics(
  scenario: ScenarioRange,
  speseFactor: number,
  mesiOverride: number,
  taxRate: number,
  agenziaPerc: number,
): ScenarioMetrics {
  const spese = scenario.speseBase * speseFactor;
  const base = calcPoint(scenario.acquistoBase, scenario.rivenditaBase, spese, mesiOverride, taxRate, agenziaPerc);

  // Best case: low buy, high sell, low expenses, short time
  const best = calcPoint(scenario.acquistoMin, scenario.rivenditaMax, scenario.speseMin * speseFactor, scenario.mesiMin, taxRate, agenziaPerc);
  // Worst case: high buy, low sell, high expenses, long time
  const worst = calcPoint(scenario.acquistoMax, scenario.rivenditaMin, scenario.speseMax * speseFactor, scenario.mesiMax, taxRate, agenziaPerc);

  // Sensitivity analysis
  const baseUtile = base.utileNetto;
  const sensitivitySpese = baseUtile !== 0 ? Math.abs((calcPoint(scenario.acquistoBase, scenario.rivenditaBase, spese * 1.3, mesiOverride, taxRate, agenziaPerc).utileNetto - baseUtile) / baseUtile) * 100 : 0;
  const sensitivityTempo = baseUtile !== 0 ? Math.abs((calcPoint(scenario.acquistoBase, scenario.rivenditaBase, spese, Math.min(36, mesiOverride + 6), taxRate, agenziaPerc).utileNetto - baseUtile) / baseUtile) * 100 : 0;
  const sensitivityRivendita = baseUtile !== 0 ? Math.abs((calcPoint(scenario.acquistoBase, scenario.rivenditaBase * 0.9, spese, mesiOverride, taxRate, agenziaPerc).utileNetto - baseUtile) / baseUtile) * 100 : 0;

  const robustezza = Math.max(0, Math.min(100, 100 - (sensitivitySpese + sensitivityTempo + sensitivityRivendita) / 3));

  return {
    ...base,
    roiMin: worst.roi,
    roiMax: best.roi,
    utileMin: worst.utileNetto,
    utileMax: best.utileNetto,
    robustezza,
    sensibilitaSpese: Math.min(100, sensitivitySpese),
    sensibilitaTempo: Math.min(100, sensitivityTempo),
    sensibilitaRivendita: Math.min(100, sensitivityRivendita),
  };
}

// ─── Max recommended purchase price ──────────────────────────────────
export function calcMaxPurchase(
  rivendita: number,
  spese: number,
  mesi: number,
  taxRate: number,
  agenziaPerc: number,
  targetRoi: number,
): number {
  const costiVendita = rivendita * (agenziaPerc / 100);
  const targetFrac = targetRoi / 100;
  // utile / costo >= target → rivendita - costo >= target * costo
  // rivendita - costiVendita - P(1+tax) - spese >= target * (P(1+tax) + spese)
  // P(1+tax)(1+target) <= rivendita - costiVendita - spese(1+target)
  const denom = (1 + taxRate) * (1 + targetFrac);
  const num = rivendita - costiVendita - spese * (1 + targetFrac);
  return Math.max(0, num / denom);
}
