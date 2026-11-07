/* Run with: node tests/cp033_coverage.test.js */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const context={};context.window=context;
vm.runInNewContext(fs.readFileSync(path.join(root,'cp033_coverage.js'),'utf8'),context);
const gate=context.RadarCP033Coverage;
const catalog=JSON.parse(fs.readFileSync(path.join(root,'catalog139.json'),'utf8'));
assert.equal(catalog.length,139);
assert.equal(gate.filter(catalog).length,139,'All supported catalog markets must survive');
for(const id of ['FIRST_GOAL_HOME','FIRST_CORNER_AWAY','FIRST_CARD_HOME','CORNER_1H_OVER','CARD_1H_OVER','C1H_OVER','T1H_OVER'])
 assert.equal(gate.eligible({id}),false,id);
const rows=[
 {Date:'2024-09-01',HomeTeam:'Valencia',AwayTeam:'Real Madrid',HS:'10',AS:'12',HST:'2',AST:'4'},
 {Date:'2025-09-01',HomeTeam:'Valencia',AwayTeam:'Real Madrid',HS:'',AS:'15',HST:'3',AST:'5'},
 {Date:'2026-09-01',HomeTeam:'Valencia',AwayTeam:'Real Madrid',HS:'20',AS:'11',HST:'6',AST:'3'}
];
const w=gate.windows(rows,'Valencia','Real Madrid','2026-11-07');
const shots=w.h2h.find(x=>x.market==='Tiros totales');
assert.equal(shots.n,2,'Missing HS must not be interpreted as zero');
assert.equal(shots.min,22);assert.equal(shots.max,31);
assert.equal(w.homeCurrent.find(x=>x.market==='Tiros totales').n,1);
assert.equal(w.home3.find(x=>x.market==='Tiros totales').n,1);
console.log('CP-033 coverage: PASS (139/139 markets; exclusions; missing data; ranges; windows)');
