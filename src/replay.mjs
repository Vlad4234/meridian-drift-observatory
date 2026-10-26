// Public teaching example: available-time ordering and a bounded mock model.
// No transport, signing, account adapter or live execution capability.
import {initialState, reduce, PRICES} from './model.mjs';

const order = {STATUS: 0, BOOK: 1, CANDLE: 2, DECISION: 3};
const allowedHealth = new Set(['READY', 'STALE', 'UNAVAILABLE']);

export const sampleEvents = Object.freeze([
  {id: 'book-1', kind: 'BOOK', receivedAt: 0, availableAt: 1, synthetic: true, price: 100},
  {id: 'book-2', kind: 'BOOK', receivedAt: 2, availableAt: 5, synthetic: true, price: 99},
  {id: 'decision-1', kind: 'DECISION', receivedAt: 3, availableAt: 3, synthetic: true,
    side: 'BUY', limit: 99, quantity: 1},
  {id: 'candle-1', kind: 'CANDLE', receivedAt: 6, availableAt: 6, synthetic: true, price: 99},
  {id: 'status-1', kind: 'STATUS', receivedAt: 7, availableAt: 8, synthetic: true, health: 'STALE'},
  {id: 'decision-2', kind: 'DECISION', receivedAt: 9, availableAt: 9, synthetic: true,
    side: 'BUY', limit: 98, quantity: 1},
].map(e => Object.freeze(e)));

function validate(events) {
  if (!Array.isArray(events) || events.length > 64) throw new Error('DEMO: expected up to 64 synthetic events');
  const ids = new Set();
  return events.map((item, sequence) => {
    if (!item || item.synthetic !== true) throw new Error('DEMO: only synthetic events are accepted');
    if (typeof item.id !== 'string' || !/^[a-z0-9-]{1,40}$/.test(item.id)) throw new Error('DEMO: invalid event id');
    if (ids.has(item.id)) throw new Error('DEMO: duplicate event id');
    ids.add(item.id);
    if (!Object.hasOwn(order, item.kind)) throw new Error('DEMO: unknown event kind');
    if (!Number.isSafeInteger(item.receivedAt) || item.receivedAt < 0 ||
        !Number.isSafeInteger(item.availableAt) || item.availableAt < item.receivedAt)
      throw new Error('DEMO: available time must follow receive time');
    if ((item.kind === 'BOOK' || item.kind === 'CANDLE') &&
        (!Number.isFinite(item.price) || item.price <= 0)) throw new Error('DEMO: invalid synthetic price');
    if (item.kind === 'STATUS' && !allowedHealth.has(item.health)) throw new Error('DEMO: invalid status');
    if (item.kind === 'DECISION' && (item.side !== 'BUY' && item.side !== 'SELL' ||
        !Number.isFinite(item.limit) || item.limit <= 0 ||
        !Number.isSafeInteger(item.quantity) || item.quantity < 1)) throw new Error('DEMO: invalid mock decision');
    return Object.freeze({...item, sequence});
  }).sort((a, b) => a.availableAt - b.availableAt || order[a.kind] - order[b.kind] || a.sequence - b.sequence);
}

export function replayEvents(events, onDispatch) {
  if (typeof onDispatch !== 'function') throw new TypeError('DEMO: dispatch callback required');
  const queue = validate(events);
  const visible = [], outputs = [];
  for (const event of queue) {
    visible.push(event);
    // A saved view is fixed to this dispatch. It cannot expose a later event.
    const prefix = Object.freeze([...visible]);
    const view = Object.freeze({
      now: event.availableAt,
      latest: kind => prefix.findLast(e => e.kind === kind),
      at: time => {
        if (!Number.isSafeInteger(time) || time < 0 || time > event.availableAt)
          throw new Error('DEMO: future or invalid available time');
        return prefix.filter(e => e.availableAt <= time);
      },
    });
    outputs.push(onDispatch(event, view));
  }
  return outputs;
}

export function runDemo(events = sampleEvents) {
  let state = initialState();
  const timeline = replayEvents(events, (event, view) => {
    const base = {id: event.id, kind: event.kind, availableAt: event.availableAt, synthetic: true};
    if (event.kind === 'BOOK') return {...base, result: 'VISIBLE', price: event.price};
    if (event.kind === 'STATUS') {
      state = reduce(state, {type: 'HEALTH', value: event.health});
      return {...base, result: 'STATE', health: state.health};
    }
    if (event.kind === 'CANDLE') {
      const next = PRICES[(state.tick + 1) % PRICES.length];
      if (event.price !== next) return {...base, result: 'REJECT', reason: 'PRICE_MISMATCH'};
      try {
        const prior = state.fills.length;
        state = reduce(state, {type: 'STEP'});
        return {...base, result: state.fills.length > prior ? 'MOCK_FILL' : 'MOCK_STEP', price: next};
      } catch { return {...base, result: 'REJECT', reason: state.health}; }
    }
    const book = view.latest('BOOK');
    if (state.health !== 'READY') return {...base, result: 'REJECT', reason: state.health};
    if (!book) return {...base, result: 'REJECT', reason: 'NO_BOOK'};
    if (event.availableAt - book.availableAt > 3) return {...base, result: 'REJECT', reason: 'STALE_BOOK'};
    try {
      state = reduce(state, {type: 'PLACE', side: event.side, limit: event.limit, quantity: event.quantity});
      return {...base, result: 'MOCK_ORDER', observedPrice: book.price};
    } catch { return {...base, result: 'REJECT', reason: 'MODEL_REJECTED'}; }
  });
  return {label: 'SYNTHETIC DEMO · NO MARKET HISTORY · NO REAL RETURNS',
    timeline, balance: state.quote, inventory: state.base, fills: state.fills.length};
}
