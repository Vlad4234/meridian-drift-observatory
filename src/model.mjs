// Every number here is invented. No trading, transport or credential capability.
export const PRICES = Object.freeze([100, 99, 98, 101, 103, 97, 96, 102, 104, 100, 95, 99]);
export function initialState() {
  return { tick: 0, quote: 10000, base: 0, orders: [], fills: [], events: [], nextId: 1, health: 'READY' };
}
const clone = (s) => structuredClone(s);
export const price = (s) => PRICES[s.tick % PRICES.length];
export const reservedQuote = (s) => s.orders.filter(o => o.side === 'BUY').reduce((n, o) => n + o.limit * o.quantity, 0);
export const reservedBase = (s) => s.orders.filter(o => o.side === 'SELL').reduce((n, o) => n + o.quantity, 0);
function ready(s) {
  if (s.health !== 'READY') throw new Error(s.health === 'STALE' ? 'DEMO: данные устарели. Восстановите сценарий READY.' : 'DEMO: mock-площадка недоступна. Действие не выполнено.');
}
function log(s, kind, message) {
  s.events.unshift({ tick: s.tick, kind, message });
  s.events = s.events.slice(0, 80);
}
export function reduce(state, action) {
  if (action.type === 'RESET') return initialState();
  const s = clone(state);
  if (action.type === 'HEALTH') {
    if (!['READY', 'STALE', 'UNAVAILABLE'].includes(action.value)) throw new Error('Неизвестное состояние DEMO.');
    s.health = action.value;
    log(s, 'SCENARIO', `DEMO: ${s.health}`);
  } else if (action.type === 'PLACE') {
    ready(s);
    const {side, limit, quantity} = action;
    if (!['BUY', 'SELL'].includes(side) || !Number.isFinite(limit) || limit <= 0 || limit > 100000 || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) throw new Error('DEMO: проверьте цену и целое количество от 1 до 100.');
    if (s.orders.length >= 20) throw new Error('DEMO: лимит 20 mock-заявок.');
    if (side === 'BUY' && limit * quantity > s.quote - reservedQuote(s)) throw new Error('DEMO: недостаточно свободных синтетических единиц.');
    if (side === 'SELL' && quantity > s.base - reservedBase(s)) throw new Error('DEMO: недостаточно свободного синтетического актива.');
    s.orders.push({ id: `DEMO-${s.nextId++}`, side, limit, quantity });
    log(s, 'ORDER', `DEMO: ${side} ${quantity} @ ${limit}`);
  } else if (action.type === 'STEP') {
    ready(s);
    s.tick += 1;
    const mark = price(s), remaining = [];
    for (const o of s.orders) {
      const crosses = o.side === 'BUY' ? mark <= o.limit : mark >= o.limit;
      if (!crosses) { remaining.push(o); continue; }
      // Reservations already guarantee affordable fills. No fees/slippage model.
      const direction = o.side === 'BUY' ? 1 : -1;
      s.base += direction * o.quantity;
      s.quote -= direction * mark * o.quantity;
      s.fills.unshift({ ...o, executionPrice: mark, tick: s.tick, demo: true });
      s.fills = s.fills.slice(0, 100);
      log(s, 'FILL', `DEMO: ${o.id} исполнена в mock по ${mark}`);
    }
    s.orders = remaining;
    log(s, 'TICK', `DEMO: шаг ${s.tick}, цена ${mark}`);
  } else if (action.type === 'CANCEL_ALL') {
    ready(s);
    const count = s.orders.length;
    s.orders = [];
    log(s, 'CANCEL', `DEMO: отменено mock-заявок: ${count}. Позиция не закрывалась.`);
  } else throw new Error('Неизвестное действие DEMO.');
  return s;
}
