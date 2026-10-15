const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.EXHIBITION_URL||'http://127.0.0.1:4173/');
  await page.waitForFunction(()=>!document.querySelector('#breaker').disabled);
  assert.equal(await page.locator('body').getAttribute('data-scroll-mode'),'native');
  await page.locator('#sound').click();await page.locator('#breaker').click();
  await page.waitForFunction(()=>document.body.dataset.scrollMode==='locomotive');
  await page.mouse.move(1300,500);await page.mouse.wheel(0,650);
  await page.waitForTimeout(80);const early=await page.evaluate(()=>scrollY);
  await page.waitForTimeout(900);const late=await page.evaluate(()=>scrollY);
  assert(early>0&&late>early+20,`No smooth interpolation: ${early},${late}`);
  await page.evaluate(()=>window.ExhibitionScroll.to('#etude-1',{immediate:true}));
  await page.locator('#etude-1 [data-order]').click();
  await page.waitForFunction(()=>document.documentElement.classList.contains('lenis-stopped'));
  const before=await page.evaluate(()=>scrollY);await page.mouse.move(4,500);await page.mouse.wheel(0,600);await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>scrollY),before);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.documentElement.classList.contains('lenis-stopped'));
  await page.evaluate(()=>window.ExhibitionScroll.to(0,{immediate:true}));
  await page.locator('.scroll-cue').click();
  await page.waitForTimeout(1100);assert((await page.url()).includes('#etude-1'));assert(await page.evaluate(()=>scrollY>700));
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.body.dataset.scrollMode==='native');
  assert(!await page.locator('html').evaluate(el=>el.classList.contains('has-smooth-scroll')));
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.body.dataset.scrollMode==='locomotive');
  await page.evaluate(()=>window.ExhibitionScroll.to(0,{immediate:true}));await page.locator('#breaker').click();
  await page.waitForFunction(()=>document.body.dataset.scrollMode==='native');
  assert.equal(await page.evaluate(()=>scrollY),0);assert.deepEqual(errors,[]);
  console.log(`PASS Locomotive: wheel interpolation ${early}→${late}, modal lock/resume, anchors, reduced motion, power-off`);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
