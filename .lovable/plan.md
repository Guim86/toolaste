

# Usare l'offerta minima come prezzo minimo di acquisto

## Problema attuale
In `buildScenariosFromProject` (riga 145), il `purchaseMin` usa `manualRangeMin` oppure `prezzoAggiudicazione * 0.85`. Questo non ha senso perche l'utente non potra mai acquistare sotto l'offerta minima.

## Modifica

**File: `src/utils/resultsCalculations.ts`** — riga 145

Cambiare:
```ts
const purchaseMin = project.manualRangeMin ?? prezzoAggiudicazione * 0.85;
```
In:
```ts
const purchaseMin = project.offertaMinima > 0 ? project.offertaMinima : (project.manualRangeMin ?? prezzoAggiudicazione * 0.85);
```

Se `offertaMinima` e valorizzata (> 0), viene usata come floor del range acquisto per tutti gli scenari e di conseguenza come estremo sinistro dell'asse X del grafico. Il fallback resta il comportamento attuale.

Nessun altro file da modificare: il `ResultsContourChart` calcola gia gli assi dal min/max degli scenari.

