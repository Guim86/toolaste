

# Modifiche richieste

## 1. Etichette Agenzia (`src/components/sections/ExpensesSection.tsx`)

- **Riga 47**: "Agenzia" → "Provvigione agenzia"
- **Riga 57**: "%" → "A percentuale"

## 2. Header mobile — nome progetto su riga separata (`src/pages/Index.tsx` + `src/components/ProjectManager.tsx`)

Attualmente su mobile l'header ha logo + ProjectManager sulla stessa riga, e il Select del progetto è troncato a `w-36`.

Modifica: su mobile (`sm:hidden`), ristrutturare l'header in due righe:
- **Riga 1**: Logo "TOO-LA(S)TE" a sinistra + menu "..." a destra
- **Riga 2**: Select progetto full-width sotto

Approccio: nel `ProjectManager`, separare il Select dal dropdown mobile. Su `sm:hidden`, il Select va su una riga propria (`w-full`) e il bottone "..." resta nell'header principale. Questo richiede di spostare il layout nell'`Index.tsx`:

- Header mobile diventa `flex-col`: riga 1 con logo + dropdown menu, riga 2 con select progetto full-width
- Header desktop resta invariato

## File coinvolti

| File | Modifica |
|------|----------|
| `src/components/sections/ExpensesSection.tsx` | Rinomina label |
| `src/pages/Index.tsx` | Header mobile a due righe |
| `src/components/ProjectManager.tsx` | Select full-width su mobile |

