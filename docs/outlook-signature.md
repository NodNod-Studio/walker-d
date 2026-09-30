# Firma per Outlook desktop (classico)

Come e perché è fatta la versione generata da **Copy for Outlook (Windows)**
([useOutlookSignatureHtml.ts](../app/composables/useOutlookSignatureHtml.ts)).
Ogni regola qui sotto è stata verificata su email reali inviate da Outlook.

> **Tentativo MJML, abbandonato.** La firma è stata rifatta con MJML compilato al
> build di Nuxt (commit `34d79cd`), prima con `mj-raw` e poi solo con i componenti
> (`mj-section`, `mj-group`, `mj-column`, `mj-image`). Poi si è tornati a questa
> versione:
>
> - i componenti generano 4–5 tabelle annidate per immagine, più le tabelle
>   "fantasma" `<!--[if mso]>`. Incollato in Outlook, è esattamente il markup che
>   Word trasforma in un paragrafo per cella (sezioni 3–5);
> - MJML ottimizza l'email **ricevuta** da Outlook, non una firma **incollata**
>   in Word;
> - con `mj-raw` MJML non aggiungeva niente rispetto a scrivere l'HTML a mano.

## 1. Outlook riscrive tutto con Word

Outlook desktop classico (Windows e il vecchio Outlook per Mac) usa **Word** come
motore HTML, sia per scrivere sia per mostrare le email. Quello che incolli non
viene inviato così com'è: Word lo converte nel suo modello e all'invio lo
riesporta come HTML "Word".

Cosa fa Word, in pratica:

| Cosa incolli | Cosa esce |
| --- | --- |
| Contenuto di una `<td>` | Sempre avvolto in un `<p class="MsoNormal">` |
| `font-size` / `font-family` sul `<p>` | Spostati su uno `<span>` interno |
| `margin` e `line-height` sul `<p>` | Mantenuti, ma **solo se diversi** dallo stile Normale |
| `padding` e larghezza delle `<td>` | Mantenuti (convertiti in `cm` / `pt`) |
| Dimensioni delle immagini | Riscritte in **pollici** + attributi `width`/`height` |
| Immagini remote | Allegate all'email (`cid:`) |
| `display:block`, `font-size:0`, `rgba()`, `max-width`, span nascosti | Rimossi |

Nell'`<head>` dell'email Outlook aggiunge il proprio stile Normale:
`p.MsoNormal { margin:0; font-size:11pt; font-family:Calibri }`.

**Conseguenza:** non si può "impedire" la riscrittura. L'unica strada è scrivere
l'HTML già nella forma in cui lo salverebbe Word, così non resta niente da
cambiare, e verificare il risultato **dopo l'invio**, non in Word.

## 2. Copiare l'HTML esatto

Copiare una selezione della pagina (Copy Signature) fa riscrivere l'HTML anche al
browser: Chrome aggiunge gli stili calcolati e toglie le proprietà che non conosce
(`mso-*`). Anche `navigator.clipboard.write` sanifica l'HTML.

Il pulsante usa un evento `copy` con `clipboardData.setData('text/html', html)`
(`copyRawHtml`), che mette negli appunti la stringa esattamente com'è.

## 3. Un solo paragrafo, righe separate da `<br>`

Tutta la firma è **un unico paragrafo**, con **due** righe separate da un `<br>`:

1. **wordmark, nome/ruolo, indirizzi e telefoni come un unico disegno, tagliato in
   due immagini** nel punto in cui inizia "DRAWAS"
   (`/api/signature-image?part=left` e `part=right`). Affiancate combaciano al
   pixel; ognuna è un link al telefono del suo ufficio;
2. sito + Instagram (link).

**Perché così: ogni `<br>` aggiunge spazio che non si può togliere.** La app Gmail
dà a ogni riga un'altezza minima sua (~18px: il testo che ingrandisce), e Word
toglie qualunque CSS che potrebbe annullarlo (`vertical-align`, `display:block`…).
Con indirizzi e telefoni su righe diverse, sulla app i telefoni finivano ~8px più
in basso del dovuto. Tutto ciò che deve stare a una distanza precisa va quindi
**nella stessa immagine**; restano righe separate solo dove serve un link diverso
per riga (sito/Instagram).

Effetto collaterale: toccare un punto qualsiasi della colonna LA (anche indirizzi o
nome) chiama LA, e lo stesso per NY.

Lo spazio tra telefoni e sito è dentro le immagini delle colonne (riga dei telefoni
alta 13px: 11 di testo + 2), piccolo perché la app aggiunge già il suo dopo il
`<br>`.

> Storia:
> - una riga separata con solo un'immagine trasparente di 4px: Outlook l'ha
>   salvata come 1×1 e la app Gmail ingrandiva la riga a ~30px. Regola: **nessuna
>   riga senza contenuto alto**;
> - indirizzi (nel blocco in alto) e telefoni su righe diverse: ~8px in più tra le
>   due sulla app. Da qui il taglio in due colonne.

Perché un solo paragrafo: Word non scrive mai un vero margine superiore sui
paragrafi (vedi sezione 5), e i client che ignorano lo `<style>` di Outlook (la
app Gmail) danno a ogni paragrafo un margine di default di ~1em. Con un paragrafo
per riga, o con una tabella (un paragrafo per cella), quel margine finisce tra le
righe. Le righe dentro lo stesso paragrafo invece non hanno margini.

