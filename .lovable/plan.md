

# Sostituire JetBrains Mono con IBM Plex Mono

## Problema
JetBrains Mono ha lo zero con il puntino interno di default e non c'è un feature OpenType per rimuoverlo. Serve un font monospace diverso.

## Soluzione
Usare **IBM Plex Mono** — coerente con IBM Plex Sans già in uso, e ha uno zero pulito senza punto né barra.

## Modifiche

### 1. `src/index.css` (riga 1)
Sostituire il Google Fonts import: `JetBrains+Mono` → `IBM+Plex+Mono` con gli stessi pesi (400, 500, 600).
Aggiornare la regola `.font-mono` a riga 106.

### 2. `tailwind.config.ts` (riga 18)
Cambiare `"JetBrains Mono"` → `"IBM Plex Mono"`.

Due file, due righe ciascuno.

