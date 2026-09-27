/**
 * Копіює воркер pdf.js у public/, звідки його віддає web-сервер Expo.
 * Запускається автоматично після `npm install` (postinstall).
 * Версія воркера завжди збігається з версією pdfjs-dist, яку використовує react-pdf.
 */
const fs = require('node:fs');
const path = require('node:path');

const reactPdfDir = path.dirname(require.resolve('react-pdf/package.json'));
const workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs', { paths: [reactPdfDir] });
const publicDir = path.join(__dirname, '..', 'public');

fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(workerSrc, path.join(publicDir, 'pdf.worker.min.mjs'));

console.log('pdf.js worker → public/pdf.worker.min.mjs');
