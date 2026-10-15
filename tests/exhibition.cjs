const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const AxeBuilder = require('@axe-core/playwright').default;
const url = process.env.EXHIBITION_URL || 'http://127.0.0.1:4173/';
const output = path.resolve(__dirname, '../test-results');
(async () => {
  await fs.mkdir(output, { recursive: true });
  for (const [engine, browserType] of [['chromium', chromium]]) {
    const browser = await browserType.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(url);
    await page.locator('#breaker').waitFor({ state: 'visible' });
    await page.waitForFunction(() => !document.querySelector('#breaker').disabled);
    assert.equal(await page.locator('#exhibition').getAttribute('inert'), '');
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflowY), 'hidden');
    await page.screenshot({ path: path.join(output, `exhibition-${engine}-off.png`) });
    await page.locator('#sound').click();
    await page.locator('#breaker').press('Space');
    await page.waitForTimeout(2900);
    assert.equal(await page.locator('#breaker').getAttribute('aria-checked'), 'true');
    assert.equal(await page.evaluate(() => document.querySelector('#exhibition').inert), false);
    assert.equal(await page.locator('.exhibit-section').count(), 4);
    await page.screenshot({ path: path.join(output, `exhibition-${engine}-hero.png`) });
    assert.equal(await page.locator('.entrance-credit').count(), 0);
    assert.equal(await page.locator('.scroll-cue').getAttribute('aria-label'), 'Перейти к первой фотографии');
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(0, 0, 0)');
    const hum = await page.locator('.neon-on').evaluate(el => el.getAnimations().map(a => a.animationName));
    assert(hum.includes('voltage-hum'));
    for (let i = 1; i <= 4; i++) {
      const section = page.locator(`#etude-${i}`);
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      const lamp = await section.locator('.spotlight').boundingBox();
      assert(lamp.width >= 220 && lamp.width <= 340);
      await page.screenshot({ path: path.join(output, `exhibition-${engine}-work-${i}.png`) });
      assert(await section.locator('.photo-window img').evaluate(el => el.complete && el.naturalWidth > 0));
      const mask = await page.locator('.concrete-wall').evaluate(el => getComputedStyle(el).maskImage);
      assert(mask.includes('radial-gradient'));
    }
    await page.locator('#etude-1 [data-inspect]').first().click();
    assert(await page.locator('#inspection').isVisible());
    await page.locator('#zoom-toggle').click();
    assert.equal(await page.locator('#zoom-toggle').getAttribute('aria-pressed'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#inspection').isVisible(), false);
    for (let i = 1; i <= 4; i++) {
      await page.locator(`#etude-${i} [data-order]`).click();
      assert((await page.locator('#order-work').innerText()).includes(['Спасатель 03','Тбилиси','Сити в тумане','Космай'][i-1]));
      await page.locator('#order-size').selectOption('large');
      await page.locator('#order input[value="frame"]').check();
      const href = await page.locator('#telegram-order').getAttribute('href');
      assert(/9\s900/.test(decodeURIComponent(href)));
      assert(decodeURIComponent(href).includes('в кастомной раме'));
      await page.keyboard.press('Escape');
    }
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    assert.deepEqual(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), []);
    for (const width of [320, 375, 390, 430, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
      await page.locator('#etude-1').scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `horizontal overflow ${engine} ${width}`);
      for (let i = 1; i <= 4; i++) {
        const rect = await page.locator(`#etude-${i} .museum-placard`).boundingBox();
        assert(rect.x >= 0 && rect.x + rect.width <= width + 1, `placard outside ${width}`);
      }
      if (width < 700) {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForTimeout(200);
        await page.screenshot({ path: path.join(output, `exhibition-${engine}-${width}-hero.png`) });
        await page.locator('#etude-1').scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await page.screenshot({ path: path.join(output, `exhibition-${engine}-${width}.png`) });
        await page.locator('#etude-4').scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
        await page.screenshot({ path: path.join(output, `exhibition-${engine}-${width}-work4.png`) });
      }
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.locator('#breaker').click();
    assert.equal(await page.locator('#breaker').getAttribute('aria-checked'), 'false');
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflowY), 'hidden');
    assert.deepEqual(errors, []);
    console.log(`PASS ${engine}: entry, sustained flicker, four works, inspection, four order drafts, accessibility, 390–1440px, power-off`);
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
