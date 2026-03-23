

# Fix bottoni Avanti/Indietro nascosti su mobile

## Problema
Il `TabsContent` di Radix non partecipa correttamente alla catena flex: anche con `flex-1 overflow-hidden`, il contenuto del MobileStepper deborda oltre il viewport, spingendo i bottoni di navigazione fuori schermo. Su Samsung S25 Ultra l'utente deve scrollare per trovarli.

## Causa tecnica
`TabsContent` ha `mt-2` di default e non ha `min-height: 0` (necessario per far funzionare `flex-1` + `overflow-hidden` nei flex container annidati). Questo rompe la catena `h-screen → flex-col → flex-1 → h-full`.

## Soluzione

### File: `src/components/mobile/MobileStepper.tsx`
Rendere i bottoni di navigazione **fixed in basso** sul viewport mobile, con padding-bottom nel contenuto per evitare sovrapposizione:

- Bottoni: `fixed bottom-0 left-0 right-0` con `z-10` e `border-t bg-card`
- Contenuto: aggiungere `pb-16` per fare spazio ai bottoni fissi
- Rimuovere la dipendenza dalla catena flex per il posizionamento dei bottoni

Questo approccio è il più robusto: funziona indipendentemente da come Radix/TabsContent gestisce il layout, e i bottoni saranno **sempre visibili** in basso allo schermo.

### Nessun altro file modificato
La correzione è interamente nel MobileStepper.

