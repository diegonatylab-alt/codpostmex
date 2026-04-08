/**
 * Script para descargar los datos de coordenadas de GeoNames para México.
 *
 * Descarga: https://download.geonames.org/export/zip/MX.zip
 * Extrae:   data/MX.txt
 *
 * Uso:
 *   node scripts/download-geonames.js
 */

'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ZIP_URL = 'https://download.geonames.org/export/zip/MX.zip';
const ZIP_PATH = path.join(DATA_DIR, 'MX.zip');
const TXT_PATH = path.join(DATA_DIR, 'MX.txt');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log('Descargando datos de GeoNames...');
console.log(`URL: ${ZIP_URL}`);

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    function request(targetUrl) {
      https.get(targetUrl, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          request(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      }).on('error', (err) => {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
    }

    request(url);
  });
}

async function main() {
  try {
    await download(ZIP_URL, ZIP_PATH);
    console.log(`Archivo descargado: ${ZIP_PATH}`);

    console.log('Extrayendo MX.txt...');
    execFileSync('unzip', ['-o', ZIP_PATH, 'MX.txt', '-d', DATA_DIR], { stdio: 'inherit' });

    if (!fs.existsSync(TXT_PATH)) {
      throw new Error('No se encontró MX.txt en el ZIP descargado.');
    }

    const stat = fs.statSync(TXT_PATH);
    console.log(`Extracción completada: ${TXT_PATH} (${(stat.size / 1024).toFixed(1)} KB)`);

    fs.unlinkSync(ZIP_PATH);
    console.log('Archivo ZIP eliminado.');
    console.log('\n¡Listo! Ahora ejecutá: npm run geo:enrich');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
