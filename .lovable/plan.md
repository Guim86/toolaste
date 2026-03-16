

# Fix: Totale Vendita con Agenzia % per ogni scenario

## Problema
Linea 150 di `ExpensesSection.tsx`: `if (item.isPercentage) return sum` — le voci percentuali vengono ignorate nel totale della categoria Vendita.

## Soluzione
Passare `project` (mq + saleScenarios) alla `CategorySection` per la categoria "vendita". Quando ci sono voci percentuali, invece di un singolo totale, mostrare **un totale per ogni scenario di vendita** nell'header della categoria.

### Modifiche in `ExpensesSection.tsx`:

1. **CategorySection** riceve prop opzionale `project: ProjectData`
2. Nel calcolo del totale, separare la parte fissa dalla parte percentuale
3. Nell'header del collapsible, se ci sono voci percentuali e scenari disponibili:
   - Mostrare una lista compatta tipo:
     ```
     Vendita    Pessimista: 4.500€ | Medio: 6.000€ | Ottimista: 7.500€
     ```
   - Calcolo: `fixedTotal + sum(percentage items → prezzoVendita * pct / 100)` per ogni scenario
4. Se nessuno scenario ha dati (euroPerMq = 0), mostrare solo la percentuale come testo (es. "3%")

### File da modificare
- `src/components/sections/ExpensesSection.tsx` — aggiungere prop project, calcolare totali per scenario nella categoria vendita

