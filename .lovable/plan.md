# Rinomina "Tetto" e aggiungi tooltip alla barra di fattibilità

## Modifiche in `src/components/sidebar/FeasibilityBar.tsx`

1. **Rinomina "Tetto"** → "Tetto Max" nella label sotto la barra (linea 68) e nel title del marker (linea 55)
2. **Aggiungi tooltip** a tre elementi della barra:
  - **Linea verde (Prezzo Max)**: "Prezzo massimo di acquisto per rispettare ROI e utile minimo impostati"
  - **Pallino bianco**: "Prezzo di aggiudicazione attuale inserito"
  - **Zona verde**: "Zona sicura: prezzi di acquisto che rispettano i parametri"
  - **Zona rossa**: "Zona rischiosa: prezzi che non rispettano i vincoli minimi"
3. Usare il componente `Tooltip` già presente nel progetto (`@/components/ui/tooltip`) wrappando i marker e le zone con `TooltipTrigger`

