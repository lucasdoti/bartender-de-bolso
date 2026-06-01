// Injeta meta tags de PWA no dist/index.html gerado pelo expo export
const fs   = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const pwaHead = `
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Bartender" />
  <meta name="theme-color" content="#1C1A14" />
  <meta name="mobile-web-app-capable" content="yes" />
`;

html = html.replace('</head>', pwaHead + '</head>');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✓ PWA meta tags injetados em dist/index.html');
