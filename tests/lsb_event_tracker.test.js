const assert=require('node:assert/strict');
require('../lsb_event_tracker.js');
const T=globalThis.LSBEventTracker;
const signal={match:'Nacional Potosí - Oriente Petrolero',time:'2026-11-04T23:46',minute:49,score:'1-1',market:'remaining_over_1_5',odds:1.53,stake:10};
const goal={match:signal.match,time:'2026-11-05T00:05',minute:47,type:'goal',score:'2-1'};
let a=T.evaluate(signal,[goal]);assert.equal(a.status,'live');assert.equal(a.counted,1);assert.equal(a.remaining,1);
const final={match:signal.match,time:'2026-11-05T00:55',minute:90,type:'final',score:'3-1'};
a=T.evaluate(signal,[goal,final]);assert.equal(a.status,'win');
a=T.evaluate(signal,[goal,{...final,score:'2-1'}]);assert.equal(a.status,'loss');
a=T.evaluate({...signal,market:'home_remaining_over_0_5'},[goal]);assert.equal(a.remaining,0);assert.equal(a.status,'live');
a=T.evaluate({...signal,score:'2-1',time:'2026-11-05T00:06'},[goal,final]);assert.equal(a.counted,0);assert.equal(a.status,'loss');
a=T.evaluate(signal,[goal,{...final,score:'1-1'}]);assert.equal(a.status,'conflict');
assert.equal(T.validateEvent(goal),true);
console.log('LSB event tracker tests passed');

a=T.evaluate({...signal,match:'Nacional Potosi - Oriente Petrolero'},[goal]);assert.equal(a.remaining,1);
