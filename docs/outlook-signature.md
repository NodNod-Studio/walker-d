# Firma email per Outlook (e tutti gli altri client)

Come e perché è fatta la firma generata da **Copy for Outlook (Windows)**. Ogni
regola qui sotto è stata verificata su email reali, inviate da Outlook desktop e
lette su Gmail desktop e sulla app Gmail (iOS). È il risultato di molti tentativi:
la sezione [Storia](#storia-cosa-non-ha-funzionato) spiega quelli falliti, per non
ripeterli.

## In breve: le regole

1. **Un solo paragrafo** per tutta la firma, righe separate da `<br>`. Niente
   tabelle, niente `<div>`, niente paragrafi multipli.
2. **Il minor numero di righe possibile.** Ogni `<br>` aggiunge uno spazio che
   alcuni client (la app Gmail) ingrandiscono e che non si può togliere. Tutto ciò
   che deve stare a una distanza precisa va **nella stessa immagine**.
3. **Nessuna riga senza contenuto alto** (spaziatori, righe vuote): i client la
   ingrandiscono.
4. Stile del paragrafo: `font-size:1pt; line-height:1pt` **senza**
   `mso-line-height-rule`, margini `.05pt`.
5. **Immagini a 2x** (`IMAGE_SCALE`), mostrate alla dimensione 1x tramite gli
   stili in pt. Vedi la sezione 6 per il compromesso con gli inoltri da Gmail.
6. Dimensioni in **pt**, solo come `style`.
7. **Nessuno spazio** nell'HTML tra due immagini della stessa riga.
8. L'HTML va negli appunti **così com'è** (evento `copy`), mai copiando la
   selezione della pagina.
9. Si verifica sull'**email inviata** (`.eml`), non su Word e non su email
   inoltrate.

## La struttura finale

```
┌───────────────────────────── riga 1 ──────────────────────────────┐
│ [immagine "left", link tel. LA] [immagine "right", link tel. NY]   │
│  WALKER •                          DRAWAS                          │
│  Nome                              Ruolo                           │
│  8057 Beverly Blvd., Suite 100     118 Mercer Street, Floor 2      │
│  Los Angeles, CA, 90048            New York, NY, 10012             │
│  O: (310) 854-6700                 O: (646) 370-4096               │
├──────────────────────────────── <br> ─────────────────────────────┤
│ [walkerdrawas.com + spazio trasparente] [@walkerdrawas]            │
└───────────────────────────── riga 2 ──────────────────────────────┘
```

- **Riga 1:** wordmark, nome/ruolo, indirizzi e telefoni sono **un unico disegno**
  tagliato in due immagini nel punto in cui inizia "DRAWAS"
  (`/api/signature-image?part=left` e `?part=right`). Affiancate combaciano al
  pixel. Ognuna è un link al telefono del suo ufficio.
- **Riga 2:** sito e Instagram, due link separati. L'immagine del sito è allungata
  con spazio trasparente fino all'inizio della colonna NY (`minWidth` = `nyX`), così
  Instagram parte sotto "DRAWAS".

Effetto collaterale accettato: toccare un punto qualsiasi della colonna LA (anche
nome o indirizzi) chiama LA, e lo stesso per NY.

Misure (px, a 1x): colonna LA 169, colonna NY 141, totale 310. In altezza: wordmark
40, riga nome/ruolo 21 (se presente), righe indirizzi 12, riga telefoni 13 (11 di
testo + 2 di spazio prima di sito/Instagram), riga link 11.

HTML generato (semplificato):

```html
<p class="MsoNormal" style="margin-top:.05pt;margin-right:0;margin-bottom:.05pt;margin-left:0;font-size:1.0pt;line-height:1.0pt;font-family:Arial,sans-serif;"><a href="tel:+13108546700"><img src="…/api/signature-image?…&part=left&scale=1" style="width:126.75pt;height:73.5pt;border:0;"></a><a href="tel:+16463704096"><img src="…&part=right&scale=1" style="width:105.75pt;height:73.5pt;border:0;"></a><br><a href="https://walkerdrawas.com"><img src="…/api/text-image?…&minWidth=169" style="width:126.75pt;height:8.25pt;border:0;"></a><a href="https://www.instagram.com/walkerdrawas/"><img src="…" style="width:53.25pt;height:8.25pt;border:0;"></a></p>
```

## Dove sta il codice

| File | Cosa fa |
| --- | --- |
| [useOutlookSignatureHtml.ts](../app/composables/useOutlookSignatureHtml.ts) | Costruisce l'HTML della firma e lo copia negli appunti (`copyRawHtml`) |
| [signatureImage.ts](../server/utils/signatureImage.ts) | Layout e disegno delle immagini della firma: `full` (firma legacy a immagine singola), `header`, `left`, `right` |
| [/api/signature-image](../server/api/signature-image.get.ts) | PNG della firma (o di una sua parte), con cache |
| [/api/signature-image-meta](../server/api/signature-image-meta.get.ts) | Dimensioni della stessa immagine e `nyX` (inizio colonna NY) |
| [/api/text-image](../server/api/text-image.get.ts) | PNG di un testo nel font del brand; `minWidth` aggiunge spazio trasparente a destra |
| [index.vue](../app/pages/index.vue) | Pulsante **Copy for Outlook (Windows)** |

Se cambia il disegno delle immagini, va incrementato `SIGNATURE_IMAGE_VERSION`
(in `signatureImage.ts`), altrimenti restano servite le immagini in cache.

## 1. Outlook riscrive tutto con Word

Outlook desktop classico (Windows e il vecchio Outlook per Mac) usa **Word** come
motore HTML, sia per scrivere sia per mostrare le email. Quello che incolli non
viene inviato così com'è: Word lo converte nel suo modello e all'invio lo
riesporta come HTML "Word".

| Cosa incolli | Cosa esce |
| --- | --- |
| Contenuto di una `<td>` | Sempre avvolto in un `<p class="MsoNormal">` |
| `font-size` / `font-family` sul `<p>` | Spostati su uno `<span>` interno |
| `margin` e `line-height` sul `<p>` | Mantenuti, ma **solo se diversi** dallo stile Normale |
| `line-height:1pt` dentro una `<td>` | Trasformato in `mso-line-height-alt` (ignorato dai browser) |
| Margine superiore del `<p>` | Sempre trasformato in `mso-margin-top-alt` (ignorato dai browser) |
| `padding` e larghezza delle `<td>` | Mantenuti (convertiti in `cm` / `pt`) |
| Dimensioni delle immagini | Riscritte in **pollici** + attributi `width`/`height` |
| Immagini remote | Allegate all'email (`cid:`) |
| `display:block`, `vertical-align`, `font-size:0`, `rgba()`, `max-width`, span nascosti | Rimossi |

Nell'`<head>` dell'email Outlook aggiunge il proprio stile Normale:
`p.MsoNormal { margin:0; font-size:11pt; font-family:Calibri }`. La app Gmail
**ignora** questo `<style>`; Gmail desktop lo applica.

**Conseguenza:** non si può "impedire" la riscrittura. L'unica strada è scrivere
l'HTML già nella forma in cui lo salverebbe Word, così non resta niente da
cambiare, e verificare il risultato **dopo l'invio**.

## 2. Copiare l'HTML esatto

Copiare una selezione della pagina fa riscrivere l'HTML al browser: Chrome
aggiunge gli stili calcolati e toglie le proprietà che non conosce (`mso-*`).
Anche `navigator.clipboard.write` sanifica l'HTML.

Il pulsante usa un evento `copy` con `clipboardData.setData('text/html', html)`
(`copyRawHtml`), che mette negli appunti la stringa esattamente com'è.

## 3. Perché un solo paragrafo e poche righe

**Paragrafi.** Word non scrive mai un vero margine superiore sui paragrafi (vedi
sezione 5). La app Gmail ignora lo `<style>` di Outlook e dà a ogni paragrafo il
margine di default del browser (~1em). Con un paragrafo per riga, o con una
tabella (Word crea un paragrafo per ogni cella), quel margine finisce **tra le
righe**. Le righe dentro lo stesso paragrafo non hanno margini tra loro.

**Righe.** Anche dentro un solo paragrafo, la app Gmail dà a ogni riga un'altezza
minima sua (~18px, il testo che ingrandisce), e Word toglie tutto il CSS che
potrebbe annullarlo (`vertical-align`, `display:block`…). Dopo ogni `<br>` la riga
successiva scende di ~8px rispetto al disegno. Per questo:

- ciò che deve stare a distanza precisa sta nella **stessa immagine** (indirizzi e
  telefoni nelle colonne `left`/`right`);
- restano righe separate solo dove serve un link diverso (sito / Instagram);
- gli spazi "di design" tra le righe sono **dentro le immagini**, come spazio
  trasparente, e piccoli, perché la app aggiunge già il suo.

## 4. Altezza delle righe: `line-height:1pt` senza regola `mso`

```css
font-size:1pt; line-height:1pt;   /* senza mso-line-height-rule */
```

- **Nei browser** l'altezza di una riga dipende dal font **del paragrafo** (il
  Calibri 11pt di Outlook, perché Word sposta il nostro `font-size` sullo span).
  - `line-height:normal`: sotto ogni immagine restano ~3–4px (spazio per le
    discendenti del font).
  - Interlinea **esatta** uguale all'immagine: peggio. Il browser centra il font
    nella riga e metà dello spazio avanzato finisce **sotto** l'immagine (~28px
    sotto un'immagine da 64px).
  - **1pt**: non c'è spazio da distribuire, la riga è alta quanto l'immagine.
