

# Ottimizzazione Mobile

## Panoramica

Quattro interventi principali per rendere l'app usabile su schermi da 390px:

1. **Tab Dati/Risultati** per separare form e sidebar
2. **Stepper a passi** per navigare le sezioni una alla volta
3. **Header compatto** con bottoni raggruppati in dropdown
4. **Scenari vendita in stack verticale**

---

## Dettaglio tecnico

### 1. Layout mobile con Tab (Index.tsx)

Sostituire il blocco `lg:hidden` con un sistema a due tab:
- Tab **"Dati"**: mostra lo stepper con le sezioni form
- Tab **"Risultati"**: mostra la `ResultsSidebar`

Usare il componente `Tabs` di shadcn gia presente nel progetto. I tab appaiono solo sotto `lg`.

### 2. Stepper mobile (nuovo componente `src/components/mobile/MobileStepper.tsx`)

Componente che riceve le 7 sezioni come array di `{ label, content }`. Mostra:
- Indicatore step corrente (es. "3 / 7 — Simulazione Asta")
- Pulsanti "Indietro" / "Avanti" sticky in basso
- Solo il contenuto della sezione corrente, dentro uno ScrollArea

Steps:
1. Info Progetto
2. Parametri Decisionali
3. Simulazione Asta
4. Scenari di Vendita
5. Spese
6. Riepilogo Spese
7. Note

### 3. Header compatto (ProjectManager.tsx)

Sotto `sm` (390px):
- Il `Select` del progetto diventa full-width su una seconda riga sotto il logo
- I bottoni (Nuovo, Duplica, Esporta, Importa, Elimina) vengono raggruppati in un `DropdownMenu` con un singolo bottone "..." (MoreHorizontal icon)
- Su `sm+` rimane il layout attuale

### 4. Scenari vendita responsive (SaleScenariosSection.tsx)

Sotto `sm`, ogni scenario passa da riga orizzontale a stack verticale:
- Riga 1: Nome scenario (full width)
- Riga 2: €/mq input + Totale calcolato affiancati

Usare classi Tailwind responsive: `flex-col sm:flex-row`.

### 5. Adattamenti minori

- **DecisionParametersSection**: soglie ROI da `grid-cols-4` a `grid-cols-2 sm:grid-cols-4`
- **AuctionSimulationSection**: prima riga da `grid-cols-3` a `grid-cols-1 sm:grid-cols-3` (stack su mobile)
- **ExpensesSection**: input importo nelle righe spesa più compatto (w-24 su mobile)

---

## File coinvolti

| File | Azione |
|------|--------|
| `src/components/mobile/MobileStepper.tsx` | Nuovo — stepper a passi |
| `src/pages/Index.tsx` | Riscrivere blocco mobile con Tab + Stepper |
| `src/components/ProjectManager.tsx` | Dropdown "..." su mobile |
| `src/components/sections/SaleScenariosSection.tsx` | Stack verticale responsive |
| `src/components/sections/DecisionParametersSection.tsx` | Grid responsive soglie ROI |
| `src/components/sections/AuctionSimulationSection.tsx` | Grid responsive prima riga |

