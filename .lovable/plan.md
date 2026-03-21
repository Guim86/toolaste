

# Fix Spese mobile overflow

## Problema
Le righe spesa usano `flex` orizzontale con input a larghezza fissa (`w-28`) + label + badge stato + eventuale info mensile, tutto su una riga. A 390px la riga sfora.

## Soluzione

Rompere ogni riga spesa su due righe sotto `sm`:

### ExpenseRow (righe 96-132)
- **Riga 1**: Label (full width)  
- **Riga 2**: Input importo + info mensile + badge stato + bottone rimuovi

Usare `flex-col sm:flex-row` sul container e `flex-wrap` sulla seconda riga.

### AgencyRow (righe 44-81)
- **Riga 1**: "Agenzia" + switch Fisso/% 
- **Riga 2**: Input importo + badge stato

Stessa logica: `flex-col sm:flex-row`.

### CategorySection header (riga 179-195)
- Quando ci sono scenarioTotals, i totali per scenario possono anch'essi sforare. Aggiungere `flex-col sm:flex-row` e allineare i totali a destra su mobile con `text-right`.

### Input width
- Ridurre `w-28` a `w-24` su mobile per gli input importo nelle righe.

## File coinvolti
| File | Modifica |
|------|----------|
| `src/components/sections/ExpensesSection.tsx` | Layout responsive per ExpenseRow, AgencyRow e header categoria |

