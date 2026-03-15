

# Piano Correzioni

## 1. CurrencyInput — Formattazione italiana in tempo reale

**Problema:** Attualmente l'input usa `type="number"` durante il focus, mostrando numeri senza formattazione. La formattazione italiana (1.234,56) appare solo al blur.

**Soluzione:** Riscrivere CurrencyInput per usare sempre `type="text"` e formattare in tempo reale durante la digitazione:
- Mentre l'utente digita, applicare separatore migliaia (punto) e accettare virgola come separatore decimale
- Permettere un solo separatore decimale (virgola)
- Al blur, formattare completamente con `formatCurrency`
- `parseItalianNumber` già gestisce il parsing corretto

**Logica di formatting live:**
- Ad ogni keystroke, prendere il testo raw, rimuovere punti esistenti, separare parte intera e decimale sulla virgola, applicare punti migliaia alla parte intera, ricomporre

## 2. Spese Vendita — Toggle Agenzia fisso/percentuale

**Problema:** Attualmente ci sono due voci separate (Agenzia fisso + Agenzia %). Devono essere mutualmente esclusive con un toggle.

**Soluzione:**
- Nella categoria "vendita" delle spese di default, tenere una sola voce "Agenzia" con un campo `agencyMode: 'fixed' | 'percentage'`
- Aggiungere un toggle nella UI della ExpensesSection per la voce agenzia
- Di default: modalità percentuale, al primo posto
- Quando è in modalità %, mostra input percentuale; quando fisso, mostra input importo
- Aggiungere campo `agencyMode` al tipo `ProjectData` (o gestirlo nella categoria vendita)

**Implementazione pratica:** Usare un singolo ExpenseItem con `isPercentage` come toggle. Nella UI, aggiungere un piccolo switch/toggle accanto alla voce agenzia. Riordinare per mettere agenzia % per prima.

## 3. Colonna risultati ridimensionabile

**Problema:** La sidebar destra è fissa a `w-96` (384px), troppo stretta.

**Soluzione:** Usare il componente `ResizablePanel` già presente nel progetto (`src/components/ui/resizable.tsx`) per rendere il layout a due colonne ridimensionabile:
- Sostituire il layout flex fisso in `Index.tsx` con `ResizablePanelGroup` + `ResizablePanel` + `ResizableHandle`
- Panel sinistro: `defaultSize={65}`, `minSize={40}`
- Panel destro: `defaultSize={35}`, `minSize={20}`, `maxSize={50}`
- Handle con grip visibile (`withHandle`)

## File da modificare
1. **`src/components/shared/CurrencyInput.tsx`** — Riscrivere con formattazione live italiana
2. **`src/pages/Index.tsx`** — Sostituire layout con ResizablePanelGroup
3. **`src/components/sections/ExpensesSection.tsx`** — Toggle agenzia fisso/percentuale
4. **`src/types/project.ts`** — Aggiornare default spese vendita (una sola voce agenzia, % per prima)

