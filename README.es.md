# Meridian Drift Observatory · panel de control DEMO

Idiomas: [English](README.md) · [Русский](README.ru.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Deutsch](README.de.md) · [Українська](README.uk.md) · [Español](README.es.md) · [日本語](README.ja.md) · [简体中文](README.zh.md) · [हिन्दी](README.hi.md)

**Todos los saldos, velas, órdenes y ejecuciones son datos sintéticos DEMO.** Es una demostración interactiva, no una aplicación de trading, un backtest ni una prueba de ganancias reales.

## Inicio

Necesitas Node.js 22+ y npm; no hay paquetes de terceros.

```sh
npm ci --ignore-scripts
npm test
npm run build
npm start
```

Abre `http://localhost:4173`; detén el servidor con Ctrl+C. Para otro puerto local usa `PORT=4174 npm start`. El servidor solo escucha en loopback. No requiere registro, contraseña, clave API, cuenta ni archivo de entorno. `name` y `YOUR_ACCOUNT_ID` son ejemplos.

## Escenario de prueba

1. Empieza en READY con precio sintético de 100 UNIT.
2. Crea una orden BUY con límite 99 y cantidad 1.
3. Pulsa «Следующий mock-шаг»: precio 99, saldo 9901 UNIT, posición 1 DEMO. Es una ejecución simulada.
4. Crea SELL con límite 101. Dos pasos llevan el precio a 98 y 101, y ejecutan el SELL simulado.
5. «Отменить mock-заявки» cancela las órdenes, pero no cierra la posición.
6. STALE o UNAVAILABLE rechaza expresamente los pasos, órdenes y cancelaciones. READY permite continuar; «Сбросить демо» reinicia todo.

Hay cinco páginas: Inicio, Sistemas, Operaciones, Eventos y Cuenta. El estado solo vive en la memoria de la pestaña; al recargar se reinicia. No hay operaciones reales, peticiones al mercado, claves, conexión a una cuenta de trading, modo live ni cálculo de rentabilidad. La interfaz de simulación usa etiquetas en ruso; esta guía explica los controles.

## Donaciones y límites

La portada muestra un mensaje en diez idiomas y la dirección EVM pública del propietario, con botón para copiar. Se pueden enviar monedas nativas y tokens de redes EVM compatibles, como USDT y USDC donde estén disponibles. Comprueba la red y el token específicos antes de enviar. No se aceptan monedas fiduciarias ni transferencias fuera de EVM. La demo no conecta carteras ni envía transacciones. La dirección de donaciones está separada de la cuenta de trading ficticia.

Meridian Drift es un concepto escrito en el proyecto de origen, sin maqueta visual. La paleta y disposición se adaptaron del Control Room existente. Esta demo tiene su propio historial Git, sin datos privados ni servicios de producción.

`npm run build` exporta ocho archivos permitidos a `dist/`. `npm run scan` revisa archivos, build y todos los objetos Git, indicando solo la categoría y ubicación de cualquier hallazgo. Para alojarlo como sitio estático conserva las cabeceras de `scripts/serve.mjs` y dirige las cinco rutas a `index.html`.

Este proyecto público separado usa la licencia MIT: [LICENSE](LICENSE). La licencia no se extiende a los repositorios privados de origen; consulta [NOTICE.md](NOTICE.md).

## Reproducción causal sin conexión

Ejecuta `npm run demo:replay` para ver eventos sintéticos, también visibles en Sistemas. Cada decisión usa solo datos disponibles en ese instante, nunca datos recibidos después. El estado obsoleto rechaza la siguiente decisión. Una ejecución simulada requiere un paso mock explícito. El saldo es ficticio, no una rentabilidad real.
