

# Pagina /soglia — Analisi Soglia di Rivendita

## Obiettivo
Pagina segreta (`/soglia`) che risponde alla domanda: "dato il prezzo d'asta, qual è il prezzo minimo di rivendita per raggiungere il ROI target?"

## File da creare/modificare

| File | Azione |
|------|--------|
| `src/pages/Soglia.tsx` | Nuova pagina completa |
| `src/App.tsx` | Aggiungere route `/soglia` (nessun link nell'UI) |

## Struttura della pagina

**Intestazione**: nome progetto + comune dal progetto attivo.

**3 KPI Cards**:
1. Prezzo massimo acquisto per ROI target (verde/rosso)
2. Margine in € tra rivendita attuale e rivendita minima (verde/ambra/rosso)
3. Stato operazione — "Valida"/"Non valida" con ROI% vs target

**3 Slider**:
1. Prezzo acquisto — default `prezzoAggiudicazione || prezzoBase`, range 50%-160%
2. Prezzo rivendita — default scenario medio `euroPerMq × mq`, range 60%-150%
3. ROI target % — default `minROI`, range 5%-60%

**Testo fisso sotto slider**: durata, spese fisse totali, aliquota tasse — con nota "modificabili nelle rispettive sezioni"

**Grafico linea** (canvas o SVG semplice):
- Asse X = prezzo acquisto, Asse Y = prezzo rivendita
- Linea verde = soglia rivendita minima per ROI target
- Zona sopra = sfondo verde tenue, zona sotto = sfondo rosso tenue
- Punto colorato = posizione corrente (verde sopra, rosso sotto)
- Marker ambra per scenari con euroPerMq valorizzato
- Linee tratteggiate orizzontale e verticale sul punto corrente
- Tooltip hover con tutti i dati

## Logica di calcolo

Riuso funzioni da `src/utils/calculations.ts` per coerenza:
- Spese fisse: somma expenses escludendo vendita, monthly × durata
- Tasse: `taxBase === 'catastale'` → `renditaCatastale × 126 × taxRate`, altrimenti `acquisto × taxRate`
- % spesa vendita: da items con `isPercentage` nella categoria vendita
- Totale investito = acquisto + tasse + spese fisse
- Rivendita minima = `totaleInvestito × (1 + roiTarget/100) / (1 - percVendita/100)`
- ROI = `(rivendita × (1 - percVendita/100) - totaleInvestito) / totaleInvestito × 100`
- Prezzo max acquisto: formula inversa (stessa di `calcTettoMassimo` semplificata per il ROI target dallo slider)

## Grafico — dettaglio rendering

Uso un `<canvas>` per il grafico con logica custom:
- Asse X: range dal 50% al 160% del prezzo base d'acquisto
- Asse Y: calcolato come rivendita minima per estremi X ±20% margine
- La linea soglia si calcola punto per punto: per ogni X, Y = rivenditaMinima(X)
- Fill area sopra/sotto con colori semitrasparenti
- Cerchio per posizione corrente, cerchi ambra per scenari
- Dashed lines di riferimento
- Tooltip su mousemove con coordinate e metriche

## Stile
- Componenti shadcn/ui (Card, Slider, Badge)
- Layout `max-w-4xl mx-auto` con padding generoso
- Coerente con il resto del progetto
- Nessuna modifica a componenti esistenti

