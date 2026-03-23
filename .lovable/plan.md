

# Aggiungere navigazione tra ResultsSidebar e /soglia

## Modifiche

### 1. `src/components/sidebar/ResultsSidebar.tsx`
Nell'header (riga 32-36), aggiungere un bottone "GRAFICO ROI" che naviga a `/soglia` usando `useNavigate` di react-router-dom. Posizionato a destra dell'intestazione "Risultati".

### 2. `src/pages/Soglia.tsx`
Nell'intestazione in alto, aggiungere un bottone "HOME" in alto a destra che naviga a `/` usando `useNavigate`. Stile: bottone `outline` o `ghost` compatto.

### Stile bottoni
- **GRAFICO ROI**: `Button variant="outline" size="sm"` con eventuale icona grafico
- **HOME**: `Button variant="outline" size="sm"` con eventuale icona home

Nessuna modifica alla logica o ad altri componenti.

