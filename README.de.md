# Meridian Drift Observatory · DEMO-Kontrollraum

Sprachen: [English](README.md) · [Русский](README.ru.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Deutsch](README.de.md) · [Українська](README.uk.md) · [Español](README.es.md) · [日本語](README.ja.md) · [简体中文](README.zh.md) · [हिन्दी](README.hi.md)

**Alle Kontostände, Kerzen, Aufträge und Ausführungen sind synthetische DEMO-Daten.** Dies ist eine interaktive Oberfläche, keine Trading-Anwendung, kein Backtest und kein Nachweis realer Gewinne.

## Start

Node.js 22+ und npm werden benötigt. Es gibt keine Drittanbieterpakete.

```sh
npm ci --ignore-scripts
npm test
npm run build
npm start
```

Öffnen Sie `http://localhost:4173`; mit Ctrl+C beenden. Anderer lokaler Port: `PORT=4174 npm start`. Der Server bindet nur an Loopback. Registrierung, Passwort, API-Schlüssel, Konto und Umgebungsdatei sind nicht nötig. `name` und `YOUR_ACCOUNT_ID` sind Beispielwerte.

## Ablauf

1. Beginnen Sie mit READY und dem synthetischen Preis 100 UNIT.
2. Geben Sie BUY mit Limit 99 und Menge 1 ein.
3. „Следующий mock-шаг“ setzt den Preis auf 99, den Bestand auf 9901 UNIT und die Position auf 1 DEMO: simulierte Ausführung.
4. Geben Sie SELL bei 101 ein. Zwei Schritte liefern 98 und 101; SELL wird simuliert ausgeführt.
5. „Отменить mock-заявки“ storniert Aufträge, schließt aber keine Position.
6. STALE oder UNAVAILABLE weist Schritte, Aufträge und Stornierungen ausdrücklich zurück. READY setzt fort; „Сбросить демо“ setzt alles zurück.

Fünf Seiten sind nutzbar: Start, Systeme, Betrieb, Ereignisse und Konto. Der Zustand liegt nur im Arbeitsspeicher des Tabs; Neuladen setzt ihn zurück. Es gibt einen festen Preiszyklus, ein begrenztes Auftragsmodell und ein Ereignisprotokoll. Keine echten Trades, Marktabfragen, Signaturen, Trading-Schlüssel, Trading-Wallets, Live-Funktion oder Renditeberechnung.

## Spenden und Grenzen

Die Startseite zeigt Texte in EN/RU/FR/IT/DE/UK/ES/JA/ZH/HI sowie die öffentliche EVM-Adresse des Eigentümers mit Kopierschaltfläche. Native Coins und Token kompatibler EVM-Netzwerke, einschließlich USDT und USDC, sofern unterstützt, können nach Prüfung des genauen Netzwerks und Tokens gesendet werden. Fiat-Währungen und Überweisungen außerhalb von EVM werden an dieser Adresse nicht angenommen. Die Demo verbindet kein Wallet und versendet keine Transaktionen; die Spendenadresse ist vom simulierten Trading-Konto getrennt.

Meridian Drift stammt aus einem Textkonzept im Quellprojekt; eine visuelle Vorlage lag nicht vor. Farben und Layout lehnen sich an den vorhandenen Control Room an. Dieses Projekt hat eine neue Git-Historie und enthält keine privaten Daten oder Produktionsdienste.

`npm run build` exportiert genau acht erlaubte Dateien nach `dist/`. `npm run scan` prüft Dateien, Build, Metadaten und sämtliche Git-Objekte und zeigt bei Treffern nur Kategorie und Ort. Bei statischem Hosting die Header aus `scripts/serve.mjs` beibehalten und fünf Routen auf `index.html` umschreiben.

Rechte: [NOTICE.md](NOTICE.md). Diese separate öffentliche Demo steht unter der MIT-Lizenz; siehe [LICENSE](LICENSE). Private Quellrepositorys sind nicht abgedeckt.

## Offline-Replay und Kausalität

Mit `npm run demo:replay` wird eine synthetische Ereignisfolge angezeigt, ebenso auf der Seite Systeme. Eine Entscheidung sieht nur zu diesem Zeitpunkt verfügbare Daten, keine später eingetroffenen. Bei veraltetem Zustand wird die nächste Entscheidung abgelehnt. Eine simulierte Ausführung erfolgt nur in einem ausdrücklichen Mock-Schritt. Der Saldo ist fiktiv, keine echte Rendite.
