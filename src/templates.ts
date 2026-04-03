// Templates HTML con SEO optimizado y AdSense
import { SITE_NAME, SITE_URL, ADSENSE_ID } from './config';

// ============================================================
// Layout base
// ============================================================
function layout(opts: {
  title: string;
  description: string;
  canonical: string;
  breadcrumbs?: { name: string; url: string }[];
  body: string;
  structuredData?: object;
}): string {
  const breadcrumbsLD = opts.breadcrumbs
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: opts.breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: `${SITE_URL}${b.url}`,
        })),
      })
    : '';

  const structuredDataTag = opts.structuredData
    ? `<script type="application/ld+json">${JSON.stringify(opts.structuredData)}</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(opts.title)}</title>
  <meta name="description" content="${escapeHtml(opts.description)}">
  <link rel="canonical" href="${SITE_URL}${opts.canonical}">
  <meta property="og:title" content="${escapeHtml(opts.title)}">
  <meta property="og:description" content="${escapeHtml(opts.description)}">
  <meta property="og:url" content="${SITE_URL}${opts.canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta name="robots" content="index, follow">
  ${breadcrumbsLD ? `<script type="application/ld+json">${breadcrumbsLD}</script>` : ''}
  ${structuredDataTag}
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;background:#f8f9fa;color:#212529;line-height:1.6}
    .container{max-width:960px;margin:0 auto;padding:0 16px}
    header{background:#1a73e8;color:#fff;padding:12px 0;box-shadow:0 2px 4px rgba(0,0,0,.1)}
    header a{color:#fff;text-decoration:none}
    header h1{font-size:1.3rem}
    .breadcrumbs{padding:10px 0;font-size:.85rem;color:#5f6368}
    .breadcrumbs a{color:#1a73e8;text-decoration:none}
    .breadcrumbs a:hover{text-decoration:underline}
    main{padding:20px 0}
    .card{background:#fff;border-radius:8px;padding:20px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    h2{color:#202124;margin-bottom:12px;font-size:1.4rem}
    h3{color:#1a73e8;margin-bottom:8px}
    .search-box{width:100%;padding:12px 16px;font-size:1.1rem;border:2px solid #dadce0;border-radius:24px;outline:none;margin-bottom:16px}
    .search-box:focus{border-color:#1a73e8;box-shadow:0 0 0 3px rgba(26,115,232,.15)}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
    .grid a{display:block;padding:12px;background:#fff;border:1px solid #e8eaed;border-radius:8px;text-decoration:none;color:#202124;transition:box-shadow .2s}
    .grid a:hover{box-shadow:0 2px 8px rgba(0,0,0,.12);border-color:#1a73e8}
    table{width:100%;border-collapse:collapse;margin:12px 0}
    th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #e8eaed}
    th{background:#f1f3f4;font-weight:600;color:#5f6368;font-size:.85rem;text-transform:uppercase}
    tr:hover td{background:#f8f9fa}
    .tag{display:inline-block;padding:2px 8px;background:#e8f0fe;color:#1967d2;border-radius:12px;font-size:.8rem;margin:2px}
    .ad-slot{background:#f1f3f4;border:1px dashed #dadce0;padding:20px;text-align:center;color:#9aa0a6;font-size:.85rem;margin:16px 0;min-height:90px;border-radius:8px}
    footer{background:#202124;color:#9aa0a6;padding:24px 0;margin-top:40px;font-size:.85rem;text-align:center}
    footer a{color:#8ab4f8}
    .cp-big{font-size:2.5rem;font-weight:700;color:#1a73e8}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
    .info-item{padding:12px;background:#f8f9fa;border-radius:8px}
    .info-label{font-size:.8rem;color:#5f6368;text-transform:uppercase;margin-bottom:4px}
    .info-value{font-size:1.05rem;font-weight:500}
    .nearby{margin-top:16px}
    .nearby a{display:inline-block;margin:4px;padding:6px 14px;background:#e8f0fe;color:#1967d2;border-radius:16px;text-decoration:none;font-size:.9rem}
    .nearby a:hover{background:#d2e3fc}
    @media(max-width:600px){.info-grid{grid-template-columns:1fr}.grid{grid-template-columns:1fr 1fr}}
  </style>
  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}" crossorigin="anonymous"></script>
</head>
<body>
  <header>
    <div class="container">
      <h1><a href="/">📮 ${SITE_NAME}</a></h1>
    </div>
  </header>
  ${
    opts.breadcrumbs
      ? `<div class="container"><nav class="breadcrumbs">${opts.breadcrumbs
          .map(
            (b, i) =>
              i < opts.breadcrumbs!.length - 1
                ? `<a href="${b.url}">${escapeHtml(b.name)}</a> › `
                : `<span>${escapeHtml(b.name)}</span>`
          )
          .join('')}</nav></div>`
      : ''
  }
  <main class="container">
    ${opts.body}
  </main>
  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} Buscar CP México — Consulta de códigos postales en línea</p>
      <p style="margin-top:8px">
        <a href="/estados">Estados</a> · 
        <a href="/aviso-legal">Aviso Legal</a> · 
        <a href="/sitemap-index.xml">Sitemap</a>
      </p>
    </div>
  </footer>
</body>
</html>`;
}

