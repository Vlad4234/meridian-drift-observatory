# Meridian Drift Observatory · DEMO Control Room

Languages: [English](README.md) · [Русский](README.ru.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Deutsch](README.de.md) · [Українська](README.uk.md)

**All balances, candles, orders and executions are synthetic DEMO data.**
This is an interactive visitor demonstration, not a trading application,
backtest, strategy evaluator or representation of actual returns.

## Run locally

Requires Node.js 22 or later and npm. There are no third-party packages.

```sh
npm ci --ignore-scripts
npm test
npm run build
npm start
```

Open `http://localhost:4173`. Stop with Ctrl+C. `PORT=4174 npm start`
selects another local port. The server binds only to loopback.
No registration, password, API key, account or environment file is required.
There is no default service password. `name` and `YOUR_ACCOUNT_ID` are labels.

## Try the scenario

1. Start with READY and a price of 100 synthetic UNIT.
2. Place BUY with limit 99 and quantity 1. It remains a mock order.
3. Click “Следующий mock-шаг”: price becomes 99; balance becomes 9901 UNIT,
   inventory becomes 1 DEMO. This is a simulated fill.
4. Place SELL at 101. Step twice: 98, then 101. SELL fills in mock.
5. “Отменить mock-заявки” cancels orders only; inventory is preserved.
6. Select STALE or UNAVAILABLE. Step, place and cancel now fail explicitly.
   Restore READY to continue. “Сбросить демо” resets the whole simulation.

The server accepts only GET/HEAD. State lives in one browser tab's memory;
navigation within the app preserves it, reload/new tab starts over.
There are no cookies, persistence, analytics, remote fonts, remote images,
market requests, trading transports, signing, wallet integration or live mode.
The server's CSP sets `connect-src 'none'`.

## Included components

- Five Control Room destinations: Home, Systems, Operations, Events, Account.
- Control Room palette/navigation exported into `src/control-room-tokens.json`.
- Adapted desktop sidebar, mobile drawer, market-board and status-strip layout.
- New SVG candle rendering, in-memory mock order model and failure scenarios.
- Deterministic synthetic price loop; limited orders (20), event history (80)
  and visible fills (100). No fees, latency, slippage or economic validation.
- Dependency-free Node build/server, model tests and publication scanner.

The Meridian Drift field-archive concept supplies the name and copy. The source
concept repository contained prose, not a visual mockup. The arrangement and
palette follow the existing Control Room; new visual details are an adaptation,
not a recovered or owner-approved cosmic prototype.

Production providers, auth, adapters, arming, control-plane limits, data stores,
logs, private reports and real trade histories are excluded. This model does
not execute the production strategy, BrainV1 or production safety mechanisms.

## Build and inspect

`npm run build` exports exactly seven allowlisted files to `dist/`. No source maps
or binary assets are generated. `npm run scan` scans the project, build files,
Git metadata and **all Git objects**, including unreachable objects. Findings
show category/location only. A clean scan is evidence from finite rules, not
a proof that arbitrary secrets can never exist. Review the exported file list.

For a hosted static copy, preserve the CSP and other response headers implemented
in `scripts/serve.mjs`, and rewrite the five named routes to `index.html`.
The donation destination, once configured, is a visitor-opened external link;
the application makes no payment requests. Only methods and currencies actually
supported by that destination can be used. Verify the destination before sending.

## Rights

See `NOTICE.md`. The owner authorized public presentation of this demo. No
open-source license grant has been selected; all rights remain reserved. Do not
imply an upstream license or permission that has not been given.
