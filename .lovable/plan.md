

# Riepilogo Spese — Piano

## Cosa creare
Un nuovo componente `ExpensesSummarySection` posizionato tra **Spese** e **Note** in `Index.tsx`. Card con icona e titolo "Riepilogo Spese".

## Struttura del riepilogo

| Voce | Logica |
|---|---|
| **Acquisto** | Somma voci categoria `acquisto` |
| **Aliquota** | Calcolata separatamente: se `taxBase === 'catastale'` → `renditaCatastale × 126 × taxRate`, altrimenti → `prezzoAggiudicazione × taxRate` |
| **Mensili** | Somma voci categoria `mensili` (ogni voce × `durataOperazione`) |
| **Tecniche** | Somma voci categoria `tecniche` |
| **Lavori** | Somma voci categoria `lavori` |
| **Vendita** | Se tutto fisso → cifra unica. Se ci sono % → mostra per scenario (es. "Pessimista: €X / Medio: €Y / Ottimista: €Z") |
| **Totale** | Se vendita è uguale per tutti → **un solo totale**. Se vendita varia per scenario → totale per scenario |

## Comportamento intelligente totale
- Calcola vendita per ogni scenario
- Se tutti i valori di vendita sono identici → mostra una riga singola per vendita e un totale unico
- Se differiscono → mostra vendita e totale con colonne per scenario

## File coinvolti

1. **Nuovo**: `src/components/sections/ExpensesSummarySection.tsx`
   - Riceve `project: ProjectData`
   - Calcola i totali usando la stessa logica di `calculations.ts` (riusa `calcRegistrationTax` pattern)
   - Card con layout a righe: label a sinistra, importo a destra (`font-mono`)
   - Riga totale in grassetto con separatore sopra

2. **Modifica**: `src/pages/Index.tsx`
   - Import del nuovo componente
   - Inserimento tra `ExpensesSection` e `NotesSection` (sia desktop che mobile)

## Stile
- Stesso pattern delle altre Card (icona + titolo)
- Righe con `flex justify-between`, importi in `font-mono`
- Totale evidenziato con `border-t` e `font-semibold`
- Per scenari multipli nella vendita/totale: chip inline con nome scenario

