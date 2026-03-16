

# Correzione: aggiungere soglia "Eccellente" esplicita

Il piano precedente definiva 4 soglie (`nonConviene`, `borderline`, `conviene`, `ottima`) dove "eccellente" era implicito (≥ ottima). La confusione nasce dal naming. Correggo rendendo tutte e 5 le soglie esplicite come "punto di inizio" di ciascun livello.

## Struttura `roiThresholds` corretta

```ts
roiThresholds: {
  borderline: number;   // default 25 — da qui inizia "borderline"
  conviene: number;     // default 30 — da qui inizia "conviene"
  ottima: number;       // default 40 — da qui inizia "ottima"
  eccellente: number;   // default 50 — da qui inizia "eccellente"
};
```

Logica: ROI < borderline → non_conviene, < conviene → borderline, < ottima → conviene, < eccellente → ottima, ≥ eccellente → eccellente.

## UI in DecisionParametersSection

5 livelli visibili, 4 campi editabili (il "non conviene" è implicito = sotto la prima soglia):

| Campo | Label | Default | Significato |
|-------|-------|---------|-------------|
| `borderline` | Borderline da | 25% | Sotto = non conviene |
| `conviene` | Conviene da | 30% | |
| `ottima` | Ottima da | 40% | |
| `eccellente` | Eccellente da | 50% | |

## File da modificare

Stessi 5 file del piano precedente, con questa struttura a 4 soglie + eccellente esplicito:
- `src/types/project.ts` — campo `roiThresholds` con 4 soglie
- `src/utils/calculations.ts` — `getEsito` usa le 4 soglie
- `src/components/sections/DecisionParametersSection.tsx` — 4 input con suffix "%"
- `src/components/sidebar/FeasibilityBar.tsx` — colori badge dinamici
- `src/components/sidebar/ResultsSidebar.tsx` — legenda con range dinamici

