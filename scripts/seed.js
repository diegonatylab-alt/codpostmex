/**
 * Script para importar datos de SEPOMEX a Cloudflare D1
 * 
 * Uso:
 *   node scripts/seed.js            (local)
 *   node scripts/seed.js --remote   (producción)
 * 
 * Antes de usar, descargá el archivo completo de SEPOMEX desde:
 * https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Descarga.aspx
 * 
 * Renombrá el archivo descargado a "CPdescarga.txt" y colocalo en la carpeta /data/
 * El archivo de muestra "sample-sepomex.txt" se usa si no existe el archivo completo.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isRemote = process.argv.includes('--remote');
const remoteFlag = isRemote ? '--remote' : '--local';

// Buscar archivo de datos: primero el completo, luego el de muestra
const dataDir = path.join(__dirname, '..', 'data');
const fullFile = path.join(dataDir, 'CPdescarga.txt');
const sampleFile = path.join(dataDir, 'sample-sepomex.txt');

let dataFile;
if (fs.existsSync(fullFile)) {
  dataFile = fullFile;
  console.log('Usando archivo COMPLETO de SEPOMEX: CPdescarga.txt');
} else if (fs.existsSync(sampleFile)) {
  dataFile = sampleFile;
  console.log('Usando archivo de MUESTRA: sample-sepomex.txt');
  console.log('Para datos completos, descargá CPdescarga.txt de SEPOMEX.');
} else {
  console.error('No se encontró ningún archivo de datos en /data/');
  process.exit(1);
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeSQL(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

// Leer y parsear el archivo
const content = fs.readFileSync(dataFile, 'utf-8');
const lines = content.split('\n').filter(l => l.trim());

// Saltar la primera línea (header)
const header = lines[0];
const dataLines = lines.slice(1);

console.log(`Procesando ${dataLines.length} registros...`);

// Agrupar por municipio para la tabla de municipios
const municipios = new Map();
const batchSize = 50; // SQL statements por batch
const batches = [];
let currentBatch = [];

for (const line of dataLines) {
  const parts = line.split('|');
  if (parts.length < 14) continue;

  const [
    d_codigo, d_asenta, d_tipo_asenta, D_mnpio, d_estado, d_ciudad,
    d_CP, c_estado, c_oficina, c_CP, c_tipo_asenta, c_mnpio,
    id_asenta_cpcons, d_zona
  ] = parts.map(p => p.trim());

  // Registrar municipio
  const munKey = `${c_estado}-${c_mnpio}`;
  if (!municipios.has(munKey)) {
    municipios.set(munKey, {
      clave_estado: c_estado,
      clave_municipio: c_mnpio,
      nombre: D_mnpio,
      slug: slugify(D_mnpio)
    });
  }

  // INSERT para código postal
  const sql = `INSERT INTO codigos_postales (codigo_postal, colonia, tipo_asentamiento, municipio, estado, ciudad, clave_estado, clave_municipio, zona) VALUES ('${escapeSQL(d_codigo)}', '${escapeSQL(d_asenta)}', '${escapeSQL(d_tipo_asenta)}', '${escapeSQL(D_mnpio)}', '${escapeSQL(d_estado)}', '${escapeSQL(d_ciudad)}', '${escapeSQL(c_estado)}', '${escapeSQL(c_mnpio)}', '${escapeSQL(d_zona)}');`;

  currentBatch.push(sql);

  if (currentBatch.length >= batchSize) {
    batches.push([...currentBatch]);
    currentBatch = [];
  }
}

if (currentBatch.length > 0) {
  batches.push(currentBatch);
}

// Generar INSERTs de municipios
const munInserts = [];
for (const [, mun] of municipios) {
  munInserts.push(
    `INSERT OR IGNORE INTO municipios (clave_estado, clave_municipio, nombre, slug) VALUES ('${escapeSQL(mun.clave_estado)}', '${escapeSQL(mun.clave_municipio)}', '${escapeSQL(mun.nombre)}', '${escapeSQL(mun.slug)}');`
  );
}

// Escribir archivos SQL temporales y ejecutarlos
const tmpDir = path.join(__dirname, '..', '.tmp-sql');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Primero: municipios
console.log(`Insertando ${municipios.size} municipios...`);
const munFile = path.join(tmpDir, 'municipios.sql');
fs.writeFileSync(munFile, munInserts.join('\n'));
try {
  execSync(`npx wrangler d1 execute codigos-postales-db ${remoteFlag} --file="${munFile}"`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
} catch (e) {
  console.error('Error insertando municipios:', e.message);
}

// Después: códigos postales en batches
console.log(`Insertando ${dataLines.length} códigos postales en ${batches.length} batches...`);
for (let i = 0; i < batches.length; i++) {
  const batchFile = path.join(tmpDir, `batch-${i}.sql`);
  fs.writeFileSync(batchFile, batches[i].join('\n'));
  
  try {
    execSync(`npx wrangler d1 execute codigos-postales-db ${remoteFlag} --file="${batchFile}"`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    process.stdout.write(`\rBatch ${i + 1}/${batches.length} completado`);
  } catch (e) {
    console.error(`\nError en batch ${i}:`, e.message);
  }
}

// Limpiar archivos temporales
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log('\n¡Importación completada!');
console.log(`  - ${municipios.size} municipios`);
console.log(`  - ${dataLines.length} registros de códigos postales`);
