import type { ProjectData, ScenarioResult, SaleScenario } from '@/types/project';

/**
 * Calculate the registration tax based on project settings.
 */
function calcRegistrationTax(project: ProjectData, basePrice: number): number {
  if (project.taxBase === 'catastale' && project.renditaCatastale > 0) {
    // Prezzo-valore: rendita catastale × 115.5 (first home) or × 126 (second home) × aliquota
    // Simplified: rendita × 126 × aliquota for investment
    const valoreCalcolato = project.renditaCatastale * 126;
    return valoreCalcolato * project.taxRate;
  }
  return basePrice * project.taxRate;
}

/**
 * Calculate total fixed expenses (everything except sale expenses and registration tax).
 */
function calcFixedExpenses(project: ProjectData): number {
  let total = 0;
  for (const cat of project.expenses) {
    if (cat.id === 'vendita') continue; // sale expenses are scenario-dependent
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

/**
 * Calculate sale expenses for a given sale price.
 */
function calcSaleExpenses(project: ProjectData, prezzoVendita: number): number {
  const vendita = project.expenses.find(c => c.id === 'vendita');
  if (!vendita) return 0;
  let total = 0;
  for (const item of vendita.items) {
    if (item.isPercentage && item.percentage) {
      total += prezzoVendita * (item.percentage / 100);
    } else {
      total += item.amount;
    }
  }
  return total;
}

/**
 * Calculate max bid (tetto massimo) algebraically.
 * Solves: PrezzoVendita - SpeseVendita - P*(1+aliquota) - SpeseFisse = target
 * Where target is max(minROI constraint, minUtile constraint)
 * 
 * ROI constraint: utile / costo >= minROI/100
 * => PV - SV - P(1+a) - SF >= (minROI/100) * (P(1+a) + SF)
 * => PV - SV - SF - (minROI/100)*SF >= P(1+a) * (1 + minROI/100)
 * => P <= (PV - SV - SF*(1+minROI/100)) / ((1+a)*(1+minROI/100))
 *
 * Utile constraint:
 * => PV - SV - P(1+a) - SF >= minUtile
 * => P <= (PV - SV - SF - minUtile) / (1+a)
 *
 * When taxBase is catastale, tax doesn't depend on P, so it's a fixed expense.
 */
function calcTettoMassimo(
  project: ProjectData,
  prezzoVendita: number,
): number {
  const speseVendita = calcSaleExpenses(project, prezzoVendita);
  const speseFisse = calcFixedExpenses(project);
  const minROIFrac = project.minROI / 100;

  if (project.taxBase === 'catastale' && project.renditaCatastale > 0) {
    // Tax is fixed (doesn't depend on P)
    const taxFixed = project.renditaCatastale * 126 * project.taxRate;
    const totalFixed = speseFisse + taxFixed;

    // ROI: PV - SV - P - totalFixed >= minROI * (P + totalFixed)
    // P <= (PV - SV - totalFixed*(1+minROI)) / (1 + minROI)
    const pRoi = (prezzoVendita - speseVendita - totalFixed * (1 + minROIFrac)) / (1 + minROIFrac);

    // Utile: PV - SV - P - totalFixed >= minUtile
    const pUtile = prezzoVendita - speseVendita - totalFixed - project.minUtileNetto;

    return Math.max(0, Math.min(pRoi, pUtile));
  }

  // Tax depends on P: tax = P * taxRate
  const aliquota = project.taxRate;
  const onePlusA = 1 + aliquota;

  // ROI: PV - SV - P*(1+a) - SF >= minROI * (P*(1+a) + SF)
  // PV - SV - SF*(1+minROI) >= P*(1+a)*(1+minROI)
  const pRoi = (prezzoVendita - speseVendita - speseFisse * (1 + minROIFrac)) / (onePlusA * (1 + minROIFrac));

  // Utile: PV - SV - P*(1+a) - SF >= minUtile
  const pUtile = (prezzoVendita - speseVendita - speseFisse - project.minUtileNetto) / onePlusA;

  return Math.max(0, Math.min(pRoi, pUtile));
}

function getEsito(roi: number, thresholds: import('@/types/project').RoiThresholds): ScenarioResult['esito'] {
  if (roi < thresholds.borderline) return 'non_conviene';
  if (roi < thresholds.conviene) return 'borderline';
  if (roi < thresholds.ottima) return 'conviene';
  if (roi < thresholds.eccellente) return 'ottima';
  return 'eccellente';
}

/**
 * Calculate results for a single sale scenario.
 */
export function calcScenarioResult(
  project: ProjectData,
  scenario: SaleScenario,
): ScenarioResult {
  const prezzoVendita = project.mq * scenario.euroPerMq;
  const prezzoAcquisto = project.prezzoAggiudicazione;
  const registrationTax = calcRegistrationTax(project, prezzoAcquisto);
  const fixedExpenses = calcFixedExpenses(project);
  const saleExpenses = calcSaleExpenses(project, prezzoVendita);

  const costoTotale = prezzoAcquisto + registrationTax + fixedExpenses + saleExpenses;
  const profittoLordo = prezzoVendita - costoTotale;
  const utileNetto = profittoLordo; // simplified (no income tax)
  const roi = costoTotale > 0 ? (utileNetto / costoTotale) * 100 : 0;
  const margine = prezzoVendita > 0 ? (utileNetto / prezzoVendita) * 100 : 0;
  const utileNettoMensile = project.durataOperazione > 0 ? utileNetto / project.durataOperazione : 0;
  const roiMensile = project.durataOperazione > 0 ? roi / project.durataOperazione : 0;
  const tettoMassimo = calcTettoMassimo(project, prezzoVendita);

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    prezzoVendita,
    costoTotale,
    profittoLordo,
    utileNetto,
    roi,
    margine,
    utileNettoMensile,
    roiMensile,
    tettoMassimo,
    esito: getEsito(roi),
    spesaVenditaTotale: saleExpenses,
  };
}

/**
 * Get the purchase range for the feasibility bar.
 */
export function getPurchaseRange(project: ProjectData): { min: number; max: number } {
  if (project.manualRangeMin !== null && project.manualRangeMax !== null) {
    return { min: project.manualRangeMin, max: project.manualRangeMax };
  }

  const start = project.startFrom === 'base' ? project.prezzoBase : project.offertaMinima;
  let simMax = start;
  if (project.auctionMode === 'simulazione' && project.numRilanci > 0) {
    simMax = start + project.numRilanci * project.rilancioMinimo;
  } else {
    simMax = project.prezzoAggiudicazione > 0 ? project.prezzoAggiudicazione * 1.3 : start * 1.5;
  }

  return {
    min: project.manualRangeMin ?? Math.min(start, project.prezzoAggiudicazione || start),
    max: project.manualRangeMax ?? Math.max(simMax, project.prezzoAggiudicazione || simMax),
  };
}
