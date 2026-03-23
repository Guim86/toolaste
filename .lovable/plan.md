

# Chiarimento spese agenzia + aggiunta "0% (no aliquota)"

## 1. Spese agenzia nella pagina /soglia — come funzionano

Le spese di agenzia **sono già calcolate correttamente** nel parametro `salePct`, che include tutte le voci percentuali della categoria "vendita" (agenzia inclusa). Questo valore viene usato in tutte le formule: la rivendita minima si calcola come `totaleInvestito × (1 + ROI) / (1 - salePct/100)`, quindi l'agenzia è già considerata come costo proporzionale alla vendita.

Il testo attuale "Agenzia esclusa" accanto allo slider spese fisse è **tecnicamente corretto** (l'agenzia non è nelle spese fisse perché è percentuale), ma è **fuorviante** — sembra che non venga conteggiata affatto.

### Modifica: `src/pages/Soglia.tsx`
- Riscrivere il testo sotto lo slider spese fisse per chiarire che l'agenzia è **inclusa nel calcolo come costo % sulla vendita**, non ignorata. Esempio: `"Valore progetto: €X — Agenzia (Y%) calcolata automaticamente sul prezzo di rivendita"`
- Aggiungere una riga informativa nelle KPI o sotto gli slider che mostra il **costo agenzia stimato** in euro basato sul prezzo di rivendita corrente: `Costo agenzia stimato: €Z`

## 2. Aggiunta "0% (no aliquota)" nel dropdown aliquota

### Modifica: `src/components/sections/AuctionSimulationSection.tsx`
- Aggiungere `<SelectItem value="0">0% (no aliquota)</SelectItem>` come **prima voce** nel `<SelectContent>`, prima di "2% (prima casa)"

