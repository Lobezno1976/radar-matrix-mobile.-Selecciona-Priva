const assert=require('node:assert/strict');require('../cp033_journal.js');const j=globalThis.RadarCP033Journal;
const a={Date:'2026-11-01',HomeTeam:'Valencia',AwayTeam:'Real Madrid',FTHG:1,FTAG:2};
const b={...a,HC:7,AC:4};const mapped=j.fromProvider({date:a.Date,home:a.HomeTeam,away:a.AwayTeam,home_goals:1,away_goals:2,home_corners:7,away_corners:4},x=>x);assert.deepEqual(mapped,b);const first=j.reconcile([], [a], 'test','t1');assert.equal(first.rows.length,1);assert.equal(first.events[0].action,'ADDED');
const second=j.reconcile(first.rows,[b],'test','t2');assert.equal(second.rows.length,1);assert.equal(second.rows[0].HC,7);assert.equal(second.events[0].action,'ENRICHED');
const third=j.reconcile(second.rows,[{...b,FTHG:3}],'test','t3');assert.equal(third.rows[0].FTHG,1);assert.equal(third.conflicts.length,1);
const again=j.reconcile(second.rows,[b],'test','t4');assert.equal(again.events[0].action,'UNCHANGED');
const rounds=j.audit(second.rows,[{date:a.Date,home:a.HomeTeam,away:a.AwayTeam,round:10}], '2026/27','t5');assert.equal(rounds[9].finalized,1);assert.equal(rounds[9].missing,9);assert.equal(rounds[9].complete,false);console.log('CP-033 journal regression passed');

const missing=j.reconcile(second.rows,[{...a,HC:null,AC:null}],'test','t6');assert.equal(missing.rows[0].HC,7);assert.equal(missing.events[0].action,'UNCHANGED');
