

# Modifiche richieste

## 1. ResultsSidebar (`src/components/sidebar/ResultsSidebar.tsx`)

- **Riga 51**: Rinominare "Tetto Max per scenario" → "Prezzo aggiudicazione max"
- **Righe 53-55**: Accanto al nome scenario nella sezione "Prezzo aggiudicazione max", aggiungere `(X €/mq)` cercando lo scenario corrispondente in `project.saleScenarios` tramite `r.scenarioId`
- **Riga 141**: Rinominare "Dettaglio scenari" → "Dettaglio scenari post-rivendita"
- **Righe 145-146**: Nel dettaglio scenari, aggiungere `(X €/mq)` accanto al nome scenario
- Passare `saleScenarios` al componente `FeasibilityBar`

Helper inline per trovare €/mq: `project.saleScenarios.find(s => s.id === r.scenarioId)?.euroPerMq`

## 2. FeasibilityBar (`src/components/sidebar/FeasibilityBar.tsx`)

- Aggiungere prop `euroPerMq: number` all'interfaccia Props
- **Riga 37**: Aggiungere `(X €/mq)` accanto al nome scenario nel titolo della barra
- **Riga 77**: Rinominare "Tetto Max:" → "Prezzo agg. max:" nel tooltip
- **Riga 103**: Rinominare "Tetto Max:" → "Prezzo agg. max:" nella label sotto la barra

## File coinvolti
- `src/components/sidebar/ResultsSidebar.tsx`
- `src/components/sidebar/FeasibilityBar.tsx`

