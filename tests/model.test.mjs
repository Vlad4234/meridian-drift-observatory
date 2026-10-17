import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, reduce, reservedQuote, reservedBase} from '../src/model.mjs';
const buy = (s, limit=99, quantity=1) => reduce(s, {type:'PLACE', side:'BUY', limit, quantity});
test('crossed BUY fills on explicit step and cancel does not flatten position',()=>{
  let s=buy(initialState());
  assert.equal(s.fills.length,0);
  s=reduce(s,{type:'STEP'});
  assert.deepEqual([s.quote,s.base,s.orders.length,s.fills[0].executionPrice],[9901,1,0,99]);
  s=reduce(s,{type:'PLACE',side:'SELL',limit:105,quantity:1});
  assert.equal(reservedBase(s),1);
  s=reduce(s,{type:'CANCEL_ALL'});
  assert.equal(s.base,1);
  assert.equal(s.quote,9901);
  assert.equal(s.orders.length,0);
});
test('crossed SELL credits quote once and consumes owned inventory',()=>{
  let s=reduce(buy(initialState()),{type:'STEP'});
  s=reduce(s,{type:'PLACE',side:'SELL',limit:101,quantity:1});
  s=reduce(s,{type:'STEP'});
  assert.equal(s.base,1);
  s=reduce(s,{type:'STEP'});
  assert.deepEqual([s.quote,s.base,s.orders.length,s.fills.length],[10002,0,0,2]);
  s=reduce(s,{type:'STEP'});
  assert.equal(s.fills.length,2);
});
test('reservations reject overspending and double-selling without mutating input',()=>{
  const s=buy(initialState(),100,100), before=structuredClone(s);
  assert.equal(reservedQuote(s),10000);
  assert.throws(()=>buy(s),/недостаточно/);
  assert.deepEqual(s,before);
  const filled=reduce(buy(initialState()),{type:'STEP'});
  const sold=reduce(filled,{type:'PLACE',side:'SELL',limit:101,quantity:1});
  assert.throws(()=>reduce(sold,{type:'PLACE',side:'SELL',limit:101,quantity:1}),/недостаточно/);
});
test('STALE and UNAVAILABLE reject step, place and cancellation atomically',()=>{
  for(const health of ['STALE','UNAVAILABLE']) {
    const s=reduce(buy(initialState()),{type:'HEALTH',value:health}), before=structuredClone(s);
    for(const action of [{type:'STEP'},{type:'CANCEL_ALL'},{type:'PLACE',side:'BUY',limit:99,quantity:1}]) assert.throws(()=>reduce(s,action),/DEMO/);
    assert.deepEqual(s,before);
    assert.equal(reduce(s,{type:'HEALTH',value:'READY'}).orders.length,1);
  }
});
test('invalid side, price, quantity and unknown action are rejected',()=>{
  for(const limit of [NaN,Infinity,0,-1,100001]) assert.throws(()=>buy(initialState(),limit),/проверьте/);
  for(const quantity of [NaN,Infinity,0,-1,1.5,101]) assert.throws(()=>buy(initialState(),99,quantity),/проверьте/);
  assert.throws(()=>reduce(initialState(),{type:'PLACE',side:'LIVE',limit:99,quantity:1}),/проверьте/);
  assert.throws(()=>reduce(initialState(),{type:'HEALTH',value:'LIVE'}),/Неизвестное/);
  assert.throws(()=>reduce(initialState(),{type:'LIVE'}),/Неизвестное/);
});
test('empty cancel reports zero and reset restores deterministic initial state',()=>{
  const s=reduce(initialState(),{type:'CANCEL_ALL'});
  assert.match(s.events[0].message,/0/);
  assert.deepEqual(reduce(buy(s),{type:'RESET'}),initialState());
});
test('order and visible-history bounds hold over repeated synthetic cycles',()=>{
  let s=initialState();
  for(let i=0;i<20;i++)s=buy(s,1,1);
  assert.throws(()=>buy(s,1,1),/20/);
  s=reduce(s,{type:'RESET'});
  for(let i=0;i<250;i++) {
    s=reduce(s,{type:'PLACE',side:s.base?'SELL':'BUY',limit:s.base?1:110,quantity:1});
    s=reduce(s,{type:'STEP'});
  }
  assert.ok(s.events.length<=80);
  assert.ok(s.fills.length<=100);
  assert.ok(s.quote>=0&&s.base>=0);
});
