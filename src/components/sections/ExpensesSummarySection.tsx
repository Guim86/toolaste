import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ProjectData } from '@/types/project';
import { Receipt } from 'lucide-react';
import { formatEuro } from '@/utils/formatting';

interface Props {
  project: ProjectData;
}

function sumCategory(project: ProjectData, catId: string): number {
  const cat = project.expenses.find(c => c.id === catId);
  if (!cat) return 0;
  let total = 0;
  for (const item of cat.items) {
    if (item.isMonthly) {
      total += item.amount * project.durataOperazione;
    } else if (!item.isPercentage) {
      total += item.amount;
    }
  }
  return total;
}

function calcAliquota(project: ProjectData): number {
  if (project.taxBase === 'catastale' && project.renditaCatastale > 0) {
    return project.renditaCatastale * 126 * project.taxRate;
  }
  return project.prezzoAggiudicazione * project.taxRate;
}

function calcSaleForScenario(project: ProjectData, prezzoVendita: number): number {
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

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1 ${bold ? 'font-semibold' : ''}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-mono text-sm ${bold ? 'text-foreground' : ''}`}>{value}</span>
    </div>
  );
}

export function ExpensesSummarySection({ project }: Props) {
  const acquisto = sumCategory(project, 'acquisto');
  const aliquota = calcAliquota(project);
  const mensili = sumCategory(project, 'mensili');
  const tecniche = sumCategory(project, 'tecniche');
  const lavori = sumCategory(project, 'lavori');

  const fixedTotal = acquisto + aliquota + mensili + tecniche + lavori;

  // Calculate sale expenses per scenario
  const scenarioSales = project.saleScenarios.map(s => ({
    name: s.name,
    prezzoVendita: project.mq * s.euroPerMq,
    saleExpense: calcSaleForScenario(project, project.mq * s.euroPerMq),
  }));

  const allSaleSame = scenarioSales.every(s => s.saleExpense === scenarioSales[0]?.saleExpense);

  const taxLabel = project.taxBase === 'catastale'
    ? `Aliquota (${(project.taxRate * 100).toFixed(0)}% su catastale)`
    : `Aliquota (${(project.taxRate * 100).toFixed(0)}% su prezzo asta)`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          Riepilogo Spese
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <SummaryRow label="Acquisto" value={formatEuro(acquisto)} />
        <SummaryRow label={taxLabel} value={formatEuro(aliquota)} />
        <SummaryRow label="Mensili" value={formatEuro(mensili)} />
        <SummaryRow label="Tecniche" value={formatEuro(tecniche)} />
        <SummaryRow label="Lavori" value={formatEuro(lavori)} />

        {allSaleSame ? (
          <>
            <SummaryRow label="Vendita" value={formatEuro(scenarioSales[0]?.saleExpense ?? 0)} />
            <Separator className="my-2" />
            <SummaryRow label="Totale" value={formatEuro(fixedTotal + (scenarioSales[0]?.saleExpense ?? 0))} bold />
          </>
        ) : (
          <>
            <Separator className="my-2" />
            <p className="text-xs font-medium text-muted-foreground mb-1">Vendita (per scenario)</p>
            {scenarioSales.map(s => (
              <div key={s.name} className="flex justify-between items-center py-0.5 pl-3">
                <Badge variant="outline" className="text-xs font-normal">{s.name}</Badge>
                <span className="font-mono text-sm">{formatEuro(s.saleExpense)}</span>
              </div>
            ))}
            <Separator className="my-2" />
            <p className="text-xs font-semibold mb-1">Totale (per scenario)</p>
            {scenarioSales.map(s => (
              <div key={s.name} className="flex justify-between items-center py-0.5 pl-3">
                <Badge variant="outline" className="text-xs font-normal">{s.name}</Badge>
                <span className="font-mono text-sm font-semibold">{formatEuro(fixedTotal + s.saleExpense)}</span>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
