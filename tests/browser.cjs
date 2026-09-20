// Read-only browser checks; no messages, purchases or external submissions.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const base = process.env.TEST_URL || 'http://127.0.0.1:4173/';
const ids = ['rescuer-03', 'tbilisi', 'city', 'kosmaj'];
const titles = ['Спасатель 03', 'Тбилиси', 'Сити в тумане', 'Космай'];

async function main() {
  await fs.mkdir('test-results', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    const missing = [];
    const requests = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (r) => { if (r.status() >= 400) missing.push(`${r.status()} ${r.url()}`); });
    page.on('request', (r) => requests.push(r.url()));
    await page.goto(base);
    await page.waitForSelector('#catalog-grid .art-card');
    assert.equal(await page.locator('#catalog-grid .art-card').count(), 4);
    await page.locator('#author').scrollIntoViewIfNeeded();
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: 'test-results/desktop-home.png', fullPage: true });
    for (let i = 0; i < ids.length; i++) {
      await page.goto(`${base}#work/${ids[i]}`);
      await page.waitForFunction((title) => document.querySelector('#work-title').textContent === title, titles[i]);
      await page.waitForFunction(() => document.querySelector('#work-image').complete && document.querySelector('#work-image').naturalWidth > 0);
      for (const size of ['small', 'large']) {
        await page.locator(`[data-size="${size}"]`).click();
        const expected = size === 'small' ? /5\s900/ : /9\s900/;
        assert.match(await page.locator('#work-price').innerText(), expected);
        const message = await page.locator('#order-message').inputValue();
        assert.ok(message.includes(titles[i])); assert.match(message, expected);
        assert.match(message, /без рамы и паспарту/);
        const paper = i < 2 ? (size === 'small' ? '60 × 40' : '90 × 60') : (size === 'small' ? '40 × 60' : '60 × 90');
        assert.ok(message.includes(`Лист: ${paper} см`));
        for (const finish of ['print', 'oak', 'metal']) {
          await page.locator(`[data-preview="${finish}"]`).click();
          assert.equal(await page.locator('#preview-stage').getAttribute('data-finish'), finish);
          assert.equal(await page.locator('#order-message').inputValue(), message);
          assert.match(await page.locator('#work-price').innerText(), expected);
          assert.match(await page.locator('#preview-caption').innerText(), /[Рр]ама/);
          assert.equal(await page.locator('#work-image').evaluate((img) => getComputedStyle(img).objectFit), 'contain');
        }
      }
      if (i === 1) await page.screenshot({ path: 'test-results/desktop-work.png', fullPage: true });
      await page.locator('#preview-stage').click();
      assert.equal(await page.locator('#image-dialog').evaluate((d) => d.open), true);
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('#image-dialog').open);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'preview-stage');
      await page.reload();
      await page.waitForFunction((title) => document.querySelector('#work-title').textContent === title, titles[i]);
    }
    console.log('PASS: 24 work / size / preview combinations, four direct links, reload and zoom');

    // Clipboard fallback remains usable when browser permissions deny access.
    await page.locator('.order-details summary').click();
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } }));
    await page.locator('#copy-order').click();
    await page.waitForFunction(() => document.querySelector('#copy-status').textContent.includes('вручную'));
    assert.equal(await page.locator('#order-message').evaluate((el) => el.selectionEnd - el.selectionStart), (await page.locator('#order-message').inputValue()).length);
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text) => { window.copiedOrder = text; } } }));
    await page.locator('#copy-order').click();
    await page.waitForFunction(() => document.querySelector('#copy-status').textContent.includes('скопирован'));
    assert.equal(await page.evaluate(() => window.copiedOrder), await page.locator('#order-message').inputValue());
    assert.equal(await page.locator('#order-link').getAttribute('href'), 'https://t.me/yopech');
    assert.equal(await page.locator('#order-link').getAttribute('target'), '_blank');
    console.log('PASS: copy success, copy denied, correct Telegram destination');

    await page.locator('nav a[href="#works"]').click();
    await page.locator('#catalog-grid a[href="#work/city"]').click();
    await page.waitForFunction(() => document.querySelector('#work-title').textContent === 'Сити в тумане');
    await page.goBack();
    await page.waitForFunction(() => !document.querySelector('#works').hidden);
    await page.goForward();
    await page.waitForFunction(() => !document.querySelector('#work-page').hidden);
    for (const hash of ['print', 'author']) {
      await page.locator(`nav a[href="#${hash}"]`).click();
      await page.waitForFunction((id) => { const y = document.getElementById(id).getBoundingClientRect().top; return y >= -5 && y < innerHeight; }, hash);
    }
    await page.goto(`${base}#work/not-a-work`);
    await page.waitForFunction(() => !document.querySelector('#works').hidden && location.hash === '#works');
    console.log('PASS: history, shared sections and unknown-route recovery');

    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const hash of ['works', 'work/rescuer-03', 'work/city']) {
        await page.goto(`${base}#${hash}`);
        await page.waitForFunction(() => document.querySelector('#catalog-grid').children.length === 4);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        assert.equal(overflow, false, `horizontal overflow at ${width}px / ${hash}`);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}#works`);
    await page.screenshot({ path: 'test-results/mobile-home.png', fullPage: true });
    await page.goto(`${base}#work/city`);
    await page.locator('[data-preview="oak"]').click();
    await page.screenshot({ path: 'test-results/mobile-work.png', fullPage: true });
    assert.deepEqual(errors, []); assert.deepEqual(missing, []);
    assert.ok(!requests.some((url) => /api\.telegram\.org|unsplash|vdnh|tsaritsyno|panelka|red_city/.test(url)));
    console.log('PASS: five viewport widths, no JS errors, no missing assets or hidden-work requests');

    const failurePage = await context.newPage();
    await failurePage.route('**/assets/web/city-*.jpg', (route) => route.abort());
    await failurePage.goto(`${base}#work/city`);
    await failurePage.locator('#preview-stage .image-error').waitFor({ state: 'visible' });
    await failurePage.locator('#preview-stage').click();
    await failurePage.locator('#zoom-error').waitFor({ state: 'visible' });
    await failurePage.close();
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const fallbackPage = await noJS.newPage();
    await fallbackPage.goto(base);
    assert.match(await fallbackPage.locator('noscript').innerText(), /напишите Игорю/);
    await noJS.close();
    console.log('PASS: failed-image and JavaScript-disabled fallbacks');
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