Nella riga 2 l'immagine del sito è allungata con spazio trasparente fino
all'inizio della colonna NY (`minWidth` = prefisso "WALKER • " + 10px, `nyX`),
così quella di destra parte sotto "DRAWAS". Tra le due immagini non ci deve essere
nessuno spazio nell'HTML, altrimenti diventa uno spazio visibile.

> Storia: una versione con una tabella 2×2 per i link funzionava su desktop, ma
> sulla app Gmail ogni riga aveva ~1em di spazio sopra.

## 4. L'altezza delle righe: `line-height:1pt` senza regola `mso`

È il punto più delicato. Ogni paragrafo ha:

```css
margin:0; font-size:1pt; line-height:1pt;   /* senza mso-line-height-rule */
```

Perché:

- **Nei browser** l'altezza di una riga dipende dal font **del paragrafo**, cioè
  il Calibri 11pt di Outlook, perché Word sposta il nostro `font-size` sullo span.
  - Con `line-height:normal`, sotto l'immagine restano ~3–4px (lo spazio per le
    discendenti del font).
  - Con un'interlinea **esatta** uguale all'immagine è peggio: il browser centra
    il font nella riga e metà dello spazio avanzato finisce **sotto** l'immagine
    (~28px sotto un'immagine da 64px).
  - Con **1pt** non c'è spazio da distribuire: la riga è alta esattamente quanto
    l'immagine.
- **In Word** un `line-height` senza `mso-line-height-rule:exactly` vale
  "**almeno** 1pt": la riga cresce fino a contenere l'immagine e niente viene
  tagliato.
- Da non fare mai: `mso-line-height-rule:exactly` con un valore **minore**
  dell'immagine. Word taglia la parte alta dell'immagine (era il bug originale,
  con `line-height:0`).

**Attenzione alle tabelle.** Dentro le celle Word **non** mantiene
`line-height:1pt`: lo trasforma in `mso-line-height-alt:1.0pt`, che i browser
ignorano, e le righe tornano all'interlinea "normale". Nelle celle funziona solo
l'interlinea esatta uguale all'immagine (`mso-line-height-rule:exactly`), che però
non risolve i margini (sezione 5). Anche per questo la firma non usa tabelle.

## 5. Margini dei paragrafi: `.05pt`, non `0`

Word **non scrive** sul paragrafo i margini uguali allo stile Normale. Con
`margin:0` il `<p>` inviato non ha margini propri e dipende solo dallo `<style>`
nell'`<head>` dell'email (`p.MsoNormal { margin:0 }`). I client che ignorano quello
`<style>` (ipotesi: Gmail mobile) applicano i margini di default del browser
(~1em sopra e sotto) e la firma si allarga.

Per questo i margini sono `.05pt` sopra e sotto, cioè 1 twip, il passo minimo di
Word: sono diversi dallo stile Normale, quindi Word li scrive inline, ma a video
sono invisibili (~0.07px).

**Limite:** Word scrive davvero solo il margine **inferiore**
(`margin-bottom:.05pt`). Quello superiore lo trasforma sempre in
`mso-margin-top-alt:.05pt`, che i browser ignorano, sia con lo shorthand `margin:`
sia con `margin-top`. Per questo la firma è un solo paragrafo (sezione 3): il
margine superiore di default c'è solo una volta, prima della firma.

> Da verificare nel prossimo `.eml`: il `<p>` deve avere `margin-top:.05pt` /
> `margin-bottom:.05pt` (o equivalente) nello `style`.

## 6. Immagini a 1x

Le immagini sono generate **esattamente** alla dimensione in cui vengono mostrate
(dimensione naturale = dimensione visualizzata).

Motivo: Outlook scrive le dimensioni in pollici e, quando l'email viene
**inoltrata da Gmail**, Gmail le perde e usa la dimensione reale del file. Con
immagini 2x/3x la firma diventava gigante; con 1x resta corretta. Il prezzo è un
testo un po' meno nitido sugli schermi retina.

Per il testo a 1x si usa una dimensione del font ridotta (`oneXFontSize`), così
l'immagine è alta esattamente 11px (o 39px per il wordmark), come nell'anteprima.

## 7. Unità

Nell'HTML generato tutte le misure sono stili in `pt`, senza attributi
`width`/`height` in px: Word riscrive comunque le dimensioni a modo suo.

## 8. Come testare

- **Non** fidarsi di quello che si vede in Word o nella finestra di scrittura di
  Outlook: conta l'HTML **inviato**.
- **Non** usare email inoltrate per il debug: Gmail riscrive l'HTML quando
  inoltra.
- Procedura:
  1. incolla la firma con **Copy for Outlook (Windows)**;
  2. invia una mail **diretta** a un indirizzo Gmail;
  3. in Outlook, trascina la mail da **Posta inviata** sulla Scrivania → `.eml`;
  4. la parte `text/html` è in base64: decodificandola si vede esattamente cosa ha
     scritto Outlook.
- Il footer del generatore mostra data e commit della build: serve a verificare
  di stare testando la versione deployata.

## Problemi aperti

- Su Gmail mobile le righe dei link erano molto distanti: causa confermata (margine
  superiore di default su ogni paragrafo, sezione 5). La versione a paragrafo unico
  (sezione 3) è da verificare su mobile.
- Le righe vuote che Outlook mette **prima** della firma (`<p>&nbsp;</p>`) su
  mobile sono più alte: sono di Outlook, non della firma.
- Con immagini affiancate in linea, un client molto stretto potrebbe mandare a
  capo l'immagine di destra (la riga è larga ~250px).
