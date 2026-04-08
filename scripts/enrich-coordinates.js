/**
 * Script para enriquecer la base de datos D1 con coordenadas geográficas.
 *
 * Lee data/MX.txt (formato GeoNames TSV), agrupa por código postal,
 * calcula el centroide (promedio lat/lng) e inserta en cp_coordenadas.
 *
 * Columnas GeoNames (separadas por TAB):
 *   0  country_code
 *   1  postal_code
 *   2  place_name
 *   3  admin_name1
 *   4  admin_code1
 *   5  admin_name2
 *   6  admin_code2
 *   7  admin_name3
 *   8  admin_code3
 *   9  latitude
 *   10 longitude
 *   11 accuracy
 *
 * Uso:
 *   node scripts/enrich-coordinates.js            (local)
 *   node scripts/enrich-coordinates.js --remote   (producción)
 */

'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isRemote = process.argv.includes('--remote');
const remoteFlag = isRemote ? '--remote' : '--local';

const DATA_FILE = path.join(__dirname, '..', 'data', 'MX.txt');
const TMP_DIR = path.join(__dirname, '..', '.tmp-sql');
const BATCH_SIZE = 50;

// GeoNames TSV column indices
const COL_POSTAL_CODE = 1;
const COL_LATITUDE = 9;
const COL_LONGITUDE = 10;

if (!fs.existsSync(DATA_FILE)) {
  console.error(`No se encontró el archivo: ${DATA_FILE}`);
  console.error('Ejecutá primero: npm run geo:download');
  process.exit(1);
}

// --- Leer y parsear MX.txt ---

console.log(`Leyendo ${DATA_FILE}...`);
const content = fs.readFileSync(DATA_FILE, 'utf-8');
const lines = content.split('\n').filter(l => l.trim());

// Agrupar lat/lng por código postal para calcular centroide
const cpMap = new Map(); // cp -> { latSum, lngSum, count }

let skipped = 0;

for (const line of lines) {
  const parts = line.split('\t');
  if (parts.length < 11) { skipped++; continue; }

  const cp = (parts[COL_POSTAL_CODE] || '').trim();
  const lat = parseFloat(parts[COL_LATITUDE]);
  const lng = parseFloat(parts[COL_LONGITUDE]);

  if (!cp || isNaN(lat) || isNaN(lng)) { skipped++; continue; }

  if (cpMap.has(cp)) {
    const entry = cpMap.get(cp);
    entry.latSum += lat;
    entry.lngSum += lng;
    entry.count += 1;
  } else {
    cpMap.set(cp, { latSum: lat, lngSum: lng, count: 1 });
  }
}

console.log(`CPs únicos encontrados en GeoNames: ${cpMap.size}`);
if (skipped > 0) console.log(`Líneas omitidas (formato incorrecto): ${skipped}`);

// --- Generar batches de INSERTs ---

function escapeSQL(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "''");
}

const entries = Array.from(cpMap.entries());
const batches = [];
let currentBatch = [];

for (const [cp, { latSum, lngSum, count }] of entries) {
  const lat = (latSum / count).toFixed(6);
  const lng = (lngSum / count).toFixed(6);
  const sql = `INSERT OR REPLACE INTO cp_coordenadas (codigo_postal, latitud, longitud) VALUES ('${escapeSQL(cp)}', ${lat}, ${lng});`;
  currentBatch.push(sql);

  if (currentBatch.length >= BATCH_SIZE) {
    batches.push([...currentBatch]);
    currentBatch = [];
  }
}

if (currentBatch.length > 0) {
  batches.push(currentBatch);
}

console.log(`Generando ${batches.length} batches de hasta ${BATCH_SIZE} INSERTs cada uno...`);

// --- Crear directorio temporal ---

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// --- Ejecutar INSERTs via wrangler ---

let successCount = 0;
let errorCount = 0;

for (let i = 0; i < batches.length; i++) {
  const batchFile = path.join(TMP_DIR, `coords-batch-${i}.sql`);
  fs.writeFileSync(batchFile, batches[i].join('\n'));

  try {
    execFileSync(
      'npx',
      ['wrangler', 'd1', 'execute', 'codigos-postales-db', remoteFlag, '--yes', `--file=${batchFile}`],
      { stdio: 'inherit', cwd: path.join(__dirname, '..'), shell: true }
    );
    successCount += batches[i].length;
    process.stdout.write(`\rBatch ${i + 1}/${batches.length} completado`);
  } catch (e) {
    console.error(`\nError en batch ${i}:`, e.message);
    errorCount += batches[i].length;
    console.error(`\nError en batch ${i} (${batches[i].length} sentencias, archivo: ${batchFile}):`, e.message);  }
}

// --- Limpiar archivos temporales ---

fs.rmSync(TMP_DIR, { recursive: true, force: true });

// --- Estadísticas ---

console.log('\n\n=== Estadísticas ===');
console.log(`CPs procesados desde GeoNames : ${cpMap.size}`);
console.log(`INSERTs exitosos              : ${successCount}`);
if (errorCount > 0) console.log(`INSERTs con error             : ${errorCount}`);
console.log('¡Coordenadas importadas correctamente!');
