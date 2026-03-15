

# Aggiornamento Piano — Zona di Fattibilità

## Concetto chiave
L'app deve rispondere a: "Se compro tra X e Y, e rivendo tra W e Z, **dove sta la zona in cui l'operazione funziona?**"

## Modifiche al piano esistente

### 1. Range di acquisto (sezione Simulazione Asta)
- Manteniamo la simulazione asta (base/offerta minima + rilanci)
- **Aggiungiamo** due campi manuali opzionali: "Prezzo acquisto minimo" e "Prezzo acquisto massimo" che sovrascrivono il range simulato
- Il range finale viene usato per la barra visuale

### 2. Scenari di vendita estesi
- I 3 scenari base (pessimista/medio/ottimista) restano come input principali
- **Aggiungiamo** possibilità di inserire **punti intermedi** (es. 5-7 livelli di €/mq) per una curva più granulare
- Pulsante "+ Aggiungi scenario vendita" con nome personalizzabile

### 3. Barra visuale di fattibilità (nuova sezione nella sidebar)
Una barra orizzontale per ogni scenario di vendita che mostra:

```text
Prezzo acquisto →
|■■■■■■■■■■░░░░░░░░░░░░░░░░░|
 FATTIBILE        NON FATTIBILE
 (verde)          (rosso)
      ▲
  Tetto max
```

- Asse = range di acquisto (da min a max)
- La barra si colora verde fino al **tetto massimo di aggiudicazione**, poi rosso
- Un marker verticale mostra il prezzo di aggiudicazione attuale
- Ripetuta per ogni scenario di vendita, impilate verticalmente → si vede subito come la zona verde si allarga/restringe

### 4. Output finale doppio
Nella sidebar, sotto i risultati per scenario:

**A) Tetto massimo per scenario** (già previsto)
> "Scenario pessimista: max 85.000€ — Scenario medio: max 105.000€ — Scenario ottimista: max 130.000€"

**B) Zona di fattibilità complessiva** (nuovo)
> "L'operazione è fattibile se acquisti sotto **85.000€** (tutti gli scenari OK) oppure sotto **130.000€** (solo se rivendi allo scenario ottimista)"

Con indicazione del prezzo di aggiudicazione attuale rispetto a queste soglie.

### 5. Impatto tecnico
- Nessun cambio architetturale — solo nuovi componenti UI e calcoli derivati
- La barra visuale è un componente React con Tailwind (div con gradient/colori, no librerie grafiche)
- Gli scenari extra usano lo stesso array di scenari, solo con più elementi