// ============================================================
// Ad Slot
// ============================================================
function adSlot(slot: string = 'auto'): string {
  return `<div class="ad-slot">
  <ins class="adsbygoogle"
    style="display:block"
    data-ad-client="${ADSENSE_ID}"
    data-ad-slot="${slot}"
    data-ad-format="auto"
    data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>`;
}

// ============================================================
// Home Page
// ============================================================
export function homePage(estados: { nombre: string; slug: string; count: number }[]): string {
  const estadosGrid = estados
    .map(
      e =>
        `<a href="/estado/${e.slug}"><strong>${escapeHtml(e.nombre)}</strong><br><small>${e.count.toLocaleString('es-MX')} códigos</small></a>`
    )
    .join('');

  return layout({
    title: `Códigos Postales de México | Consulta Rápida`,
    description:
      'Busca códigos postales de México rápidamente. Consulta por CP, colonia, municipio o estado. Base de datos completa y actualizada.',
    canonical: '/',
    body: `
      <div class="card">
        <h2>🔍 Buscar Código Postal</h2>
        <input type="text" class="search-box" id="search" placeholder="Escribe un código postal, colonia o municipio..." autocomplete="off">
        <div id="results"></div>
      </div>
      ${adSlot('home-top')}
      <div class="card">
        <h2>📍 Códigos Postales por Estado</h2>
        <div class="grid">${estadosGrid}</div>
      </div>
      ${adSlot('home-bottom')}
      <div class="card">
        <h2>¿Qué es un código postal?</h2>
        <p>El código postal (CP) es un número de 5 dígitos asignado por el Servicio Postal Mexicano (SEPOMEX) 
        para identificar cada zona de entrega de correspondencia en México. Cada código postal puede incluir 
        una o más colonias dentro de un municipio.</p>
      </div>
      <script>
        const searchInput = document.getElementById('search');
        const resultsDiv = document.getElementById('results');
        let timeout;
        searchInput.addEventListener('input', function() {
          clearTimeout(timeout);
          const q = this.value.trim();
          if (q.length < 2) { resultsDiv.innerHTML = ''; return; }
          timeout = setTimeout(async () => {
            const res = await fetch('/api/buscar?q=' + encodeURIComponent(q));
            const data = await res.json();
            if (data.results.length === 0) {
              resultsDiv.innerHTML = '<p style="color:#5f6368;padding:8px">No se encontraron resultados.</p>';
              return;
            }
            resultsDiv.innerHTML = '<table><tr><th>CP</th><th>Colonia</th><th>Municipio</th><th>Estado</th></tr>' +
              data.results.map(r => 
                '<tr><td><a href="/codigo-postal/' + r.codigo_postal + '">' + r.codigo_postal + '</a></td><td>' + 
                r.colonia + '</td><td>' + r.municipio + '</td><td>' + r.estado + '</td></tr>'
              ).join('') + '</table>';
          }, 300);
        });
      </script>`,
  });
}

// ============================================================
// Estado Page
// ============================================================
export function estadoPage(
  estado: { nombre: string; slug: string },
  municipios: { nombre: string; slug: string; count: number }[]
): string {
  const munGrid = municipios
    .map(
      m =>
        `<a href="/estado/${estado.slug}/${m.slug}"><strong>${escapeHtml(m.nombre)}</strong><br><small>${m.count.toLocaleString('es-MX')} códigos</small></a>`
    )
    .join('');

  return layout({
    title: `Códigos Postales de ${estado.nombre} - Municipios | ${SITE_NAME}`,
    description: `Consulta todos los códigos postales del estado de ${estado.nombre}, México. Lista de municipios con sus códigos postales y colonias.`,
    canonical: `/estado/${estado.slug}`,
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: 'Estados', url: '/estados' },
      { name: estado.nombre, url: `/estado/${estado.slug}` },
    ],
    body: `
      <div class="card">
        <h2>Códigos Postales de ${escapeHtml(estado.nombre)}</h2>
        <p>Encuentra los códigos postales de todos los municipios del estado de ${escapeHtml(estado.nombre)}. 
        Selecciona un municipio para ver sus colonias y códigos postales.</p>
      </div>
      ${adSlot('estado-top')}
      <div class="card">
        <h2>Municipios de ${escapeHtml(estado.nombre)}</h2>
        <div class="grid">${munGrid}</div>
      </div>
      ${adSlot('estado-bottom')}`,
  });
}

