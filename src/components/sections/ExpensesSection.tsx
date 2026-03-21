import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { ProjectData, ExpenseCategory, ExpenseItem, ExpenseStatus } from '@/types/project';
import { Receipt, ChevronDown, Plus, X } from 'lucide-react';
import { formatEuro } from '@/utils/formatting';
import { useState } from 'react';

interface Props {
  project: ProjectData;
  onUpdate: (updates: Partial<ProjectData>) => void;
}

const statusColors: Record<ExpenseStatus, string> = {
  certa: 'bg-success text-success-foreground',
  stimata: 'bg-warning text-warning-foreground',
  daVerificare: 'bg-danger text-danger-foreground',
};

const statusLabels: Record<ExpenseStatus, string> = {
  certa: 'Certa',
  stimata: 'Stimata',
  daVerificare: 'Verifica',
};

const nextStatus: Record<ExpenseStatus, ExpenseStatus> = {
  certa: 'stimata',
  stimata: 'daVerificare',
  daVerificare: 'certa',
};

function AgencyRow({
  item,
  onUpdate,
}: {
  item: ExpenseItem;
  onUpdate: (updates: Partial<ExpenseItem>) => void;
}) {
  const isPercentage = item.isPercentage ?? false;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm truncate py-1">Agenzia</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Fisso</span>
          <Switch
            checked={isPercentage}
            onCheckedChange={(checked) =>
              onUpdate({ isPercentage: checked })
            }
            className="scale-75"
          />
          <span className="text-[10px] text-muted-foreground">%</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {isPercentage ? (
          <CurrencyInput
            value={item.percentage ?? 0}
            onChange={v => onUpdate({ percentage: v })}
            suffix="%"
            decimals={2}
            className="w-20"
          />
        ) : (
          <CurrencyInput
            value={item.amount}
            onChange={v => onUpdate({ amount: v })}
            className="w-24"
          />
        )}
        <button
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer ${statusColors[item.status]}`}
          onClick={() => onUpdate({ status: nextStatus[item.status] })}
          title="Clicca per cambiare stato"
        >
          {statusLabels[item.status]}
        </button>
      </div>
    </div>
  );
}

function ExpenseRow({
  item,
  durataOperazione,
  onUpdate,
  onRemove,
}: {
  item: ExpenseItem;
  durataOperazione: number;
  onUpdate: (updates: Partial<ExpenseItem>) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        {item.isCustom ? (
          <Input
            value={item.label}
            onChange={e => onUpdate({ label: e.target.value })}
            className="text-sm h-8"
            placeholder="Nome voce"
          />
        ) : (
          <span className="text-sm truncate block py-1">{item.label}</span>
        )}
      </div>
      <CurrencyInput
        value={item.amount}
        onChange={v => onUpdate({ amount: v })}
        className="w-28"
      />
      {item.isMonthly && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          × {durataOperazione}m = {formatEuro(item.amount * durataOperazione)}
        </span>
      )}
      <button
        className={`text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer ${statusColors[item.status]}`}
        onClick={() => onUpdate({ status: nextStatus[item.status] })}
        title="Clicca per cambiare stato"
      >
        {statusLabels[item.status]}
      </button>
      {onRemove && (
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onRemove}>
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

function CategorySection({
  category,
  durataOperazione,
  project,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
}: {
  category: ExpenseCategory;
  durataOperazione: number;
  project?: ProjectData;
  onUpdateItem: (itemId: string, updates: Partial<ExpenseItem>) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const [open, setOpen] = useState(true);

  const hasPercentageItems = category.items.some(i => i.isPercentage);
  const isVendita = category.id === 'vendita';

  const fixedTotal = category.items.reduce((sum, item) => {
    if (item.isPercentage) return sum;
    if (item.isMonthly) return sum + item.amount * durataOperazione;
    return sum + item.amount;
  }, 0);

  // Calculate per-scenario totals when percentage items exist
  const scenarioTotals = (hasPercentageItems && project)
    ? project.saleScenarios.map(sc => {
        const prezzoVendita = project.mq * sc.euroPerMq;
        const pctTotal = category.items.reduce((sum, item) => {
          if (item.isPercentage && item.percentage) {
            return sum + prezzoVendita * (item.percentage / 100);
          }
          return sum;
        }, 0);
        return { name: sc.name, total: fixedTotal + pctTotal, hasData: sc.euroPerMq > 0 };
      })
    : null;

  const showScenarios = scenarioTotals && scenarioTotals.some(s => s.hasData);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded px-2 -mx-2">
        <span className="text-sm font-medium">{category.label}</span>
        <div className="flex items-center gap-2">
          {showScenarios ? (
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {scenarioTotals!.map((s, i) => (
                <span key={i} className="font-mono text-[11px] text-muted-foreground">
                  {s.name}: {formatEuro(s.total)}
                  {i < scenarioTotals!.length - 1 && <span className="ml-1.5 text-border">|</span>}
                </span>
              ))}
            </div>
          ) : (
            <span className="font-mono text-sm text-muted-foreground">{formatEuro(fixedTotal)}</span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pl-2 pt-1">
        {category.items.map(item => {
          if (isVendita && item.id === 'agenzia') {
            return (
              <AgencyRow
                key={item.id}
                item={item}
                onUpdate={updates => onUpdateItem(item.id, updates)}
              />
            );
          }

          return (
            <ExpenseRow
              key={item.id}
              item={item}
              durataOperazione={durataOperazione}
              onUpdate={updates => onUpdateItem(item.id, updates)}
              onRemove={item.isCustom ? () => onRemoveItem(item.id) : undefined}
            />
          );
        })}
        <Button variant="ghost" size="sm" onClick={onAddItem} className="text-xs h-7">
          <Plus className="h-3 w-3 mr-1" /> Aggiungi voce
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ExpensesSection({ project, onUpdate }: Props) {
  const updateItem = (catId: string, itemId: string, updates: Partial<ExpenseItem>) => {
    onUpdate({
      expenses: project.expenses.map(cat =>
        cat.id === catId
          ? { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, ...updates } : item) }
          : cat
      ),
    });
  };

  const addItem = (catId: string) => {
    const newItem: ExpenseItem = {
      id: crypto.randomUUID(),
      label: '',
      amount: 0,
      status: 'stimata',
      isCustom: true,
      isMonthly: catId === 'mensili',
    };
    onUpdate({
      expenses: project.expenses.map(cat =>
        cat.id === catId ? { ...cat, items: [...cat.items, newItem] } : cat
      ),
    });
  };

  const removeItem = (catId: string, itemId: string) => {
    onUpdate({
      expenses: project.expenses.map(cat =>
        cat.id === catId ? { ...cat, items: cat.items.filter(i => i.id !== itemId) } : cat
      ),
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          Spese
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 divide-y">
        {project.expenses.map(cat => (
          <CategorySection
            key={cat.id}
            category={cat}
            durataOperazione={project.durataOperazione}
            project={cat.id === 'vendita' ? project : undefined}
            onUpdateItem={(itemId, updates) => updateItem(cat.id, itemId, updates)}
            onAddItem={() => addItem(cat.id)}
            onRemoveItem={(itemId) => removeItem(cat.id, itemId)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