- **In Word** un `line-height` senza `mso-line-height-rule:exactly` vale
  "**almeno** 1pt": la riga cresce fino a contenere l'immagine, niente viene
  tagliato.
- **Mai** `mso-line-height-rule:exactly` con un valore **minore** dell'immagine:
  Word taglia la parte alta dell'immagine (era il bug originale, con
  `line-height:0`).
- Nelle celle di tabella Word trasforma `line-height:1pt` in
  `mso-line-height-alt`, ignorato dai browser: un motivo in più per non usare
  tabelle.

## 5. Margini: `.05pt`, non `0`

Word **non scrive** sul paragrafo i margini uguali allo stile Normale: con
`margin:0` il `<p>` inviato dipende solo dallo `<style>` nell'`<head>`, che la app
Gmail ignora. Con `.05pt` (1 twip, il passo minimo di Word, invisibile a video)
Word è costretto a scriverli.

**Limite:** Word scrive davvero solo il margine **inferiore**
(`margin-bottom:.05pt`). Quello superiore diventa sempre `mso-margin-top-alt`,
ignorato dai browser, con qualunque sintassi. Con un solo paragrafo quel margine di
default c'è una volta sola, prima della firma.

## 6. Densità delle immagini: 2x (`IMAGE_SCALE`)

Le immagini hanno il doppio dei pixel della dimensione in cui vengono mostrate
(`IMAGE_SCALE = 2` in
[useOutlookSignatureHtml.ts](../app/composables/useOutlookSignatureHtml.ts)). La
dimensione mostrata viene dagli stili in pt, quindi il layout non cambia.

