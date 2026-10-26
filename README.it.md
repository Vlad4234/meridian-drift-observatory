# Meridian Drift Observatory · sala di controllo DEMO

Lingue: [English](README.md) · [Русский](README.ru.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Deutsch](README.de.md) · [Українська](README.uk.md) · [Español](README.es.md) · [日本語](README.ja.md) · [简体中文](README.zh.md) · [हिन्दी](README.hi.md)

**Tutti i saldi, le candele, gli ordini e le esecuzioni sono dati sintetici DEMO.** È una dimostrazione interattiva, non un'app di trading, un backtest o una prova di rendimenti reali.

## Avvio

Servono Node.js 22+ e npm. Nessuna dipendenza esterna.

```sh
npm ci --ignore-scripts
npm test
npm run build
npm start
```

Apri `http://localhost:4173`; interrompi con Ctrl+C. Altra porta locale: `PORT=4174 npm start`. Il server ascolta solo su loopback. Non occorrono registrazione, password, chiave API, account o file di ambiente. `name` e `YOUR_ACCOUNT_ID` sono esempi.

## Scenario

1. Inizia con READY e un prezzo sintetico di 100 UNIT.
2. Inserisci BUY con limite 99 e quantità 1.
3. « Следующий mock-шаг » porta il prezzo a 99, il saldo a 9901 UNIT e la posizione a 1 DEMO: esecuzione simulata.
4. Inserisci SELL a 101. Due passi producono 98 e 101, quindi SELL viene eseguito nel mock.
5. « Отменить mock-заявки » annulla gli ordini, senza chiudere la posizione.
6. Con STALE o UNAVAILABLE, passi, ordini e annullamenti falliscono esplicitamente. READY riprende la simulazione; « Сбросить демо » azzera tutto.

Sono disponibili cinque pagine: home, sistemi, operazioni, eventi e account. Lo stato è solo nella memoria della scheda e si azzera ricaricando. Prezzi ciclici fissi, ordini simulati e registro hanno limiti dichiarati. Non ci sono scambi reali, richieste al mercato, firme, chiavi di trading, portafogli di trading, modalità live o calcolo dei rendimenti.

## Donazioni e limiti

La home mostra un messaggio EN/RU/FR/IT/DE/UK/ES/JA/ZH/HI e l'indirizzo EVM pubblico del proprietario con un pulsante per copiarlo. Monete native e token di reti EVM compatibili, inclusi USDT e USDC dove supportati, possono essere inviati dopo aver verificato rete e token specifici. Questo indirizzo non accetta valute fiat o trasferimenti non EVM. La demo non collega portafogli e non invia transazioni; l'indirizzo per le donazioni è separato dall'account di trading simulato.

Meridian Drift è un concept testuale nel progetto originale, privo di bozzetto visivo. Colori e disposizione sono adattati dall'interfaccia Control Room esistente. Questo progetto ha una nuova storia Git e non include dati privati o servizi di produzione.

`npm run build` esporta otto file consentiti in `dist/`. `npm run scan` controlla file, build, metadati e tutti gli oggetti Git, mostrando solo categoria e posizione dei rilievi. Per hosting statico conserva le intestazioni di `scripts/serve.mjs` e inoltra le cinque route a `index.html`.

Consulta [NOTICE.md](NOTICE.md). Questa demo pubblica separata è distribuita con licenza MIT; consulta [LICENSE](LICENSE). I repository privati originali non sono coperti.

## Replay offline e causalità

Esegui `npm run demo:replay` per vedere gli eventi sintetici, disponibili anche nella pagina Sistemi. Una decisione vede solo i dati già disponibili, non quelli arrivati dopo. Uno stato obsoleto rifiuta la decisione successiva. Il mock esegue un ordine solo in un passaggio esplicito. Il saldo è fittizio, non un rendimento reale.
