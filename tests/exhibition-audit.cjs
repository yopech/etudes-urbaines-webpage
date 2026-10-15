const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const AxeBuilder = require("@axe-core/playwright").default;
const base = process.env.EXHIBITION_URL || "http://127.0.0.1:4173/";
(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(base + "#etude-2");
    await page.waitForFunction(() =>
      document.body.classList.contains("exhibition-open"),
    );
    await page.locator("#etude-2 [data-order]").click();
    await page.locator("#order-size").selectOption("large");
    await page.locator("#order input[value=frame]").check();
    assert(
      (await page.locator("#order-size option:checked").innerText()).startsWith(
        "90 × 60",
      ),
    );
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("#order").open);
    await page.locator("#etude-2 [data-order]").click();
    assert.equal(await page.locator("#order-size").inputValue(), "large");
    assert(await page.locator("#order input[value=frame]").isChecked());
    assert(
      (await page.locator("#order-summary").innerText()).includes("80 × 60"),
    );
    const orderAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    assert.deepEqual(
      orderAxe.violations.map((v) => v.id),
      [],
    );
    await page.screenshot({ path: "test-results/audit-order-390.png" });
    await page.goBack();
    await page.waitForFunction(() => !document.querySelector("#order").open);
    await page.goForward();
    await page.waitForFunction(() => document.querySelector("#order").open);
    assert(
      await page.evaluate(() =>
        document.querySelector("#order").contains(document.activeElement),
      ),
    );
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("#order").open);
    await page.locator("#etude-3 [data-inspect]").first().click();
    await page.locator("#inspect-order").click();
    await page.waitForTimeout(150);
    assert(
      await page.evaluate(() =>
        document.querySelector("#order").contains(document.activeElement),
      ),
    );
    assert(
      await page.evaluate(() =>
        document.body.classList.contains("dialog-open"),
      ),
    );
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("#order").open);
    assert(
      await page.evaluate(() =>
        document.activeElement.matches("#etude-3 [data-inspect]"),
      ),
    );
    for (const width of [320, 375, 390, 430, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.locator("#etude-1 [data-order]").scrollIntoViewIfNeeded();
      const buttons = await page
        .locator("#etude-1 .placard-actions button")
        .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
      assert(buttons.every((height) => height >= 44));
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#etude-1").scrollIntoViewIfNeeded();
    await page.screenshot({ path: "test-results/audit-exhibit-390.png" });
    await page.setViewportSize({ width: 720, height: 500 });
    await page.locator("#etude-4 [data-order]").click();
    const control = await page.locator("#telegram-order").boundingBox();
    await page.locator("#telegram-order").scrollIntoViewIfNeeded();
    assert(control.width > 0);
    await page.keyboard.press("Escape");
    const nojs = await browser.newContext({ javaScriptEnabled: false });
    const fallback = await nojs.newPage();
    await fallback.goto(base);
    assert(await fallback.locator(".static-gallery").isVisible());
    assert.equal(await fallback.locator(".static-gallery img").count(), 4);
    const broken = await context.newPage();
    await broken.route("**/neon-partial.jpg", (route) => route.abort());
    await broken.goto(base);
    await broken.locator("#skip-entry").waitFor({ state: "visible" });
    assert(!(await broken.locator("#notice").innerText()).includes("assets/"));
    await broken.locator("#skip-entry").click();
    assert(await broken.locator("#etude-1 [data-order]").isVisible());
    const missing = await context.newPage();
    await missing.route("**/photo-1.jpg", (route) => route.abort());
    await missing.goto(base + "#etude-1");
    await missing.locator("#etude-1 [data-inspect]").first().click();
    await missing.locator("#retry-photo").waitFor({ state: "visible" });
    assert(
      (await missing.locator("#inspection-status").innerText()).includes(
        "не загрузилась",
      ),
    );
    assert(await missing.locator("#inspect-order").isEnabled());
    await context.close();
    await nojs.close();
    console.log(
      "PASS audit: drafts per work, aspect/price, focus, Back/Forward, deep links, 320–1440px, enlarged layout, missing assets, no-JS fallback, modal accessibility",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
