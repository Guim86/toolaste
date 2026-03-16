
# Fix definitivo: il font scelto ha ancora uno zero “marcato”

## Cosa ho verificato
- Nel codice **non ci sono più riferimenti a JetBrains Mono**.
- `src/index.css` e `tailwind.config.ts` sono già impostati su **IBM Plex Mono**.
- Quindi il problema **non è cache** e **non è il vecchio font rimasto da qualche parte**.
- Il punto chiave è che **IBM Plex Mono non garantisce uno zero “pulito”**: può usare una variante distinta dello zero (non plain), quindi quello che vedi è coerente col font stesso.

## Piano di correzione
Sostituire **IBM Plex Mono** con un monospace che abbia uno **zero normale senza puntino né slash** in modo prevedibile su web.

### Font proposto
Uso **Space Mono** come nuovo font monospace del progetto.

Motivo:
- è disponibile via Google Fonts
- è stabile sul web
- ha un aspetto numerico leggibile
- evita il problema specifico dello zero “marcato” che stai vedendo adesso

## Modifiche da fare

### 1. `src/index.css`
- cambiare l’import Google Fonts:
  - da `IBM Plex Mono`
  - a `Space Mono`
- aggiornare la regola `.font-mono`:
  - da `'IBM Plex Mono', monospace`
  - a `'Space Mono', monospace`

### 2. `tailwind.config.ts`
- cambiare `fontFamily.mono`
  - da `["IBM Plex Mono", "monospace"]`
  - a `["Space Mono", "monospace"]`

## Impatto previsto
Dopo questa modifica:
- importi
- percentuali
- ROI
- tutti gli elementi con classe `font-mono`

useranno un monospace diverso, con zero visivamente pulito.

## Nota importante
Il placeholder del campo **Indirizzo** in `ProjectInfoSection` **non usa `font-mono`**: lì oggi il font è `IBM Plex Sans`, quindi non è quello il responsabile dei numeri con zero “puntinato”. Il problema riguarda i campi/valori numerici che usano la famiglia monospace.

## Dettagli tecnici
File da toccare:
- `src/index.css`
- `tailwind.config.ts`

Approccio:
```text
IBM Plex Mono -> Space Mono
.font-mono    -> Space Mono
tailwind mono -> Space Mono
```

## Verifica dopo modifica
Controllare in questi punti:
- campi importo `CurrencyInput`
- ROI e percentuali in sidebar
- durata operazione
- qualsiasi valore con classe `font-mono`

Se vuoi essere ancora più conservativo, alternativa valida: **Roboto Mono**. Ma la prima implementazione che farei è **Space Mono**.
