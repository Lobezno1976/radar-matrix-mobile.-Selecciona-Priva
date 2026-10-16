/* RADAR v14 SHADOW bridge. Reads rendered canonical results; never changes selector. */
(function(){'use strict';
const target='./odds_shadow_v14.html';
function build(){
 const cards=[...document.querySelectorAll('#results .match-card')];
 const payload=[];
 for(const card of cards){
  const match=card.querySelector('h3')?.textContent?.trim()||'';
  const variants=[];
  for(const d of card.querySelectorAll('details.variant')){
   const name=(d.querySelector('summary')?.textContent||'').split(' · ')[0].trim();
   const labels=[...d.querySelectorAll('ol li')].map(n=>n.textContent.trim());
   const stats=d.querySelector('.stats')?.textContent?.trim()||'';
   if(name&&labels.length)variants.push({name,labels,stats});
  }
  if(variants.length)payload.push({match,variants});
 }
 return payload;
}
function ensureButton(){
 const root=document.getElementById('results');if(!root||document.getElementById('radarBridgeV14'))return;
 const btn=document.createElement('button');btn.id='radarBridgeV14';btn.type='button';btn.textContent='Enviar CORE/SAT al módulo de cuotas SHADOW';
 btn.style.margin='12px 0';btn.onclick=()=>{
  const matches=build();if(!matches.length){alert('No hay propuestas CORE/SAT calculadas para transferir. Ejecuta RADAR primero.');return;}
  try{sessionStorage.setItem('radar-v14-transfer',JSON.stringify({schema:1,created_at:new Date().toISOString(),matches}));location.href=target}
  catch(e){alert('No se pudo transferir en esta pestaña: '+e.message)}
 };
 root.parentElement.insertBefore(btn,root);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureButton);else ensureButton();
})();
