

# Pagina /results — Motore Visivo di Decisione

## Differenza chiave dal piano precedente
I dati vengono letti dal progetto attivo dell'utente (localStorage via `useProject`), non da dati mock. Gli scenari di vendita del progetto (Pessimista/Medio/Ottimista) diventano i 3 marker. Le spese, tasse e durata vengono dal progetto reale. I range min/base/max vengono derivati dagli scenari esistenti e dal range acquisto del progetto.

---

## Architettura file

| File | Azione |
|------|--------|
| `src/App.tsx` | Aggiungere route `/results` |
| `src/pages/Results.tsx` | Pagina principale — layout KPI + controlli + grafico |
| `src/components/results/ResultsContourChart.tsx` | Grafico ibrido Canvas heatmap + SVG marker |
| `src/components/results/ResultsKpiCards.tsx` | 4 card KPI |
| `src/components/results/ResultsControls.tsx` | Barra controlli (metrica, mesi, ROI, toggle) |
| `src/components/results/ScenarioDrawer.tsx` | Sheet laterale dettagli scenario |
| `src/utils/resultsCalculations.ts` | Funzioni calcolo per heatmap e score |

---

## Collegamento ai dati reali

- `Results.tsx` usa `useProject()` per leggere il progetto attivo
- Assi del grafico derivati da: range acquisto (`getPurchaseRange`) per asse X, prezzi vendita dagli scenari per asse Y
- Spese fisse e di vendita calcolate con le funzioni esistenti (`calcFixedExpenses`, `calcSaleExpenses`, `calcRegistrationTax`)
- I 3 marker corrispondono ai `saleScenarios` del progetto (tipicamente Pessimista, Medio, Ottimista)
- Durata, taxRate, roiThresholds tutti dal progetto

## Range scenari

I range min/base/max vengono derivati automaticamente:
- **Acquisto**: dal `purchaseRange` del progetto (min/aggiudicazione/max)
- **Rivendita**: da ciascun `saleScenario` × mq, con ±15% come range
- **Spese**: spese fisse totali del progetto con fattore 0.7/1.0/1.3 per i 3 livelli
- **Mesi**: `durataOperazione` del progetto ±30%

---

## Grafico ibrido

### Layer 1 — Canvas Heatmap (50×50 griglia)
- Per ogni punto (acquisto, rivendita): calcola metrica con spese e mesi correnti usando la logica reale del progetto
- Colori: rosso → ambra → verde → verde intenso (coerenti con `esitoConfig` esistente)
- Linee contorno a soglie ROI dal progetto (`roiThresholds`)

### Layer 2 — SVG Marker
- 3 cerchi dai saleScenarios del progetto
- Posizione: (prezzoAggiudicazione, prezzoVenditaScenario)
- Alone proporzionale al range di incertezza
- Transizioni CSS animate

---

## Controlli
1. Select metrica (ROI % / ROI ann. % / Utile netto € / Score)
2. Select scenario spese (Basse 0.7× / Medie 1× / Alte 1.3×)
3. Slider mesi (2-36, default da progetto)
4. Slider/input ROI minimo
5. Toggle visibilità per ogni scenario
6. Reset

## KPI Cards
1. Prezzo massimo consigliato (dal `tettoMassimo` dello scenario medio)
2. Utile netto atteso (scenario medio)
3. ROI annualizzato (calcolato)
4. Score operazione (0-100, calcolato da ROI ann + utile + durata + margine)

## Score operazione
Media pesata: ROI_ann normalizzato (40%), utile normalizzato (25%), durata inversa (20%), margine sicurezza (15%). Label: <30 Debole, 30-50 Borderline, 50-75 Buona, ≥75 Molto interessante.

## Interazioni
- **Hover sfondo**: tooltip con acquisto, rivendita, utile, ROI, ROI ann, score, stato
- **Hover marker**: tooltip ricco con range min/base/max e robustezza
- **Click marker**: Sheet laterale con breakdown finanziario, analisi robustezza, indicatori visivi

## Stile
- Estetica premium fintech, card `rounded-xl shadow-md`
- Font Space Mono per numeri, formattazione italiana
- Etichette in italiano
- Responsive: stack verticale su tablet/mobile
- Grafico min-height 500px desktop

