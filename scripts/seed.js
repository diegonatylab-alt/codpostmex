/**
 * Script para importar datos de SEPOMEX a Cloudflare D1
 * 
 * Soporta dos formatos:
 *   - CSV: idEstado,estado,idMunicipio,municipio,ciudad,zona,cp,asentamiento,tipo
 *   - Pipe: d_codigo|d_asenta|d_tipo_asenta|D_mnpio|d_estado|d_ciudad|...
 * 
 * Uso:
 *   node scripts/seed.js            (local)
 *   node scripts/seed.js --remote   (producción)
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
  console.log('Usando archivo COMPLETO: CPdescarga.txt');
} else if (fs.existsSync(sampleFile)) {
  dataFile = sampleFile;
  console.log('Usando archivo de MUESTRA: sample-sepomex.txt');
  console.log('Para datos completos, colocá CPdescarga.txt en /data/');
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

/**
 * Parsear una línea CSV respetando comillas
 * "valor con,coma",otro → ['valor con,coma', 'otro']
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// Leer y parsear el archivo
const content = fs.readFileSync(dataFile, 'utf-8');
const lines = content.split('\n').filter(l => l.trim());

// Detectar formato: CSV (comas) o Pipe (|)
const header = lines[0];
const isCSV = header.includes('idEstado') || (!header.includes('|') && header.includes(','));
const isPipe = header.includes('|');

console.log(`Formato detectado: ${isCSV ? 'CSV' : isPipe ? 'Pipe (SEPOMEX original)' : 'Desconocido'}`);

const dataLines = lines.slice(1);
console.log(`Procesando ${dataLines.length} registros...`);

// Pad para clave_estado (ej: 1 → "01", 9 → "09")
function padEstado(id) {
  return String(id).padStart(2, '0');
}
function padMunicipio(id) {
  return String(id).padStart(3, '0');
}

// Agrupar por municipio para la tabla de municipios
const municipios = new Map();
const batchSize = 50;
const batches = [];
let currentBatch = [];
let skipped = 0;

for (const line of dataLines) {
  let codigo_postal, colonia, tipo_asentamiento, municipio_nombre, estado_nombre, ciudad, clave_estado, clave_municipio, zona;

  if (isCSV) {
    // Formato CSV: idEstado,estado,idMunicipio,municipio,ciudad,zona,cp,asentamiento,tipo
    const parts = parseCSVLine(line);
    if (parts.length < 9) { skipped++; continue; }

    const [idEstado, estado, idMunicipio, municipio, ciudadVal, zonaVal, cp, asentamiento, tipo] = parts;

    if (!cp || !asentamiento) { skipped++; continue; }

    codigo_postal = cp.trim();
    colonia = asentamiento.trim();
    tipo_asentamiento = (tipo || '').trim();
    municipio_nombre = (municipio || '').trim();
    estado_nombre = (estado || '').trim();
    ciudad = (ciudadVal || '').trim();
    clave_estado = padEstado(idEstado);
    clave_municipio = padMunicipio(idMunicipio);
    zona = (zonaVal || '').trim();
  } else if (isPipe) {
    // Formato Pipe original de SEPOMEX
    const parts = line.split('|');
    if (parts.length < 14) { skipped++; continue; }

    const [d_codigo, d_asenta, d_tipo_asenta, D_mnpio, d_estado, d_ciudad,
      d_CP, c_estado, c_oficina, c_CP, c_tipo_asenta, c_mnpio,
      id_asenta_cpcons, d_zona] = parts.map(p => p.trim());

    codigo_postal = d_codigo;
    colonia = d_asenta;
    tipo_asentamiento = d_tipo_asenta;
    municipio_nombre = D_mnpio;
    estado_nombre = d_estado;
    ciudad = d_ciudad;
    clave_estado = c_estado;
    clave_municipio = c_mnpio;
    zona = d_zona;
  } else {
    skipped++;
    continue;
  }

  // Registrar municipio
  const munKey = `${clave_estado}-${clave_municipio}`;
  if (!municipios.has(munKey)) {
    municipios.set(munKey, {
      clave_estado,
      clave_municipio,
      nombre: municipio_nombre,
      slug: slugify(municipio_nombre)
    });
  }

  // INSERT para código postal
  const sql = `INSERT INTO codigos_postales (codigo_postal, colonia, tipo_asentamiento, municipio, estado, ciudad, clave_estado, clave_municipio, zona) VALUES ('${escapeSQL(codigo_postal)}', '${escapeSQL(colonia)}', '${escapeSQL(tipo_asentamiento)}', '${escapeSQL(municipio_nombre)}', '${escapeSQL(estado_nombre)}', '${escapeSQL(ciudad)}', '${escapeSQL(clave_estado)}', '${escapeSQL(clave_municipio)}', '${escapeSQL(zona)}');`;

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
  execSync(`npx wrangler d1 execute codigos-postales-db ${remoteFlag} --yes --file="${munFile}"`, {
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
    execSync(`npx wrangler d1 execute codigos-postales-db ${remoteFlag} --yes --file="${batchFile}"`, {
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
console.log(`  - ${dataLines.length - skipped} registros de códigos postales importados`);
if (skipped > 0) console.log(`  - ${skipped} líneas omitidas (formato incorrecto o vacías)`);