// ============================================================
// Municipio Page
// ============================================================
export function municipioPage(
  estado: { nombre: string; slug: string },
  municipio: { nombre: string; slug: string },
  codigos: { codigo_postal: string; colonia: string; tipo_asentamiento: string; zona: string }[]
): string {
  // Agrupar por código postal
  const rows = codigos
    .map(
      c =>
        `<tr>
          <td><a href="/codigo-postal/${c.codigo_postal}">${c.codigo_postal}</a></td>
          <td>${escapeHtml(c.colonia)}</td>
          <td><span class="tag">${escapeHtml(c.tipo_asentamiento)}</span></td>
          <td>${escapeHtml(c.zona || '')}</td>
        </tr>`
    )
    .join('');

  const uniqueCPs = [...new Set(codigos.map(c => c.codigo_postal))];

  return layout({
    title: `Códigos Postales de ${municipio.nombre}, ${estado.nombre} | ${SITE_NAME}`,
    description: `Lista completa de ${uniqueCPs.length} códigos postales y ${codigos.length} colonias en ${municipio.nombre}, ${estado.nombre}. Consulta tipo de asentamiento y zona.`,
    canonical: `/estado/${estado.slug}/${municipio.slug}`,
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: estado.nombre, url: `/estado/${estado.slug}` },
      { name: municipio.nombre, url: `/estado/${estado.slug}/${municipio.slug}` },
    ],
    body: `
      <div class="card">
        <h2>Códigos Postales de ${escapeHtml(municipio.nombre)}, ${escapeHtml(estado.nombre)}</h2>
        <p>${uniqueCPs.length} códigos postales y ${codigos.length} colonias encontradas en ${escapeHtml(municipio.nombre)}.</p>
      </div>
      ${adSlot('municipio-top')}
      <div class="card">
        <table>
          <thead><tr><th>CP</th><th>Colonia</th><th>Tipo</th><th>Zona</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${adSlot('municipio-bottom')}`,
  });
}

// ============================================================
// Código Postal individual
// ============================================================
export function codigoPostalPage(
  cp: string,
  colonias: { colonia: string; tipo_asentamiento: string; municipio: string; estado: string; ciudad: string; zona: string; clave_estado: string }[],
  nearby: string[],
  estadoSlug: string,
  municipioSlug: string
): string {
  const first = colonias[0];
  const coloniasRows = colonias
    .map(
      c =>
        `<tr>
          <td>${escapeHtml(c.colonia)}</td>
          <td><span class="tag">${escapeHtml(c.tipo_asentamiento)}</span></td>
          <td>${escapeHtml(c.zona || '')}</td>
        </tr>`
    )
    .join('');

  const nearbyLinks = nearby
    .map(n => `<a href="/codigo-postal/${n}">${n}</a>`)
    .join('');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `Código Postal ${cp}`,
    address: {
      '@type': 'PostalAddress',
      postalCode: cp,
      addressLocality: first.municipio,
      addressRegion: first.estado,
      addressCountry: 'MX',
    },
  };

  return layout({
    title: `Código Postal ${cp} - ${first.municipio}, ${first.estado} | ${SITE_NAME}`,
    description: `El código postal ${cp} pertenece a ${first.municipio}, ${first.estado}. Incluye ${colonias.length} colonia(s): ${colonias.slice(0, 3).map(c => c.colonia).join(', ')}${colonias.length > 3 ? ' y más' : ''}.`,
    canonical: `/codigo-postal/${cp}`,
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: first.estado, url: `/estado/${estadoSlug}` },
      { name: first.municipio, url: `/estado/${estadoSlug}/${municipioSlug}` },
      { name: `CP ${cp}`, url: `/codigo-postal/${cp}` },
    ],
    structuredData,
    body: `
      <div class="card">
        <div class="cp-big">${cp}</div>
        <h2>Código Postal ${cp}</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Estado</div>
            <div class="info-value"><a href="/estado/${estadoSlug}">${escapeHtml(first.estado)}</a></div>
          </div>
          <div class="info-item">
            <div class="info-label">Municipio</div>
            <div class="info-value"><a href="/estado/${estadoSlug}/${municipioSlug}">${escapeHtml(first.municipio)}</a></div>
          </div>
          <div class="info-item">
            <div class="info-label">Ciudad</div>
            <div class="info-value">${escapeHtml(first.ciudad || first.municipio)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Colonias</div>
            <div class="info-value">${colonias.length}</div>
          </div>
        </div>
      </div>
      ${adSlot('cp-top')}
      <div class="card">
        <h3>Colonias en el código postal ${cp}</h3>
        <table>
          <thead><tr><th>Colonia</th><th>Tipo</th><th>Zona</th></tr></thead>
          <tbody>${coloniasRows}</tbody>
        </table>
      </div>
      ${adSlot('cp-middle')}
      ${
        nearby.length > 0
          ? `<div class="card nearby">
              <h3>Códigos Postales Cercanos</h3>
              ${nearbyLinks}
            </div>`
          : ''
      }
      ${adSlot('cp-bottom')}
      <div class="card">
        <h3>¿Dónde queda el código postal ${cp}?</h3>
        <p>El código postal ${cp} se encuentra en el municipio de <strong>${escapeHtml(first.municipio)}</strong>, 
        en el estado de <strong>${escapeHtml(first.estado)}</strong>, México. 
        Este código postal incluye ${colonias.length} colonia(s) y pertenece a la zona ${escapeHtml((first.zona || 'urbana').toLowerCase())}.</p>
      </div>`,
  });
}

