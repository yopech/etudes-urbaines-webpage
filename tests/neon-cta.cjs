const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    await page.goto(process.env.EXHIBITION_URL || "http://127.0.0.1:4173/");
    await page.waitForFunction(
      () => !document.querySelector("#breaker").disabled,
    );
    await page.locator("#sound").click();
    await page.locator("#breaker").click();
    await page.waitForTimeout(2600);
    assert.equal(await page.locator(".neon-cta-btn").count(), 4);
    assert.equal(await page.locator(".placard-actions").count(), 0);
    const switchStyle=await page.locator('.switch-stage').evaluate(el=>{const s=getComputedStyle(el);return{width:s.width,height:s.height,mask:s.maskImage}});
    assert.deepEqual(switchStyle,{width:'140px',height:'170px',mask:'none'});
    const numerals=await page.locator('.placard-title').first().evaluate(el=>getComputedStyle(el).fontVariantNumeric);
    assert(numerals.includes('lining-nums')&&numerals.includes('tabular-nums'));
    await page.evaluate(()=>window.scrollTo({top:100,behavior:'instant'}));
    await page.waitForTimeout(350);
    assert.equal(await page.locator('.scroll-cue').evaluate(el=>getComputedStyle(el).opacity),'0');
    for (let n = 1; n <= 4; n++) {
      const card = page.locator(`#etude-${n} .museum-placard`);
      await card.evaluate((el) =>
        el.scrollIntoView({ block: "center", behavior: "instant" }),
      );
      await page.waitForTimeout(650);
      const button = card.locator(".neon-cta-btn");
      assert((await button.getAttribute("class")).includes("is-in-view"));
      const dims = await button
        .locator("img")
        .evaluateAll((images) =>
          images.map((i) => [i.naturalWidth, i.naturalHeight]),
        );
      assert(
        dims.every(
          (d) => d[0] > 0 && d[0] === dims[0][0] && d[1] === dims[0][1],
        ),
      );
      await page.waitForFunction(
        (n) =>
          getComputedStyle(document.querySelector(`#etude-${n} .btn-layer-mid`))
            .opacity === "1",
        n,
      );
      await button.hover();
      await page.waitForTimeout(250);
      await page.waitForFunction(
        (n) =>
          getComputedStyle(
            document.querySelector(`#etude-${n} .btn-layer-full`),
          ).opacity === "1",
        n,
      );
      await page.mouse.move(1400, 20);
      await card.locator("input[value=frame]").check();
      assert.equal(await card.locator(".frame-note").count(),0);
      assert((await card.locator("[data-price]").innerText()).includes("5"));
      await button.click();
      await page.locator("#order").waitFor({ state: "visible" });
      assert(await page.locator('#order-frame-note').isVisible());
      await page.keyboard.press("Escape");
      await page.locator("#order").waitFor({ state: "hidden" });
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(700);
    assert.equal(await page.locator(".neon-cta-btn.is-in-view").count(), 0);
    for (const width of [320, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page
        .locator("#etude-1 .museum-placard")
        .evaluate((el) =>
          el.scrollIntoView({ block: "center", behavior: "instant" }),
        );
      await page.waitForTimeout(700);
      assert.equal(
        await page
          .locator("#etude-1 .edition-choice")
          .evaluate((el) => Math.round(el.getBoundingClientRect().height)),
        40,
      );
      const tabs = await page
        .locator("#etude-1 .edition-choice span")
        .evaluateAll((els) =>
          els.map((el) => ({
            width: el.clientWidth,
            scroll: el.scrollWidth,
            y: el.getBoundingClientRect().y,
          })),
        );
      assert(tabs.every((t) => t.scroll <= t.width));
      assert.equal(tabs[0].y, tabs[1].y);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      if (width === 390)
        await page.screenshot({ path: "test-results/neon-cta-mobile.png" });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page
      .locator("#etude-1")
      .evaluate((el) =>
        el.scrollIntoView({ block: "center", behavior: "instant" }),
      );
    await page.waitForTimeout(700);
    await page.mouse.move(1400, 20);
    await page.screenshot({ path: "test-results/neon-cta-desktop.png" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const transitions = await page
      .locator(".btn-layer-mid")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    assert.equal(transitions, "0s");
    for (const file of [
      "index.html",
      "exhibition.js",
      "power.js",
      "catalog.js",
      "exhibition.css",
      "neon.css",
    ])
      assert(!fs.readFileSync(file, "utf8").includes("—"), file);
    console.log(
      "PASS: four raster CTA triplets, scroll on/off, hover full, frame note, order/Escape, 40px segments, 320–430px, reduced motion, no em dashes",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
