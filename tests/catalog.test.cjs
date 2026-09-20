const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { works, dimensions, orderText } = require('../catalog.js');

test('collection contains exactly the four approved photographs and preserves their originals', () => {
  assert.deepEqual(works.map((w) => w.id), ['rescuer-03', 'tbilisi', 'city', 'kosmaj']);
  for (const work of works) assert.ok(fs.existsSync(path.join(__dirname, '..', work.source)));
});
test('3:2 photograph fits the landscape sheet without a material border', () => {
  const d = dimensions(works[0], 'large');
  assert.equal(d.sheetWidth, 90); assert.equal(d.sheetHeight, 60);
  assert.ok(d.margin < 0.02);
});
test('4:3 photograph is preserved with borders, not cropped to the sheet', () => {
  const landscape = dimensions(works[1], 'large');
  assert.ok(Math.abs(landscape.imageWidth - 80) < 0.02);
  assert.ok(Math.abs(landscape.margin - 5) < 0.02);
  assert.equal(landscape.marginAxis, 'слева и справа');
  const portrait = dimensions(works[3], 'small');
  assert.ok(Math.abs(portrait.imageHeight - 53.3333) < 0.01);
  assert.ok(Math.abs(portrait.margin - 3.3333) < 0.01);
  assert.equal(portrait.marginAxis, 'сверху и снизу');
});
test('all eight variants retain aspect ratio and fit the paper', () => {
  for (const work of works) for (const size of ['small', 'large']) {
    const d = dimensions(work, size);
    assert.ok(d.imageWidth <= d.sheetWidth + 1e-9);
    assert.ok(d.imageHeight <= d.sheetHeight + 1e-9);
    assert.ok(Math.abs(d.imageWidth / d.imageHeight - work.width / work.height) < 1e-9);
  }
});
test('order contains the work, current size, tentative price and no frame', () => {
  const message = orderText(works[2], 'large', 'https://example.test/#work/city');
  assert.match(message, /«Сити в тумане»/);
  assert.match(message, /Лист: 60 × 90 см/);
  assert.match(message, /9\s900 ₽/);
  assert.match(message, /без рамы и паспарту/);
  assert.match(message, /доставка отдельно/);
  assert.match(message, /https:\/\/example.test\/#work\/city/);
});
test('public code has no exposed bot token or legacy direct API integration', () => {
  for (const filename of ['index.html', 'catalog.js', 'script.js']) {
    const source = fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');
    assert.doesNotMatch(source, /\d{8,}:[A-Za-z0-9_-]{25,}/);
    assert.doesNotMatch(source, /api\.telegram\.org|sendLeadToTelegram|images\.unsplash\.com/);
  }
});
