const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const bodySvgPath = path.join(rootDir, 'public', 'kibo', 'kibo_body.svg');
  const eyesSvgPath = path.join(rootDir, 'public', 'kibo', 'kibo_eyes.svg');

  const bodySvg = fs.readFileSync(bodySvgPath, 'utf8');
  const eyesSvg = fs.readFileSync(eyesSvgPath, 'utf8');

  const bodyMatch = bodySvg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  const eyesMatch = eyesSvg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);

  if (!bodyMatch || !eyesMatch) {
    throw new Error('Could not find base64 PNG data in body or eyes SVG');
  }

  const bodyBuf = Buffer.from(bodyMatch[1], 'base64');
  const eyesBuf = Buffer.from(eyesMatch[1], 'base64');

  // 1. Generate composite PNG (body + eyes)
  const kiboPngPath = path.join(rootDir, 'public', 'kibo', 'kibo.png');
  const info = await sharp(bodyBuf)
    .composite([{ input: eyesBuf, top: 0, left: 0 }])
    .png()
    .toFile(kiboPngPath);

  console.log('Successfully created composite kibo.png:', info);

  // 2. Generate combined SVG (body + eyes in one SVG)
  const kiboSvgPath = path.join(rootDir, 'public', 'kibo', 'kibo.svg');
  const combinedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1536" viewBox="0 0 1536 1536">
  <image width="1536" height="1536" href="data:image/png;base64,${bodyMatch[1]}"/>
  <image width="1536" height="1536" href="data:image/png;base64,${eyesMatch[1]}"/>
</svg>\n`;

  fs.writeFileSync(kiboSvgPath, combinedSvg, 'utf8');
  console.log('Successfully created combined kibo.svg');
}

main().catch(err => {
  console.error('Error generating kibo assets:', err);
  process.exit(1);
});
