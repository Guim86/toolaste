

# Modifiche pagina /soglia: mesi editabili, fix agenzia, input manuali prezzi

## Bug trovato: spese vendita fisse ignorate
`calcFixedExpenses` salta interamente la categoria `vendita` (riga 17: `if (cat.id === 'vendita') continue`). Questo significa che eventuali **importi fissi** nelle voci di vendita (es. agenzia con importo fisso > 0) vengono **ignorati**. Inoltre `getSalePercentage` usa `item.percentage` come condizione truthy: se la percentuale è 0 viene correttamente saltata, quindi il calcolo percentuale è OK. Il problema reale è che le voci vendita con importo fisso non entrano né nelle spese fisse né nel calcolo percentuale.

---

## Modifiche

### 1. Mesi editabili — `src/pages/Soglia.tsx`
- Aggiungere uno stato locale `mesi` inizializzato da `project.durataOperazione`
- Nel footer del card slider (riga 531), sostituire il testo statico "Durata: X mesi" con un mini-input: numero con frecce su/giù (input `type="number"` compatto, larghezza ~60px, inline)
- Ricalcolare `fixedExp` quando `mesi` cambia (le spese mensili dipendono dalla durata)
- Aggiornare `calcFixedExpenses` per accettare un parametro `mesi` override

### 2. Fix calcolo spese agenzia — `src/pages/Soglia.tsx`
- Modificare `getSalePercentage` per restituire anche il totale delle voci **fisse** della categoria vendita (non solo le percentuali)
- Creare `getSaleFixedAmount(project)` che somma gli `amount` delle voci vendita non percentuali
- Includere questo importo fisso nel `totalInvested`
- Aggiornare `getAgencyInfo` per restituire anche l'importo fisso dell'agenzia, e mostrarlo nell'UI
- Se percentuale = 0 E importo = 0, mostrare "Agenzia: €0 (non impostata)"

### 3. Slider step 100 + input manuale — `src/pages/Soglia.tsx`
- Slider acquisto e rivendita: impostare `step={100}`
- Accanto a ogni slider (acquisto e rivendita), aggiungere un `CurrencyInput` compatto inline che permette di digitare il valore manualmente
- Layout: label a sinistra, CurrencyInput piccolo a destra (al posto del testo statico `formatEuro`), slider sotto
- Il CurrencyInput e lo slider si sincronizzano bidirezionalmente
- Dimensione CurrencyInput: `w-[120px]` con `text-sm`

---

### File modificato: solo `src/pages/Soglia.tsx`

