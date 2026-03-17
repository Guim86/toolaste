# Modifiche richieste

## 1. Valori di default (`src/types/project.ts`)

- `minUtileNetto`: da `20000` a `0` (riga 107)
- `startFrom`: da `'base'` a `'offertaMinima'` (riga 117)

## 2. Rinomina voci spese (`src/types/project.ts`)

- `saldo_condominiali` label: da `'Saldo condominiali'` a `'Saldo rate condominiali'` (riga 148)
- `sgombero` label: da `'Sgombero'` a `'Sgombero rifiuti'` (riga 183)

## 3. Riepilogo Spese — rimuovere bordo scenari (`src/components/sections/ExpensesSummarySection.tsx`)

- Togliere `<Badge variant="outline">` e usare semplice `<span>` per i nomi degli scenari nelle righe vendita e totale per scenario

## 4. Dettaglio scenari — riordinare e rinominare (`src/components/sidebar/ResultsSidebar.tsx`, righe 149-165)

Nuovo ordine nella griglia 2×2:

```
ROI/mese   |  Costo totale operazione 
Utile/mese |  Profitto lordo
```

Modifiche:

- Posizione 1 (era "Costo totale"):  diventa **"ROI/mese"** 
- Posizione 2 (era "Profitto lordo"): diventa  "Costo totale" e rinominare in **"Costo totale operazione"** 
- Posizione 3 (era "Utile/mese"): diventa  **"Utile/mese"** con `formatEuro(r.utileNettoMensile` (invariato)
- Posizione 4 (era "ROI/mese"): diventa **"Profitto lordo"** con `formatEuro(r.profittoLordo)`

## File coinvolti

- `src/types/project.ts` — default values + label rename
- `src/components/sections/ExpensesSummarySection.tsx` — rimuovere Badge
- `src/components/sidebar/ResultsSidebar.tsx` — riordino dettaglio scenari