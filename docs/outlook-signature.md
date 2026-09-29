# Firma per Outlook desktop (classico)

Come e perché è fatta la versione generata da **Copy for Outlook (Windows)**
([useOutlookSignatureHtml.ts](../app/composables/useOutlookSignatureHtml.ts)).
Ogni regola qui sotto è stata verificata su email reali inviate da Outlook.

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

## 3. Meno paragrafi possibile

In ogni client basato su browser (Gmail, Apple Mail, ecc.) ogni paragrafo può
aggiungere spazio sotto la sua immagine. Quindi la firma usa il minor numero di
paragrafi possibile:

1. **una sola immagine** per tutto ciò che non ha link: wordmark, nome/ruolo,
   indirizzi (`/api/signature-image?part=header`);
2. **una tabella 2×2** per i testi cliccabili: telefoni, poi sito + Instagram.

Perché una tabella e non due immagini affiancate: i browser possono andare a capo
tra due immagini inline, e Word toglie `white-space:nowrap`. La prima colonna è
larga quanto il prefisso "WALKER • " + 10px (`nyX`), così la seconda colonna
parte sotto "DRAWAS".

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

**Eccezione: dentro le celle della tabella.** Lì Word **non** mantiene
`line-height:1pt`: lo trasforma in `mso-line-height-alt:1.0pt`, che i browser
ignorano, e le righe dei link tornano all'interlinea "normale" (su Gmail mobile lo
spazio è ancora più grande, perché l'app ingrandisce il testo). Nelle celle si usa
quindi l'interlinea **esatta uguale all'immagine**
(`mso-line-height-rule:exactly;line-height:8.25pt` per 11px), che Word mantiene.
Con immagini piccole lo spazio aggiunto dal browser è al massimo ~2px. Con immagini
alte no (vedi sopra), per questo il blocco in alto resta a `1pt`.

## 5. Margini dei paragrafi: `.05pt`, non `0`

Word **non scrive** sul paragrafo i margini uguali allo stile Normale. Con
`margin:0` il `<p>` inviato non ha margini propri e dipende solo dallo `<style>`
nell'`<head>` dell'email (`p.MsoNormal { margin:0 }`). I client che ignorano quello
`<style>` (ipotesi: Gmail mobile) applicano i margini di default del browser
(~1em sopra e sotto) e la firma si allarga.

Per questo i margini sono `.05pt` sopra e sotto, cioè 1 twip, il passo minimo di
Word: sono diversi dallo stile Normale, quindi Word li scrive inline, ma a video
sono invisibili (~0.07px).

Vanno scritti con le proprietà singole (`margin-top`, `margin-bottom`, …): con lo
shorthand `margin:` Word ha trasformato quello superiore in `mso-margin-top-alt`,
che i browser ignorano.

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

- Spazio in più prima della riga dei telefoni.
- Su Gmail mobile, righe molto distanti.

Entrambi dovrebbero essere risolti dai margini `.05pt` (sezione 5), se la causa è
lo `<style>` dell'`<head>` ignorato. Da confermare con un nuovo `.eml`.
