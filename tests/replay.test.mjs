import test from 'node:test';
import assert from 'node:assert/strict';
import {replayEvents, runDemo, sampleEvents} from '../src/replay.mjs';

test('a decision sees only data available before it, including after replay finishes', () => {
  let heldView;
  const observed = replayEvents(sampleEvents, (event, view) => {
    if (event.id === 'decision-1') {
      heldView = view;
      return view.latest('BOOK')?.price;
    }
  });
  assert.ok(observed.includes(100));
  assert.equal(heldView.latest('BOOK').price, 100);
  assert.throws(() => heldView.at(5), /future/i);
  const early = sampleEvents.map(e => e.id === 'book-2' ? {...e, availableAt: 2} : e);
  const changed = runDemo(early).timeline.find(e => e.id === 'decision-1');
  assert.equal(changed.observedPrice, 99);
});

test('the example fills only on an explicit step and rejects stale decisions', () => {
  const result = runDemo();
  const decision = result.timeline.find(e => e.id === 'decision-1');
  const fill = result.timeline.find(e => e.id === 'candle-1');
  const stale = result.timeline.find(e => e.id === 'decision-2');
  assert.deepEqual([decision.result, decision.observedPrice], ['MOCK_ORDER', 100]);
  assert.deepEqual([fill.result, fill.price, result.fills], ['MOCK_FILL', 99, 1]);
  assert.deepEqual([stale.result, stale.reason, result.balance, result.inventory], ['REJECT', 'STALE', 9901, 1]);
  const ready = sampleEvents.map(e => e.id === 'status-1' ? {...e, health: 'READY'} : e);
  assert.notEqual(runDemo(ready).timeline.find(e => e.id === 'decision-2').reason, 'STALE');
  assert.deepEqual(runDemo(), runDemo());
});

test('unavailable, missing and invalid evidence fail explicitly', () => {
  assert.throws(() => replayEvents([{...sampleEvents[0], synthetic: false}], () => {}), /synthetic/i);
  assert.throws(() => replayEvents([{...sampleEvents[0], availableAt: -1}], () => {}), /available/i);
  assert.throws(() => replayEvents([sampleEvents[0], sampleEvents[0]], () => {}), /duplicate/i);
  const noBook = runDemo(sampleEvents.filter(e => e.kind !== 'BOOK')).timeline.find(e => e.id === 'decision-1');
  assert.deepEqual([noBook.result, noBook.reason], ['REJECT', 'NO_BOOK']);
  const unavailable = sampleEvents.map(e => e.id === 'status-1' ? {...e, health: 'UNAVAILABLE'} : e);
  assert.deepEqual([runDemo(unavailable).timeline.find(e => e.id === 'decision-2').result,
    runDemo(unavailable).timeline.find(e => e.id === 'decision-2').reason], ['REJECT', 'UNAVAILABLE']);
});