**Il compromesso.** Outlook scrive le dimensioni delle immagini in pollici. Quando
un destinatario **inoltra l'email da Gmail**, Gmail le perde e usa la dimensione
reale del file: con immagini 2x la firma inoltrata appare **al doppio**.

| `IMAGE_SCALE` | Email dirette | Inoltrate da Gmail |
| --- | --- | --- |
| `2` (attuale) | Testo nitido anche su retina | Firma al doppio della dimensione |
| `1` | Testo morbido su retina (~9px di font su 11 pixel) | Corretta |

Si è scelto 2 perché le email dirette sono la grande maggioranza. Per tornare
indietro basta mettere `IMAGE_SCALE = 1`: le dimensioni restano giuste in entrambi i
casi, perché le immagini sono disegnate esattamente al doppio (es. colonna LA
169×98 → 338×196).

Alla risoluzione 1x si è provato anche ad allineare la linea di base del testo alla
griglia dei pixel: differenza trascurabile. Il limite è la risoluzione, non il
disegno.

- Le colonne `left`/`right` sono disegnate con `scale=IMAGE_SCALE`.
- I testi di sito/Instagram usano una dimensione del font ridotta
  (`oneXFontSize`) tale che l'immagine sia alta esattamente 11px a 1x (22px a 2x).

