// Generate delivery copies only. Original photographs are never overwritten.
const sharp = require('sharp');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');
const { works } = require('../catalog.js');
const root = path.resolve(__dirname, '..');

async function main() {
  const output = path.join(root, 'assets/web');
  await mkdir(output, { recursive: true });
  for (const work of works) {
    for (const width of [800, 1280, 2000]) {
      const info = await sharp(path.join(root, work.source))
        .autoOrient().resize({ width, withoutEnlargement: true })
        .toColourspace('srgb').jpeg({ quality: 87, mozjpeg: true })
        .toFile(path.join(output, `${work.id}-${width}.jpg`));
      console.log(`${work.id}-${width}.jpg: ${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB`);
    }
  }
  await sharp(path.join(root, 'assets/avatar.jpg')).autoOrient()
    .resize({ width: 480, height: 480, fit: 'cover', position: 'attention' })
    .toColourspace('srgb').jpeg({ quality: 87, mozjpeg: true })
    .toFile(path.join(output, 'author.jpg'));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
