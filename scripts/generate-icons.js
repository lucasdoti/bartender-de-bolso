const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

// SVG que replica o AppIcon.js — fundo escuro arredondado + taça dourada
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
    <clipPath id="rounded">
      <rect x="0" y="0" width="512" height="512" rx="116" ry="116"/>
    </clipPath>
  </defs>

  <!-- Fundo escuro com bordas arredondadas -->
  <rect x="0" y="0" width="512" height="512" rx="116" ry="116" fill="#1C1A14"/>

  <!-- Conteúdo centralizado (escala de 110x120 → ~320x350, centrado em 512x512) -->
  <g clip-path="url(#rounded)" transform="translate(96, 81) scale(2.91)">
    <path d="M14 18 L55 70 L96 18" stroke="url(#ig)" stroke-width="2.5" stroke-linejoin="round" fill="none" stroke-linecap="round"/>
    <path d="M14 18 L55 50 L96 18 Z" fill="url(#il)" opacity="0.9"/>
    <path d="M20 20 L40 34" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="55" y1="70" x2="55" y2="100" stroke="url(#is)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M34 100 Q55 96 76 100" stroke="url(#ig)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <line x1="42" y1="10" x2="62" y2="32" stroke="#FFD966" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="42" cy="10" r="6" fill="#C84B31" stroke="#FFD966" stroke-width="1.5"/>
    <circle cx="42" cy="10" r="2" fill="#FFD966"/>
    <circle cx="88" cy="28" r="1.5" fill="#FFD966" opacity="0.7"/>
    <circle cx="20" cy="38" r="1" fill="#FFD966" opacity="0.5"/>
  </g>
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