// ============================================================
// Lista de estados
// ============================================================
export function estadosListPage(estados: { nombre: string; slug: string; count: number }[]): string {
  const rows = estados
    .map(
      e =>
        `<tr><td><a href="/estado/${e.slug}">${escapeHtml(e.nombre)}</a></td><td>${e.count.toLocaleString('es-MX')}</td></tr>`
    )
    .join('');

  return layout({
    title: `Códigos Postales por Estado - México | ${SITE_NAME}`,
    description: 'Lista de todos los 32 estados de México con sus códigos postales. Selecciona un estado para consultar municipios, colonias y códigos postales.',
    canonical: '/estados',
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: 'Estados', url: '/estados' },
    ],
    body: `
      <div class="card">
        <h2>Códigos Postales por Estado</h2>
        <p>México tiene 32 entidades federativas. Selecciona un estado para consultar sus códigos postales.</p>
      </div>
      ${adSlot('estados-top')}
      <div class="card">
        <table>
          <thead><tr><th>Estado</th><th>Códigos Postales</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${adSlot('estados-bottom')}`,
  });
}

// ============================================================
// 404
// ============================================================
export function notFoundPage(): string {
  return layout({
    title: `Página no encontrada | ${SITE_NAME}`,
    description: 'La página que buscas no existe.',
    canonical: '/404',
    body: `
      <div class="card" style="text-align:center;padding:40px">
        <h2>404 - Página no encontrada</h2>
        <p style="margin:16px 0">El código postal o la página que buscas no existe.</p>
        <a href="/" style="color:#1a73e8">← Volver al inicio</a>
      </div>`,
  });
}

// ============================================================
// Aviso Legal
// ============================================================
export function avisoLegalPage(): string {
  return layout({
    title: `Aviso Legal | ${SITE_NAME}`,
    description: 'Aviso legal y términos de uso del sitio.',
    canonical: '/aviso-legal',
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: 'Aviso Legal', url: '/aviso-legal' },
    ],
    body: `
      <div class="card">
        <h2>Aviso Legal</h2>
        <p>La información de códigos postales proporcionada en este sitio proviene de fuentes públicas 
        del Servicio Postal Mexicano (SEPOMEX). Aunque nos esforzamos por mantener la información 
        actualizada y precisa, no garantizamos su exactitud completa.</p>
        <p style="margin-top:12px">Para confirmar un código postal de forma oficial, consulta el 
        <a href="https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/Descarga.aspx" 
        rel="nofollow noopener" target="_blank">sitio oficial de SEPOMEX</a>.</p>
        <h3 style="margin-top:20px">Publicidad</h3>
        <p>Este sitio utiliza Google AdSense para mostrar anuncios. Google puede usar cookies para 
        personalizar los anuncios según tus intereses.</p>
      </div>`,
  });
}

// HTML escape helper
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
