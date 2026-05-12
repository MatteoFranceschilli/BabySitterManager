# Componenti e File Necessari per BabySitterManager App

Questo documento elenca tutti i file essenziali per il funzionamento dell'applicazione React/Vite, suddivisi per responsabilità. **Nessun file presente in questa lista può essere rimosso senza compromettere le funzionalità o la build dell'app.**

## 1. Configurazione e Build (Root)
Questi file gestiscono l'ambiente Vite, le dipendenze npm e il punto di ingresso HTML.
- **`package.json`**: Definisce le dipendenze (React, Firebase, Lucide-React, Date-Fns, ecc.) e gli script di build/dev. Fondamentale per `npm install` e `npm run dev`.
- **`vite.config.js`**: Configurazione del bundler Vite. Necessario per il corretto raggruppamento e l'avvio del server di sviluppo.
- **`index.html`**: Il punto di ingresso principale del browser. Contiene il `<div id="root"></div>` dove React inietta l'app.
- **`eslint.config.js`**: File di configurazione per il linter (sebbene opzionale in produzione, è spesso essenziale per lo sviluppo).

## 2. Entry Point React (src)
I file che inizializzano l'albero dei componenti React.
- **`src/main.jsx`**: Bootstrapper di React, invoca `ReactDOM.createRoot` e renderizza `App.jsx`.
- **`src/App.jsx`**: Il componente cuore dell'intera applicazione. Contiene la logica di routing condizionale globale (Login vs Dashboard personale), la Home, la gestione delle modali persistenti e molta logica di business.
- **`src/index.css`** & **`src/App.css`**: Stili globali per reset, variabili css e classi di base usate in tutta l'applicazione.

## 3. Pagine (src/pages)
Questi componenti rappresentano le "viste" o le routing view principali richiamate su App.
- **`src/pages/LoginScreen.jsx`**: Modulo essenziale per catturare la configurazione di base di Firebase (credenziali progetto) se non presente nel LocalStorage, e gestire l'autenticazione.
- **`src/pages/Riepilogo.jsx`**: Gestisce probabilmente dashboard di sintesi sui periodi/versamenti e dati inseriti.
- **`src/pages/InfoINPS.jsx`**: Contiene viste/tabelle per riepilogare le informazioni necessarie per la denuncia trimestrale INPS o calcoli contributivi.

## 4. Componenti UI Condivisi (src/components)
Blocchi costitutivi dell'interfaccia. La loro assenza impedisce il corretto montaggio dell'interfaccia poiché sono tutti importati e necessari nelle Pagine e in App.jsx.
- **Form e Input:**
  - **`Inp.jsx`**: Wrapper per input testuali.
  - **`Sel.jsx`**: Wrapper per le "Select" o menu a tendina.
  - **`TA.jsx`**: Wrapper per TextAreas.
  - **`Toggle.jsx`**: Switch per checkbox/bool.
- **Layout e Contenitori:**
  - **`Sheet.jsx`**: Modali modificate a cascata, centrali per inserimento dati, calcoli liquidazioni, contratti.
  - **`LiqSheet.jsx`**: Gestisce lo slide-in per la complessa simulazione di fine rapporto/liquidazione (TFR, Ferie, Preavviso).
  - **`GiorniEditor.jsx`**: Modale specifica per modificare le presenze e le ore giorno per giorno.
  - **`Row.jsx`**: Gestione grafica per righe/colonne incolonnate nelle sheet.
  - **`SH.jsx`**: Section Header (Titolo di blocco).
  - **`Stat.jsx`** & **`StatRow.jsx`**: Utilizzate per stampare visualizzazioni grafiche a blocchi nelle dasboard.
- **Grafica e Feedback:**
  - **`Btn.jsx`**: Il componente riutilizzato in tutta l'app per i pulsanti UI.
  - **`Bdg.jsx`**: Componente "Badge" per visualizzare le etichette.
  - **`Av.jsx`**: Avatar (iconcine utenti).
  - **`Toast.jsx`**: Modulo per le notifiche o i popup di successo/errore.

## 5. Hook, Servizi e Utilità
Astraggono la logica per non appesantire i componenti UI. Essenziali per i dati.
- **`src/hooks/useUserDB.js`**: Custom hook che astrae tutta la logica di sincronizzazione e aggiornamento da/verso Firebase (Firestore). Senza questo i componenti non possono caricare o salvare.
- **`src/services/firebase.js`**: Inizializza l'app di Firebase recuperando la config dal local storage ed esporta le reference ad `auth` e `db`.
- **`src/utils/constants.js`**: Contiene lo state iniziale degli oggetti (`blankC`, `blankP`, ecc.), variabili per i paletti del CCNL, font, liste per i colori. Imprescindibile.

## 6. Assets (src/assets)
- Eventuali icone, loghi e copertine dell'app importati nell'HTML o nei JSX (`hero.png`, icone `.svg`).