## 7. Unità

Nell'HTML tutte le misure sono stili in `pt`, senza attributi `width`/`height` in
px (Word riscrive comunque le dimensioni a modo suo). Le costanti nel codice
restano in px perché descrivono **pixel delle immagini**, che devono essere numeri
interi; vengono convertite in pt quando si scrive l'HTML.

## 8. Come testare

- **Non** fidarsi di Word o della finestra di scrittura di Outlook: conta l'HTML
  **inviato**.
- **Non** usare email inoltrate per il debug: Gmail riscrive l'HTML quando
  inoltra.
- Controllare che il footer del generatore mostri il commit appena deployato
  (se no, ricaricare forzando la cache).
- Procedura:
  1. copia con **Copy for Outlook (Windows)** e incolla nelle firme di Outlook
     (senza spazi dopo la firma: Outlook li salva come `&nbsp;`);
  2. invia una mail **diretta** a un indirizzo Gmail;
  3. guardala su Gmail desktop **e** sulla app Gmail (è il client più severo);
  4. in caso di problemi: in Outlook trascina la mail da **Posta inviata** sulla
     Scrivania → `.eml`. La parte `text/html` mostra esattamente cosa ha scritto
     Outlook.

## Storia: cosa non ha funzionato

In ordine cronologico, con il motivo:

| Tentativo | Problema |
| --- | --- |
| Tabella con un'immagine per cella, `font-size:0; line-height:0` sulle `<td>` | Word ignora gli stili sulle `<td>` e mette un paragrafo con interlinea esatta 0: **immagini tagliate** in Outlook |
| Stessa tabella con `line-height` = altezza immagine sulle `<td>` | Nessun effetto: Word applica l'interlinea solo ai paragrafi |
| Immagini 2x/3x (prima versione) | In Gmail **inoltrata** la firma diventa gigante (dimensioni in pollici perse). Poi reintrodotte consapevolmente come compromesso (sezione 6) |
| HTML "stile Word" (un `<p>` per cella, pt) | Righe distanziate: lo span a 1pt non basta, conta il font del paragrafo |
| Interlinea esatta uguale all'immagine | Nei browser metà dello spazio finisce sotto l'immagine: **righe enormi** |
| Tabella 2×2 per i link | Su desktop ok; sulla app Gmail ogni cella/paragrafo prende ~1em di margine |
| Margini `0` → `.05pt` | Il margine superiore resta `mso-margin-top-alt`, ignorato |
| Un paragrafo con `<br>` + riga spaziatrice da 4px | Outlook salva lo spaziatore 1×1, la app Gmail ingrandisce la riga a ~30px |
| Blocco in alto + riga telefoni separata | Sulla app i telefoni ~8px più lontani dagli indirizzi |
| MJML compilato al build (`mj-raw`, poi solo componenti) | I componenti generano 4–5 tabelle annidate per immagine + tabelle `<!--[if mso]>`: è il markup che Word trasforma in un paragrafo per cella. MJML ottimizza l'email **ricevuta** da Outlook, non una firma **incollata** in Word; con `mj-raw` non aggiungeva niente |
| **Due colonne `left`/`right` + riga link** | ✅ Soluzione attuale |

## Limiti noti

- Le righe vuote che Outlook mette **prima** della firma (`<p>&nbsp;</p>`) sulla
  app Gmail sono più alte: sono di Outlook, non della firma.
- La riga è larga 310px: un client più stretto potrebbe mandare a capo l'immagine
  di destra.
- Con `IMAGE_SCALE = 2`, una firma **inoltrata da Gmail** appare al doppio
  (sezione 6).
