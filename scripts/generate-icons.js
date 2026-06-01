const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

// Ícone desenhado diretamente em 512×512 — sem transforms aninhados
// Taça de martini dourada com cereja, centralizada e com padding seguro
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFD966"/>
      <stop offset="100%" stop-color="#B8860B"/>
    </linearGradient>
    <linearGradient id="il" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#C84B31"/>
      <stop offset="100%" stop-color="#7B1F0A"/>
    </linearGradient>
    <linearGradient id="is" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#B8860B"/>
      <stop offset="50%" stop-color="#FFD966"/>
      <stop offset="100%" stop-color="#B8860B"/>
    </linearGradient>
  </defs>

  <!-- Fundo escuro arredondado -->
  <rect x="0" y="0" width="512" height="512" rx="116" ry="116" fill="#1C1A14"/>

  <!-- Boca da taça: de (96,130) ao vértice (256,340) até (416,130) -->
  <path d="M96 130 L256 340 L416 130"
        stroke="url(#ig)" stroke-width="10" stroke-linejoin="round"
        fill="none" stroke-linecap="round"/>

  <!-- Preenchimento interno (líquido) -->
  <path d="M96 130 L256 310 L416 130 Z"
        fill="url(#il)" opacity="0.9"/>

  <!-- Reflexo de luz no líquido -->
  <path d="M110 138 L170 175"
        stroke="rgba(255,255,255,0.18)" stroke-width="6" stroke-linecap="round"/>

  <!-- Haste da taça -->
  <line x1="256" y1="340" x2="256" y2="415"
        stroke="url(#is)" stroke-width="10" stroke-linecap="round"/>

  <!-- Base da taça -->
  <path d="M186 422 Q256 414 326 422"
        stroke="url(#ig)" stroke-width="10" stroke-linecap="round" fill="none"/>

  <!-- Palito da cereja -->
  <line x1="196" y1="96" x2="240" y2="158"
        stroke="#FFD966" stroke-width="6" stroke-linecap="round"/>

  <!-- Cereja -->
  <circle cx="186" cy="84" r="24" fill="#C84B31" stroke="#FFD966" stroke-width="6"/>
  <circle cx="186" cy="84" r="9"  fill="#FFD966"/>

  <!-- Pontos decorativos de brilho -->
  <circle cx="360" cy="152" r="5" fill="#FFD966" opacity="0.6"/>
  <circle cx="112" cy="192" r="4" fill="#FFD966" opacity="0.4"/>
</svg>
`;

const assetsDir = path.join(__dirname, '..', 'assets');
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

const svgBuf = Buffer.from(iconSvg);

async function gen(buf, size, outPath) {
  await sharp(buf).resize(size, size).png().toFile(outPath);
  console.log(`✓ ${path.basename(outPath)} (${size}x${size})`);
}

(async () => {
  // Ícones para PWA manifest (public/)
  await gen(svgBuf, 192, path.join(publicDir, 'icon-192.png'));
  await gen(svgBuf, 512, path.join(publicDir, 'icon-512.png'));

  // Apple Touch Icon (public/)
  await gen(svgBuf, 180, path.join(publicDir, 'apple-touch-icon.png'));

  // Favicon (public/ e assets/)
  await gen(svgBuf, 32,  path.join(publicDir, 'favicon-32.png'));
  await gen(svgBuf, 512, path.join(assetsDir,  'icon.png'));
  await gen(svgBuf, 512, path.join(assetsDir,  'adaptive-icon.png'));
  await gen(svgBuf, 512, path.join(assetsDir,  'splash-icon.png'));
  await gen(svgBuf, 32,  path.join(assetsDir,  'favicon.png'));

  console.log('\nÍcones gerados com sucesso!');
})();
