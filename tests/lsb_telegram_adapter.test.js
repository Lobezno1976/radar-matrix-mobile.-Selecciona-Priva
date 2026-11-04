/* Run with: node tests/lsb_telegram_adapter.test.js */
const assert=require('node:assert/strict');
require('../lsb_telegram_adapter.js');
const parse=globalThis.LSBTelegramAdapter.parseMessage;
const base={id:1,date:'2026-11-03T18:52:00',text:'‼️ LIVE\n✅ Más de 1.5 (Resto del partido)\n⏱ Minuto: 48\n👕 AEK Athens - Real Madrid : 1 - 1\n💲 Cuota LIVE 1.57'};
let x=parse(base);assert.equal(x.status,'ok');assert.equal(x.record.market,'remaining_over_1_5');assert.equal(x.record.score,'1-1');assert.equal(x.record.odds,1.57);assert.equal(x.record.stake,0);
x=parse({...base,text:base.text.replace('1.5','0.5')});assert.equal(x.record.market,'remaining_over_0_5');
x=parse({...base,text:base.text.replace('1.5 (Resto','0.5 local (Resto')});assert.equal(x.record.market,'home_remaining_over_0_5');
x=parse({...base,text:base.text.replace('(Resto del partido)','')});assert.equal(x.status,'review');
x=parse({...base,text:'Hola, bienvenidos al canal'});assert.equal(x.status,'skip');
x=globalThis.LSBTelegramAdapter.parseExport({messages:[base,{...base,id:2,text:'Sin señal'}]});assert.equal(x.records.length,1);assert.equal(x.skipped,1);
console.log('LSB Telegram adapter: 6 assertions passed');
