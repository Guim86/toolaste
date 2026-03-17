export type ExpenseStatus = 'certa' | 'stimata' | 'daVerificare';

export interface ExpenseItem {
  id: string;
  label: string;
  amount: number;
  status: ExpenseStatus;
  isCustom?: boolean;
  isPercentage?: boolean; // for sale expenses based on % of sale price
  percentage?: number;
  isMonthly?: boolean; // for monthly expenses multiplied by duration
}

export interface ExpenseCategory {
  id: string;
  label: string;
  items: ExpenseItem[];
}

export interface SaleScenario {
  id: string;
  name: string;
  euroPerMq: number;
}

export type AuctionStartFrom = 'base' | 'offertaMinima';
export type AuctionMode = 'manuale' | 'simulazione';
export type TaxBase = 'prezzoAsta' | 'catastale';

export interface RoiThresholds {
  borderline: number;   // default 25 — da qui inizia "borderline"
  conviene: number;     // default 30 — da qui inizia "conviene"
  ottima: number;       // default 40 — da qui inizia "ottima"
  eccellente: number;   // default 50 — da qui inizia "eccellente"
}

export interface ProjectData {
  // Info progetto
  nome: string;
  comune: string;
  indirizzo: string;
  mq: number;
  durataOperazione: number; // months

  // Parametri decisionali
  minROI: number; // %
  minUtileNetto: number; // €
  roiThresholds: RoiThresholds;

  // Simulazione asta
  prezzoBase: number;
  offertaMinima: number;
  rilancioMinimo: number;
  startFrom: AuctionStartFrom;
  auctionMode: AuctionMode;
  numRilanci: number;
  prezzoAggiudicazione: number;
  // Range manuale opzionale
  manualRangeMin: number | null;
  manualRangeMax: number | null;

  // Scenari vendita
  saleScenarios: SaleScenario[];

  // Tasse
  taxBase: TaxBase;
  taxRate: number; // 0.02, 0.04, 0.09, 0.10
  renditaCatastale: number;

  // Spese
  expenses: ExpenseCategory[];

  // Note
  note: string;

  // Meta
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  prezzoVendita: number;
  costoTotale: number;
  profittoLordo: number;
  utileNetto: number;
  roi: number;
  margine: number;
  utileNettoMensile: number;
  roiMensile: number;
  tettoMassimo: number;
  esito: 'non_conviene' | 'borderline' | 'conviene' | 'ottima' | 'eccellente';
  // Sale expenses recalculated for this scenario
  spesaVenditaTotale: number;
}

export function createDefaultProject(): ProjectData {
  return {
    nome: '',
    comune: '',
    indirizzo: '',
    mq: 0,
    durataOperazione: 12,
    minROI: 30,
    minUtileNetto: 0,
    roiThresholds: {
      borderline: 25,
      conviene: 30,
      ottima: 40,
      eccellente: 50,
    },
    prezzoBase: 0,
    offertaMinima: 0,
    rilancioMinimo: 1000,
    startFrom: 'offertaMinima',
    auctionMode: 'manuale',
    numRilanci: 0,
    prezzoAggiudicazione: 0,
    manualRangeMin: null,
    manualRangeMax: null,
    saleScenarios: [
      { id: 'pessimista', name: 'Pessimista', euroPerMq: 0 },
      { id: 'medio', name: 'Medio', euroPerMq: 0 },
      { id: 'ottimista', name: 'Ottimista', euroPerMq: 0 },
    ],
    taxBase: 'prezzoAsta',
    taxRate: 0.09,
    renditaCatastale: 0,
    expenses: createDefaultExpenses(),
    note: '',
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createDefaultExpenses(): ExpenseCategory[] {
  return [
    {
      id: 'acquisto',
      label: 'Acquisto',
      items: [
        { id: 'cancellazione_ipoteca', label: 'Cancellazione ipoteca', amount: 0, status: 'stimata' },
        { id: 'compenso_delegato', label: 'Compenso delegato', amount: 0, status: 'stimata' },
        { id: 'spese_procedura', label: 'Spese procedura', amount: 0, status: 'stimata' },
        { id: 'saldo_condominiali', label: 'Saldo condominiali', amount: 0, status: 'stimata' },
        { id: 'spese_legali', label: 'Spese legali', amount: 0, status: 'stimata' },
        { id: 'liberazione_immobile', label: 'Liberazione immobile', amount: 0, status: 'stimata' },
      ],
    },
    {
      id: 'mensili',
      label: 'Mensili',
      items: [
        { id: 'condominio', label: 'Condominio (mensile)', amount: 0, status: 'stimata', isMonthly: true },
      ],
    },
    {
      id: 'tecniche',
      label: 'Tecniche',
      items: [
        { id: 'sanatoria', label: 'Sanatoria', amount: 0, status: 'stimata' },
        { id: 'pratica_edilizia', label: 'Pratica edilizia', amount: 0, status: 'stimata' },
        { id: 'catastale', label: 'Catastale', amount: 0, status: 'stimata' },
        { id: 'tecnico', label: 'Tecnico', amount: 0, status: 'stimata' },
        { id: 'certificazioni', label: 'Certificazioni', amount: 0, status: 'stimata' },
      ],
    },
    {
      id: 'lavori',
      label: 'Lavori',
      items: [
        { id: 'demolizioni', label: 'Demolizioni', amount: 0, status: 'stimata' },
        { id: 'impianti', label: 'Impianti', amount: 0, status: 'stimata' },
        { id: 'bagno', label: 'Bagno', amount: 0, status: 'stimata' },
        { id: 'cucina', label: 'Cucina', amount: 0, status: 'stimata' },
        { id: 'pavimenti', label: 'Pavimenti', amount: 0, status: 'stimata' },
        { id: 'infissi', label: 'Infissi', amount: 0, status: 'stimata' },
        { id: 'tinteggiatura', label: 'Tinteggiatura', amount: 0, status: 'stimata' },
        { id: 'pulizia', label: 'Pulizia', amount: 0, status: 'stimata' },
        { id: 'sgombero', label: 'Sgombero', amount: 0, status: 'stimata' },
      ],
    },
    {
      id: 'vendita',
      label: 'Vendita',
      items: [
        { id: 'agenzia', label: 'Agenzia', amount: 0, status: 'stimata', isPercentage: true, percentage: 3 },
      ],
    },
  ];
}
