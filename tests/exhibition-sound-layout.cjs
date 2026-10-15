const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.addInitScript(()=>{
  window.audioAudit={sources:[],oscillators:[],ramps:[]};
  const Native=window.AudioContext;
  window.AudioContext=class extends Native{
   createBufferSource(){const s=super.createBufferSource();window.audioAudit.sources.push(s);const stop=s.stop.bind(s),start=s.start.bind(s);s.start=(time)=>{s.startedAt=time;return start(time)};s.immediateStops=0;s.stop=(time)=>{s.stopAt=time;if(time===undefined)s.immediateStops++;return stop(time)};return s}
   createOscillator(){const s=super.createOscillator();window.audioAudit.oscillators.push(s);return s}
   createGain(){const g=super.createGain(),ramp=g.gain.linearRampToValueAtTime.bind(g.gain);g.gain.linearRampToValueAtTime=(value,time)=>{window.audioAudit.ramps.push({value,time});return ramp(value,time)};return g}
  };
 });
 await page.goto(process.env.EXHIBITION_URL||'http://127.0.0.1:4173/');
 await page.waitForFunction(()=>!document.querySelector('#breaker').disabled);
 assert.equal(await page.evaluate(()=>window.audioAudit.sources.length),0);
 await page.locator('#breaker').click();
 await page.waitForFunction(()=>window.audioAudit.sources.some(s=>s.buffer?.duration>10));
 const audio=await page.evaluate(()=>{const s=window.audioAudit.sources.find(s=>s.buffer?.duration>10);return{duration:s.stopAt-s.startedAt,fade:window.audioAudit.ramps.some(r=>r.value===0&&Math.abs(r.time-s.stopAt)<.001),hum:window.audioAudit.oscillators.some(s=>s.frequency.value===50),short:window.audioAudit.sources.some(s=>s.buffer?.duration<.1)}});
 assert(audio.duration<=2.001&&audio.fade&&audio.hum&&audio.short);
 await page.locator('#sound').click();
 assert(await page.evaluate(()=>window.audioAudit.sources.find(s=>s.buffer?.duration>10).immediateStops>0));
 for(const width of [320,390,430,1440]){
  await page.setViewportSize({width,height:1000});
  for(let n=1;n<=4;n++){
   const card=page.locator(`#etude-${n} .museum-placard`);
   await card.locator('input[value=print]').check();
   const before=await card.boundingBox();
   const nextBefore=await card.locator('.neon-cta-btn').boundingBox();
   await card.locator('input[value=frame]').check();
   const after=await card.boundingBox();const nextAfter=await card.locator('.neon-cta-btn').boundingBox();
   assert(Math.abs(before.height-after.height)<.5,`Card ${n} jumps at ${width}`);
   assert(Math.abs((nextBefore.y-before.y)-(nextAfter.y-after.y))<.5,`CTA ${n} shifts at ${width}`);
  }
 }
 console.log('PASS: recorded ignition stops and fades to zero within 2s; synthetic sounds retained; stable compact cards at 320/390/430/1440px');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
