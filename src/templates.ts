// Templates HTML con SEO optimizado y AdSense
import { SITE_NAME, SITE_URL, ADSENSE_ID, slugify } from './config';

const ADSENSE_ENABLED = ADSENSE_ID !== 'ca-pub-XXXXXXXXXX';

// ============================================================
// Layout base
// ============================================================
function layout(opts: {
  title: string;
  description: string;
  canonical: string;
  breadcrumbs?: { name: string; url: string }[];
  body: string;
  structuredData?: object | object[];
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
    ? (Array.isArray(opts.structuredData)
        ? opts.structuredData.map(sd => `<script type="application/ld+json">${JSON.stringify(sd)}</script>`).join('\n  ')
        : `<script type="application/ld+json">${JSON.stringify(opts.structuredData)}</script>`)
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>${escapeHtml(opts.title)}</title>
  <meta name="description" content="${escapeHtml(opts.description)}">
  <link rel="canonical" href="${SITE_URL}${opts.canonical}">
  <link rel="alternate" hreflang="es-MX" href="${SITE_URL}${opts.canonical}">
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}${opts.canonical}">
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
    header{background:#006847;color:#fff;padding:12px 0;box-shadow:0 2px 4px rgba(0,0,0,.1)}
    header a{color:#fff;text-decoration:none}
    header h1{font-size:1.3rem}
    .breadcrumbs{padding:10px 0;font-size:.85rem;color:#4a4a4a}
    .breadcrumbs a{color:#006847;text-decoration:none}
    .breadcrumbs a:hover{text-decoration:underline}
    main{padding:20px 0}
    .card{background:#fff;border-radius:8px;padding:20px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    h2{color:#202124;margin-bottom:12px;font-size:1.4rem}
    h3{color:#006847;margin-bottom:8px}
    .search-box{width:100%;padding:12px 16px;font-size:1.1rem;border:2px solid #dadce0;border-radius:24px;outline:none;margin-bottom:16px}
    .search-box:focus{border-color:#006847;box-shadow:0 0 0 3px rgba(0,104,71,.15)}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
    .grid a{display:block;padding:12px;background:#fff;border:1px solid #e8eaed;border-radius:8px;text-decoration:none;color:#202124;transition:box-shadow .2s}
    .grid a:hover{box-shadow:0 2px 8px rgba(0,0,0,.12);border-color:#006847}
    table{width:100%;border-collapse:collapse;margin:12px 0}
    th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #e8eaed}
    th{background:#f1f3f4;font-weight:600;color:#4a4a4a;font-size:.85rem;text-transform:uppercase}
    tr:hover td{background:#f8f9fa}
    .tag{display:inline-block;padding:2px 8px;background:#e6f2ec;color:#005538;border-radius:12px;font-size:.8rem;margin:2px}
    .ad-slot{background:#f1f3f4;border:1px dashed #dadce0;padding:20px;text-align:center;color:#9aa0a6;font-size:.85rem;margin:16px 0;min-height:90px;border-radius:8px}
    .ad-slot-banner{background:#f1f3f4;border:1px dashed #dadce0;text-align:center;color:#9aa0a6;font-size:.85rem;margin:12px 0;height:90px;max-height:90px;overflow:hidden;border-radius:8px;display:flex;align-items:center;justify-content:center}
    .home-top-ad{margin-top:8px}
    footer{background:#1a1a1a;color:#9aa0a6;padding:24px 0;margin-top:40px;font-size:.85rem;text-align:center}
    footer a{color:#66bb6a}
    .cp-big{font-size:2.5rem;font-weight:700;color:#006847}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
    .info-item{padding:12px;background:#f8f9fa;border-radius:8px}
    .info-label{font-size:.8rem;color:#4a4a4a;text-transform:uppercase;margin-bottom:4px}
    .info-value{font-size:1.05rem;font-weight:500}
    .nearby{margin-top:16px}
    .nearby a{display:inline-block;margin:4px;padding:6px 14px;background:#e6f2ec;color:#005538;border-radius:16px;text-decoration:none;font-size:.9rem}
    .nearby a:hover{background:#ccdfcf}
    #cp-map{height:350px;border-radius:8px;margin-top:12px;background:#e8eaed}
    .address-box{background:#f8f9fa;border-radius:8px;padding:20px;margin:16px 0;font-family:monospace;line-height:2;color:#212529}
    .address-box--official{border:2px solid #006847}
    .address-box--example{border:1px solid #dadce0}
    .result-box{padding:16px;border-radius:8px;margin-top:8px}
    .result-box--ok{background:#e8f5e9;border:1px solid #a5d6a7}
    .result-box--ok h3{color:#2e7d32}
    .result-box--ok .info-item{background:#c8e6c9}
    .result-box--err{background:#fce4ec;border:1px solid #ef9a9a}
    .result-box--err h3{color:#c62828}
    .result-big{font-size:2rem;font-weight:700;color:#2e7d32}
    .tools-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .tools-grid a{display:block;padding:16px;background:#fff;border:1px solid #e8eaed;border-radius:8px;text-decoration:none;color:#202124;transition:box-shadow .2s}
    .tools-grid a:hover{box-shadow:0 2px 8px rgba(0,0,0,.12);border-color:#006847}
    @media(max-width:700px){.tools-grid{grid-template-columns:1fr}}
    @media(max-width:600px){
      .info-grid{grid-template-columns:1fr}
      .grid{grid-template-columns:1fr 1fr}
      .home-top-ad{display:none}
    }
    @media(prefers-color-scheme:dark){
      body{background:#1a1a1a;color:#e0e0e0}
      .card{background:#2d2d2d;box-shadow:0 1px 3px rgba(0,0,0,.3)}
      header{background:#004d35}
      .breadcrumbs{color:#b0b0b0}
      .breadcrumbs a{color:#66bb6a}
      h2{color:#e0e0e0}
      h3{color:#66bb6a}
      .search-box{background:#2d2d2d;color:#e0e0e0;border-color:#444}
      .search-box:focus{border-color:#66bb6a;box-shadow:0 0 0 3px rgba(102,187,106,.25)}
      .grid a{background:#2d2d2d;border-color:#444;color:#e0e0e0}
      .grid a:hover{box-shadow:0 2px 8px rgba(0,0,0,.3);border-color:#66bb6a}
      table th{background:#333;color:#b0b0b0}
      table td{border-bottom-color:#444}
      tr:hover td{background:#333}
      .tag{background:#1b3a2a;color:#81c784}
      .nearby a{background:#1b3a2a;color:#81c784}
      .nearby a:hover{background:#2a4d3a}
      .info-item{background:#333}
      .info-label{color:#999}
      .ad-slot{background:#2d2d2d;border-color:#444;color:#666}
      .ad-slot-banner{background:#2d2d2d;border-color:#444;color:#666}
      footer{background:#111;color:#888}
      footer a{color:#66bb6a}
      .cp-big{color:#66bb6a}
      a{color:#66bb6a}
      #cp-map{background:#333}
      .address-box{background:#1e1e1e;color:#e0e0e0}
      .address-box--official{border-color:#66bb6a}
      .address-box--example{border-color:#444}
      .result-box--ok{background:#1b3a2a;border-color:#2e7d32}
      .result-box--ok h3{color:#66bb6a}
      .result-box--ok .info-item{background:#1a3328}
      .result-box--ok .info-label{color:#81c784}
      .result-box--ok a{color:#66bb6a}
      .result-box--err{background:#3e1a1a;border-color:#c62828}
      .result-box--err h3{color:#ef9a9a}
      .result-box--err p{color:#e0e0e0}
      .result-big{color:#66bb6a}
      .tools-grid a{background:#2d2d2d;border-color:#444;color:#e0e0e0}
      .tools-grid a:hover{box-shadow:0 2px 8px rgba(0,0,0,.3);border-color:#66bb6a}
    }
  </style>
  ${
    ADSENSE_ENABLED
      ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}" crossorigin="anonymous"></script>`
      : ''
  }
</head>
<body>
  <header>
    <div class="container">
      <h1><a href="/">${SITE_NAME}</a></h1>
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
          <a href="/estados">Estados</a> |
          <a href="/codigos-postales">CP por Prefijo</a> |
          <a href="/contacto">Contacto</a> |
          <a href="/acerca-de">Acerca de</a> |
          <a href="/politica-de-privacidad">Política de Privacidad</a> |
          <a href="/formato-direccion">Formato Dirección</a> |
          <a href="/aviso-legal">Aviso Legal</a> |
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
  if (!ADSENSE_ENABLED) return '';

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

function adSlotBanner(slot: string, className: string = ''): string {
  if (!ADSENSE_ENABLED) return '';

  const classes = className ? `ad-slot-banner ${className}` : 'ad-slot-banner';

  return `<div class="${classes}">
  <ins class="adsbygoogle"
    style="display:inline-block;width:100%;height:90px"
    data-ad-client="${ADSENSE_ID}"
    data-ad-slot="${slot}"
    data-ad-format="horizontal"
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
    title: `Códigos Postales de México 2026 - Buscar CP por Colonia, Municipio o Estado`,
    description:
      'Consulta los códigos postales de México actualizados 2026. Busca por número de CP, colonia, municipio o estado. Base de datos completa con todos los códigos de SEPOMEX.',
    canonical: '/',
    body: `
      <div class="card">
        <h2>Buscar Código Postal</h2>
        <input type="text" class="search-box" id="search" placeholder="Escribe un código postal, colonia o municipio..." autocomplete="off">
        <div id="results"></div>
      </div>
      ${adSlotBanner('home-top', 'home-top-ad')}
      <div class="card">
        <h2>Códigos Postales por Estado</h2>
        <div class="grid">${estadosGrid}</div>
      </div>
      ${adSlot('home-bottom')}
      <div class="card">
        <h2>¿Qué es un código postal?</h2>
        <p>El código postal (CP) es un número de 5 dígitos asignado por el Servicio Postal Mexicano (SEPOMEX) 
        para identificar cada zona de entrega de correspondencia en México. Cada código postal puede incluir 
        una o más colonias dentro de un municipio.</p>
      </div>
      <div class="card">
        <h3>📮 ¿Cómo escribir correctamente una dirección postal?</h3>
        <p>Conoce el formato oficial de SEPOMEX, el orden correcto de los campos y ejemplos reales para que tus envíos lleguen sin problemas.</p>
        <p style="margin-top:12px"><a href="/formato-direccion" style="display:inline-block;padding:10px 20px;background:#006847;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">Ver guía de formato de dirección →</a></p>
      </div>
      <div class="card">
        <h3>🔢 Navegar códigos postales por prefijo</h3>
        <p>Los primeros 2 dígitos del CP indican la región. Explora todos los rangos de códigos postales de México.</p>
        <p style="margin-top:12px"><a href="/codigos-postales" style="display:inline-block;padding:10px 20px;background:#006847;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">Ver prefijos de CP →</a></p>
      </div>
      <div class="card">
        <h3>✅ Herramientas de códigos postales</h3>
        <div class="tools-grid">
          <a href="/validar-cp"><strong>Validar CP</strong><br><small>Verifica si un CP existe</small></a>
          <a href="/buscar-por-ubicacion"><strong>CP por Ubicación</strong><br><small>Encuentra el CP más cercano</small></a>
          <a href="/distancia"><strong>Distancia entre CPs</strong><br><small>Calcula km entre dos CPs</small></a>
        </div>
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
              resultsDiv.innerHTML = '<p style="color:#4a4a4a;padding:8px">No se encontraron resultados.</p>';
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
  municipios: { nombre: string; slug: string; count: number }[],
  stats: { totalCPs: number; cpMin: string; cpMax: string }
): string {
  const munGrid = municipios
    .map(
      m =>
        `<a href="/estado/${estado.slug}/${m.slug}"><strong>${escapeHtml(m.nombre)}</strong><br><small>${m.count.toLocaleString('es-MX')} códigos</small></a>`
    )
    .join('');

  return layout({
    title: `Códigos Postales de ${estado.nombre} 2026 - Todos los Municipios y Colonias`,
    description: `Encuentra todos los códigos postales de ${estado.nombre}, México. Lista completa de municipios, colonias y CPs actualizados 2026.`,
    canonical: `/estado/${estado.slug}`,
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: 'Estados', url: '/estados' },
      { name: estado.nombre, url: `/estado/${estado.slug}` },
    ],
    body: `
      <div class="card">
        <h2>Códigos Postales de ${escapeHtml(estado.nombre)}</h2>
        <p>El estado de ${escapeHtml(estado.nombre)} cuenta con ${municipios.length} municipios y un total de ${stats.totalCPs.toLocaleString('es-MX')} códigos postales, que van del CP ${escapeHtml(stats.cpMin)} al ${escapeHtml(stats.cpMax)}. Selecciona un municipio para consultar todas sus colonias y códigos postales.</p>
        <p style="margin-top:12px">Los códigos postales de ${escapeHtml(estado.nombre)} son asignados por el Servicio Postal Mexicano (SEPOMEX) y se utilizan para identificar zonas de entrega de correspondencia, envíos de paquetería y trámites oficiales en cada municipio del estado.</p>
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
  codigos: { codigo_postal: string; colonia: string; tipo_asentamiento: string; zona: string }[],
  stats: { totalCPs: number; urbanas: number; rurales: number; semiurbanas: number }
): string {
  // Agrupar por código postal
  const rows = codigos
    .map(
      c =>
        `<tr>
          <td><a href="/codigo-postal/${c.codigo_postal}">${c.codigo_postal}</a></td>
          <td><a href="/estado/${estado.slug}/${municipio.slug}/colonia/${slugify(c.colonia)}">${escapeHtml(c.colonia)}</a></td>
          <td><span class="tag">${escapeHtml(c.tipo_asentamiento)}</span></td>
          <td>${escapeHtml(c.zona || '')}</td>
        </tr>`
    )
    .join('');

  const uniqueCPs = [...new Set(codigos.map(c => c.codigo_postal))];

  const zonaParts: string[] = [];
  if (stats.urbanas > 0) zonaParts.push(`${stats.urbanas} son urbanas`);
  if (stats.rurales > 0) zonaParts.push(`${stats.rurales} son rurales`);
  if (stats.semiurbanas > 0) zonaParts.push(`${stats.semiurbanas} son semiurbanas`);
  const zonaDesc = zonaParts.length > 0
    ? zonaParts.slice(0, -1).join(', ') + (zonaParts.length > 1 ? ' y ' : '') + zonaParts[zonaParts.length - 1]
    : '';

  return layout({
    title: `Códigos Postales de ${municipio.nombre}, ${estado.nombre} - Colonias y CP 2026`,
    description: `${uniqueCPs.length} códigos postales y ${codigos.length} colonias en ${municipio.nombre}, ${estado.nombre}. Lista actualizada 2026 con tipo de asentamiento y zona.`,
    canonical: `/estado/${estado.slug}/${municipio.slug}`,
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: estado.nombre, url: `/estado/${estado.slug}` },
      { name: municipio.nombre, url: `/estado/${estado.slug}/${municipio.slug}` },
    ],
    body: `
      <div class="card">
        <h2>Códigos Postales de ${escapeHtml(municipio.nombre)}, ${escapeHtml(estado.nombre)}</h2>
        <p>${escapeHtml(municipio.nombre)} es un municipio del estado de ${escapeHtml(estado.nombre)} que cuenta con ${stats.totalCPs} códigos postales y ${codigos.length} colonias en total.</p>
        <p style="margin-top:8px">De las ${codigos.length} colonias, ${zonaDesc}. Consulta la tabla completa para encontrar el código postal de la colonia que buscas.</p>
      </div>
      ${adSlot('municipio-top')}
      <div class="card">
        <table>
          <thead><tr><th>CP</th><th>Colonia</th><th>Tipo</th><th>Zona</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${adSlot('municipio-bottom')}
      <div class="card">
        <h3>¿Cómo encontrar un código postal en ${escapeHtml(municipio.nombre)}?</h3>
        <p>Para encontrar el código postal de una colonia en ${escapeHtml(municipio.nombre)}, ${escapeHtml(estado.nombre)}, busca el nombre de tu colonia en la tabla anterior. Cada código postal de 5 dígitos identifica una o más colonias dentro del municipio. Si necesitas enviar correspondencia o paquetería, asegúrate de usar el código postal correcto de la colonia destino.</p>
      </div>`,
  });
}

// ============================================================
// Colonia individual
// ============================================================
export function coloniaPage(
  estado: { nombre: string; slug: string },
  municipio: { nombre: string; slug: string },
  coloniaName: string,
  coloniaSlug: string,
  entries: { codigo_postal: string; tipo_asentamiento: string; zona: string; ciudad: string }[],
  nearby: { colonia: string; codigo_postal: string }[],
  coords: { lat: number; lng: number } | null
): string {
  const first = entries[0];
  const uniqueCPs = [...new Set(entries.map(e => e.codigo_postal))];
  const cpLinks = uniqueCPs
    .map(cp => `<a href="/codigo-postal/${cp}">${cp}</a>`)
    .join('');

  const cpListText = uniqueCPs.join(', ');

  const nearbyLinks = nearby
    .reduce((acc: { colonia: string; slug: string }[], r) => {
      const s = slugify(r.colonia);
      if (!acc.find(a => a.slug === s)) acc.push({ colonia: r.colonia, slug: s });
      return acc;
    }, [])
    .map(n => `<a href="/estado/${estado.slug}/${municipio.slug}/colonia/${n.slug}">${escapeHtml(n.colonia)}</a>`)
    .join('');

  const structuredData: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: `${coloniaName}, ${municipio.nombre}, ${estado.nombre}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: municipio.nombre,
        addressRegion: estado.nombre,
        addressCountry: 'MX',
        postalCode: uniqueCPs[0],
      },
      ...(coords ? {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: coords.lat,
          longitude: coords.lng,
        },
        hasMap: `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}`,
      } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `¿Cuál es el código postal de ${coloniaName}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: uniqueCPs.length === 1
              ? `El código postal de ${coloniaName} en ${municipio.nombre}, ${estado.nombre} es ${uniqueCPs[0]}.`
              : `La colonia ${coloniaName} en ${municipio.nombre}, ${estado.nombre} tiene ${uniqueCPs.length} códigos postales: ${cpListText}.`,
          },
        },
        {
          '@type': 'Question',
          name: `¿Dónde se encuentra la colonia ${coloniaName}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `La colonia ${coloniaName} se encuentra en el municipio de ${municipio.nombre}, estado de ${estado.nombre}, México. Es una zona ${(first.zona || 'urbana').toLowerCase()}.`,
          },
        },
        {
          '@type': 'Question',
          name: `¿Qué tipo de asentamiento es ${coloniaName}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${coloniaName} es de tipo "${first.tipo_asentamiento}" y pertenece a la zona ${(first.zona || 'urbana').toLowerCase()} del municipio de ${municipio.nombre}, ${estado.nombre}.`,
          },
        },
      ],
    },
  ];

  const mapSection = coords
    ? `<div class="card">
        <h3>Mapa de ${escapeHtml(coloniaName)}</h3>
        <div id="cp-map"></div>
      </div>`
    : '';

  const mapScript = coords
    ? `<script>
(function(){
  var mapEl = document.getElementById('cp-map');
  if (!mapEl) return;
  var loaded = false;
  var observer = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting && !loaded) {
      loaded = true;
      observer.disconnect();
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      var script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = 'anonymous';
      script.onload = function() {
        var map = L.map('cp-map').setView([${coords.lat}, ${coords.lng}], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);
        L.marker([${coords.lat}, ${coords.lng}]).addTo(map)
          .bindPopup('<strong>${escapeHtml(coloniaName)}</strong>')
          .openPopup();
        L.circle([${coords.lat}, ${coords.lng}], {
          color: '#006847',
          fillColor: '#006847',
          fillOpacity: 0.1,
          radius: 400
        }).addTo(map);
      };
      document.body.appendChild(script);
    }
  }, { rootMargin: '200px' });
  observer.observe(mapEl);
})();
</script>`
    : '';

  const cpLabel = uniqueCPs.length === 1 ? 'Código Postal' : 'Códigos Postales';

  return layout({
    title: `Código Postal de ${coloniaName}, ${municipio.nombre}, ${estado.nombre} - CP ${uniqueCPs[0]}`,
    description: `El código postal de la colonia ${coloniaName} en ${municipio.nombre}, ${estado.nombre} es ${uniqueCPs.length === 1 ? uniqueCPs[0] : cpListText}. Tipo: ${first.tipo_asentamiento}. Zona: ${first.zona || 'Urbano'}.`,
    canonical: `/estado/${estado.slug}/${municipio.slug}/colonia/${coloniaSlug}`,
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: estado.nombre, url: `/estado/${estado.slug}` },
      { name: municipio.nombre, url: `/estado/${estado.slug}/${municipio.slug}` },
      { name: coloniaName, url: `/estado/${estado.slug}/${municipio.slug}/colonia/${coloniaSlug}` },
    ],
    structuredData,
    body: `
      <div class="card">
        <h2>Código Postal de ${escapeHtml(coloniaName)}</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">${cpLabel}</div>
            <div class="info-value" style="font-size:1.3rem;font-weight:700;color:#006847">${cpLinks}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Tipo de Asentamiento</div>
            <div class="info-value"><span class="tag">${escapeHtml(first.tipo_asentamiento)}</span></div>
          </div>
          <div class="info-item">
            <div class="info-label">Municipio</div>
            <div class="info-value"><a href="/estado/${estado.slug}/${municipio.slug}">${escapeHtml(municipio.nombre)}</a></div>
          </div>
          <div class="info-item">
            <div class="info-label">Estado</div>
            <div class="info-value"><a href="/estado/${estado.slug}">${escapeHtml(estado.nombre)}</a></div>
          </div>
          <div class="info-item">
            <div class="info-label">Ciudad</div>
            <div class="info-value">${escapeHtml(first.ciudad || municipio.nombre)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Zona</div>
            <div class="info-value">${escapeHtml(first.zona || 'Urbano')}</div>
          </div>
        </div>
      </div>
      ${adSlot('colonia-top')}
      ${mapSection}
      ${uniqueCPs.length > 1 ? `
      <div class="card">
        <h3>${cpLabel} de ${escapeHtml(coloniaName)}</h3>
        <p>La colonia ${escapeHtml(coloniaName)} abarca ${uniqueCPs.length} códigos postales diferentes:</p>
        <table>
          <thead><tr><th>Código Postal</th><th>Zona</th></tr></thead>
          <tbody>${entries.map(e => `<tr><td><a href="/codigo-postal/${e.codigo_postal}">${e.codigo_postal}</a></td><td>${escapeHtml(e.zona || '')}</td></tr>`).join('')}</tbody>
        </table>
      </div>` : ''}
      ${adSlot('colonia-middle')}
      ${
        nearby.length > 0
          ? `<div class="card nearby">
              <h3>Colonias Cercanas en ${escapeHtml(municipio.nombre)}</h3>
              ${nearbyLinks}
            </div>`
          : ''
      }
      ${adSlot('colonia-bottom')}
      <div class="card">
        <h3>¿Cuál es el código postal de ${escapeHtml(coloniaName)}?</h3>
        <p>${uniqueCPs.length === 1
          ? `El código postal de la colonia <strong>${escapeHtml(coloniaName)}</strong> es <strong>${uniqueCPs[0]}</strong>.`
          : `La colonia <strong>${escapeHtml(coloniaName)}</strong> tiene ${uniqueCPs.length} códigos postales: <strong>${cpListText}</strong>.`}
        Esta colonia se encuentra en el municipio de <strong>${escapeHtml(municipio.nombre)}</strong>,
        en el estado de <strong>${escapeHtml(estado.nombre)}</strong>, México.
        Es un asentamiento de tipo <strong>${escapeHtml(first.tipo_asentamiento.toLowerCase())}</strong>
        ubicado en la zona <strong>${escapeHtml((first.zona || 'urbana').toLowerCase())}</strong>.</p>
      </div>
      ${mapScript}`,
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
  municipioSlug: string,
  coords: { lat: number; lng: number } | null
): string {
  const first = colonias[0];
  const coloniasRows = colonias
    .map(
      c =>
        `<tr>
          <td><a href="/estado/${estadoSlug}/${municipioSlug}/colonia/${slugify(c.colonia)}">${escapeHtml(c.colonia)}</a></td>
          <td><span class="tag">${escapeHtml(c.tipo_asentamiento)}</span></td>
          <td>${escapeHtml(c.zona || '')}</td>
        </tr>`
    )
    .join('');

  const nearbyLinks = nearby
    .map(n => `<a href="/codigo-postal/${n}">${n}</a>`)
    .join('');

  const structuredData: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: `Código Postal ${cp} - ${first.municipio}, ${first.estado}`,
      address: {
        '@type': 'PostalAddress',
        postalCode: cp,
        addressLocality: first.municipio,
        addressRegion: first.estado,
        addressCountry: 'MX',
      },
      ...(coords ? {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: coords.lat,
          longitude: coords.lng,
        },
        hasMap: `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=15/${coords.lat}/${coords.lng}`,
      } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `¿Dónde queda el código postal ${cp}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `El código postal ${cp} se encuentra en el municipio de ${first.municipio}, estado de ${first.estado}, México. Incluye ${colonias.length} colonia(s): ${colonias.slice(0, 5).map(c => c.colonia).join(', ')}${colonias.length > 5 ? ` y ${colonias.length - 5} más` : ''}.`,
          },
        },
        {
          '@type': 'Question',
          name: `¿Qué colonias pertenecen al CP ${cp}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Las colonias del código postal ${cp} son: ${colonias.map(c => c.colonia).join(', ')}. Todas pertenecen al municipio de ${first.municipio}, ${first.estado}.`,
          },
        },
        {
          '@type': 'Question',
          name: `¿Cómo escribir una dirección con el CP ${cp}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Para escribir una dirección con el CP ${cp}: Nombre del destinatario, Calle y número, Col. ${colonias[0].colonia}, C.P. ${cp}, ${first.municipio}, ${first.estado}, México.`,
          },
        },
        {
          '@type': 'Question',
          name: `¿El CP ${cp} es zona urbana o rural?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `El código postal ${cp} pertenece a la zona ${(first.zona || 'urbana').toLowerCase()} del municipio de ${first.municipio}, ${first.estado}.`,
          },
        },
      ],
    },
  ];

  const mapSection = coords
    ? `<div class="card">
        <h3>Mapa del Código Postal ${cp}</h3>
        <div id="cp-map"></div>
      </div>`
    : '';

  const mapScript = coords
    ? `<script>
(function(){
  var mapEl = document.getElementById('cp-map');
  if (!mapEl) return;
  var loaded = false;
  var observer = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting && !loaded) {
      loaded = true;
      observer.disconnect();
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      var script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = 'anonymous';
      script.onload = function() {
        var map = L.map('cp-map').setView([${coords.lat}, ${coords.lng}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);
        L.marker([${coords.lat}, ${coords.lng}]).addTo(map)
          .bindPopup('<strong>CP ${cp}</strong>')
          .openPopup();
        L.circle([${coords.lat}, ${coords.lng}], {
          color: '#006847',
          fillColor: '#006847',
          fillOpacity: 0.1,
          radius: 500
        }).addTo(map);
      };
      document.body.appendChild(script);
    }
  }, { rootMargin: '200px' });
  observer.observe(mapEl);
})();
</script>`
    : '';

  return layout({
    title: `Código Postal ${cp} - ${first.municipio}, ${first.estado} | Colonias y Mapa`,
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
      ${mapSection}
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
      </div>
      <div class="card">
        <h3>¿Cómo escribir una dirección con el CP ${cp}?</h3>
        <div class="address-box address-box--example">
          <div>[Nombre del destinatario]</div>
          <div>[Calle y número]</div>
          <div>Col. ${escapeHtml(colonias[0].colonia)}</div>
          <div>C.P. ${cp}, ${escapeHtml(first.municipio)}</div>
          <div>${escapeHtml(first.estado)}, México</div>
        </div>
        <p style="margin-top:8px;font-size:.9rem">Consulta la <a href="/formato-direccion">guía completa de formato de dirección postal</a> para más detalles.</p>
      </div>
      <div class="card">
        <h3>¿El CP ${cp} es zona urbana o rural?</h3>
        <p>El código postal ${cp} pertenece a la zona <strong>${escapeHtml((first.zona || 'urbana').toLowerCase())}</strong> 
        del municipio de ${escapeHtml(first.municipio)}, ${escapeHtml(first.estado)}.</p>
      </div>
      ${mapScript}`,
  });
}

// ============================================================
// Lista de estados
// ============================================================
export function estadosListPage(estados: { nombre: string; slug: string; count: number }[], totalCPs: number): string {
  const rows = estados
    .map(
      e =>
        `<tr><td><a href="/estado/${e.slug}">${escapeHtml(e.nombre)}</a></td><td>${e.count.toLocaleString('es-MX')}</td></tr>`
    )
    .join('');

  return layout({
    title: `Códigos Postales por Estado en México 2026 - Los 32 Estados`,
    description: 'Lista de los 32 estados de México con todos sus códigos postales actualizados 2026. Consulta municipios, colonias y CPs por estado.',
    canonical: '/estados',
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: 'Estados', url: '/estados' },
    ],
    body: `
      <div class="card">
        <h2>Códigos Postales por Estado</h2>
        <p>México cuenta con 32 entidades federativas y más de ${totalCPs.toLocaleString('es-MX')} códigos postales asignados por el Servicio Postal Mexicano (SEPOMEX). Cada estado se divide en municipios, y cada municipio contiene colonias identificadas por un código postal de 5 dígitos.</p>
        <p style="margin-top:8px">Selecciona un estado de la tabla para consultar todos sus municipios, colonias y códigos postales.</p>
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
        <a href="/" style="color:#006847">← Volver al inicio</a>
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

  // ============================================================
  // Contacto
  // ============================================================
  export function contactoPage(): string {
    return layout({
      title: `Contacto | ${SITE_NAME}`,
      description: 'Ponte en contacto con el equipo de Buscar CP Mexico para soporte, correcciones de datos o consultas comerciales.',
      canonical: '/contacto',
      breadcrumbs: [
        { name: 'Inicio', url: '/' },
        { name: 'Contacto', url: '/contacto' },
      ],
      body: `
        <div class="card">
          <h2>Contacto</h2>
          <p>Si necesitas reportar un error, solicitar una corrección o hacer una consulta comercial, puedes escribirnos al siguiente correo:</p>
          <p style="margin-top:12px"><strong>Email:</strong> <a href="mailto:diegonatylab@gmail.com">diegonatylab@gmail.com</a></p>
          <p style="margin-top:12px">Tiempo estimado de respuesta: 24 a 72 horas hábiles.</p>
        </div>`,
    });
  }

  // ============================================================
  // Acerca de
  // ============================================================
  export function acercaDePage(): string {
    return layout({
      title: `Acerca de | ${SITE_NAME}`,
      description: 'Conoce el objetivo de Buscar CP Mexico y como se actualiza la información de códigos postales.',
      canonical: '/acerca-de',
      breadcrumbs: [
        { name: 'Inicio', url: '/' },
        { name: 'Acerca de', url: '/acerca-de' },
      ],
      body: `
        <div class="card">
          <h2>Acerca de Buscar CP Mexico</h2>
          <p>Buscar CP Mexico es una plataforma para consultar códigos postales de forma rápida por estado, municipio, colonia o código postal.</p>
          <p style="margin-top:12px">Nuestro objetivo es facilitar la búsqueda de información para usuarios, comercios electrónicos, envíos y trámites.</p>
          <p style="margin-top:12px">La información se obtiene de fuentes públicas y se presenta en una interfaz optimizada para SEO, velocidad y usabilidad.</p>
        </div>`,
    });
  }

  // ============================================================
  // Política de Privacidad
  // ============================================================
  export function politicaPrivacidadPage(): string {
    return layout({
      title: `Política de Privacidad | ${SITE_NAME}`,
      description: 'Consulta cómo se recopilan y usan los datos en Buscar CP Mexico, incluyendo cookies y publicidad de terceros.',
      canonical: '/politica-de-privacidad',
      breadcrumbs: [
        { name: 'Inicio', url: '/' },
        { name: 'Política de Privacidad', url: '/politica-de-privacidad' },
      ],
      body: `
        <div class="card">
          <h2>Política de Privacidad</h2>
          <p>En Buscar CP Mexico respetamos tu privacidad. Este sitio puede recopilar datos técnicos anónimos como dirección IP, navegador, país y páginas visitadas para analítica y mejora del servicio.</p>
          <h3 style="margin-top:20px">Cookies</h3>
          <p>Utilizamos cookies propias y de terceros para recordar preferencias, medir tráfico y mostrar publicidad relevante.</p>
          <h3 style="margin-top:20px">Google AdSense</h3>
          <p>Google puede usar cookies para personalizar anuncios. Puedes administrar preferencias en la configuración de anuncios de Google.</p>
          <h3 style="margin-top:20px">Derechos del usuario</h3>
          <p>Si deseas solicitar la eliminación de información de contacto o realizar una consulta sobre privacidad, escribe a <a href="mailto:diegonatylab@gmail.com">diegonatylab@gmail.com</a>.</p>
          <p style="margin-top:12px">Última actualización: abril de 2026.</p>
        </div>`,
    });
  }

// ============================================================
// Validador de CP
// ============================================================
export function validarCPPage(): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo saber si un código postal es válido en México?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Puedes verificar si un código postal mexicano es válido ingresando los 5 dígitos en nuestro validador. La herramienta consulta la base de datos oficial de SEPOMEX y te indica si el CP existe, a qué estado y municipio pertenece, y las colonias que incluye.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuántos dígitos tiene un código postal en México?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Todos los códigos postales de México tienen exactamente 5 dígitos numéricos. Los primeros dos dígitos indican el estado o región, y los tres restantes identifican la zona específica dentro del municipio.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué pasa si un código postal no es válido?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Si un código postal no aparece en la base de datos de SEPOMEX, significa que no está asignado a ninguna zona de entrega. Verifica que los 5 dígitos sean correctos. También es posible que el CP haya sido eliminado o reasignado en una actualización reciente.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Los códigos postales de México cambian?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, SEPOMEX actualiza periódicamente su catálogo de códigos postales. Se pueden crear nuevos códigos para colonias nuevas o modificar los existentes. Por eso es importante validar los CPs con una base de datos actualizada.',
        },
      },
    ],
  };

  return layout({
    title: 'Validar Código Postal de México - Verificar si un CP Existe | 2026',
    description: 'Verifica si un código postal mexicano es válido. Ingresa los 5 dígitos y consulta a qué municipio, estado y colonias pertenece. Base de datos SEPOMEX actualizada 2026.',
    canonical: '/validar-cp',
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: 'Validar CP', url: '/validar-cp' },
    ],
    structuredData,
    body: `
      <div class="card">
        <h2>Validar Código Postal</h2>
        <p>Ingresa un código postal de 5 dígitos para verificar si existe en la base de datos de SEPOMEX y consultar su información completa: estado, municipio, colonias y zona.</p>
        <div style="display:flex;gap:8px;margin-top:16px">
          <input type="text" class="search-box" id="cp-input" placeholder="Ej. 06600" maxlength="5" pattern="\\d{5}" inputmode="numeric" style="margin-bottom:0;flex:1">
          <button id="cp-btn" style="padding:12px 24px;background:#006847;color:#fff;border:none;border-radius:24px;font-size:1rem;cursor:pointer;font-weight:600;white-space:nowrap">Validar</button>
        </div>
        <div id="cp-result" style="margin-top:16px"></div>
      </div>
      ${adSlot('validar-top')}
      <div class="card">
        <h3>¿Para qué validar un código postal?</h3>
        <p>La validación de códigos postales es esencial en múltiples situaciones cotidianas y profesionales:</p>
        <ul style="padding-left:20px;line-height:2">
          <li><strong>Envíos y paquetería:</strong> verificar que un CP existe antes de enviar un paquete o carta por SEPOMEX, DHL, FedEx o Estafeta.</li>
          <li><strong>E-commerce:</strong> validar la dirección de entrega en tiendas en línea para evitar devoluciones y retrasos.</li>
          <li><strong>Formularios web:</strong> confirmar que los datos de registro de usuarios son correctos en tiempo real.</li>
          <li><strong>Facturación (CFDI):</strong> el SAT requiere el código postal correcto en los comprobantes fiscales digitales.</li>
          <li><strong>Trámites bancarios:</strong> los bancos solicitan el CP para verificar la dirección del titular de la cuenta.</li>
          <li><strong>Zona de cobertura:</strong> comprobar si un CP está en zona urbana, rural o semiurbana.</li>
        </ul>
      </div>
      <div class="card">
        <h3>¿Cómo funciona el validador de códigos postales?</h3>
        <p>Nuestra herramienta consulta una base de datos actualizada con la información oficial de SEPOMEX (Servicio Postal Mexicano). Al ingresar un código postal de 5 dígitos, el sistema verifica:</p>
        <ul style="padding-left:20px;line-height:2">
          <li>Si el código postal está registrado en el catálogo oficial.</li>
          <li>El estado y municipio al que pertenece.</li>
          <li>Todas las colonias incluidas en ese CP.</li>
          <li>La zona geográfica (urbana, rural o semiurbana).</li>
        </ul>
        <p style="margin-top:12px">La consulta es instantánea y gratuita. No se almacenan los códigos postales que consultas.</p>
      </div>
      ${adSlot('validar-middle')}
      <div class="card">
        <h3>Estructura de los códigos postales mexicanos</h3>
        <p>Los códigos postales de México siguen un sistema numérico de 5 dígitos con la siguiente estructura:</p>
        <table>
          <thead><tr><th>Dígitos</th><th>Significado</th><th>Ejemplo (CP 06600)</th></tr></thead>
          <tbody>
            <tr><td><strong>1-2</strong></td><td>Estado o región geográfica</td><td>06 → Ciudad de México</td></tr>
            <tr><td><strong>3</strong></td><td>Zona dentro del estado</td><td>6 → Zona centro</td></tr>
            <tr><td><strong>4-5</strong></td><td>Área de entrega específica</td><td>00 → Colonia Juárez, Roma Norte, etc.</td></tr>
          </tbody>
        </table>
        <p style="margin-top:12px">Puedes explorar los códigos postales organizados por sus primeros dígitos en nuestra sección de <a href="/codigos-postales">CP por prefijo</a>.</p>
      </div>
      <div class="card">
        <h3>Preguntas frecuentes sobre códigos postales</h3>
        <h4 style="margin-top:12px">¿Cuántos dígitos tiene un código postal en México?</h4>
        <p>Todos los códigos postales mexicanos tienen exactamente 5 dígitos numéricos, asignados por SEPOMEX. Los primeros dos dígitos corresponden al estado o región.</p>
        <h4 style="margin-top:12px">¿Los códigos postales cambian con el tiempo?</h4>
        <p>Sí, SEPOMEX actualiza su catálogo periódicamente. Se crean nuevos códigos postales para colonias nuevas y se pueden modificar o eliminar los existentes. Nuestra base de datos se mantiene actualizada.</p>
        <h4 style="margin-top:12px">¿Un código postal puede tener varias colonias?</h4>
        <p>Sí, es muy común. Un solo código postal puede abarcar múltiples colonias dentro del mismo municipio. Por ejemplo, el CP 06600 en Ciudad de México incluye colonias como Juárez, Roma Norte y Condesa.</p>
        <h4 style="margin-top:12px">¿Qué hago si no encuentro mi código postal?</h4>
        <p>Si el validador indica que el CP no existe, verifica los 5 dígitos. También puedes <a href="/">buscar por nombre de colonia</a> o <a href="/buscar-por-ubicacion">buscar por ubicación GPS</a> para encontrar el CP correcto.</p>
      </div>
      <div class="card">
        <h3>Otras herramientas útiles</h3>
        <div class="tools-grid">
          <a href="/buscar-por-ubicacion"><strong>CP por Ubicación</strong><br><small>Encuentra el CP más cercano a tu GPS</small></a>
          <a href="/distancia"><strong>Distancia entre CPs</strong><br><small>Calcula km en línea recta</small></a>
          <a href="/formato-direccion"><strong>Formato Dirección</strong><br><small>Guía para escribir direcciones</small></a>
        </div>
      </div>
      ${adSlot('validar-bottom')}
      <script>
(function(){
  var input = document.getElementById('cp-input');
  var btn = document.getElementById('cp-btn');
  var result = document.getElementById('cp-result');
  function validate() {
    var cp = input.value.trim();
    if (!/^\\d{5}$/.test(cp)) {
      result.innerHTML = '<p style="color:#d32f2f;padding:8px">⚠ Ingresa exactamente 5 dígitos.</p>';
      return;
    }
    result.innerHTML = '<p style="color:#4a4a4a;padding:8px">Verificando...</p>';
    fetch('/api/validar-cp?cp=' + cp).then(function(r){return r.json()}).then(function(data){
      if (!data.valid) {
        result.innerHTML = '<div class="result-box result-box--err"><h3>✗ CP ' + cp + ' no encontrado</h3><p>Este código postal no existe en la base de datos de SEPOMEX. Verifica que los 5 dígitos sean correctos.</p></div>';
        return;
      }
      var d = data.data;
      var colList = d.colonias.map(function(c){return '<a href="/estado/' + d.estadoSlug + '/' + d.municipioSlug + '/colonia/' + c.slug + '">' + c.nombre + '</a>'}).join(', ');
      result.innerHTML = '<div class="result-box result-box--ok">' +
        '<h3>✓ CP ' + cp + ' es válido</h3>' +
        '<div class="info-grid">' +
        '<div class="info-item"><div class="info-label">Estado</div><div class="info-value"><a href="/estado/' + d.estadoSlug + '">' + d.estado + '</a></div></div>' +
        '<div class="info-item"><div class="info-label">Municipio</div><div class="info-value"><a href="/estado/' + d.estadoSlug + '/' + d.municipioSlug + '">' + d.municipio + '</a></div></div>' +
        '<div class="info-item"><div class="info-label">Zona</div><div class="info-value">' + d.zona + '</div></div>' +
        '<div class="info-item"><div class="info-label">Colonias</div><div class="info-value">' + d.colonias.length + '</div></div>' +
        '</div>' +
        '<p style="margin-top:12px"><strong>Colonias:</strong> ' + colList + '</p>' +
        '<p style="margin-top:8px"><a href="/codigo-postal/' + cp + '">Ver página completa del CP ' + cp + ' →</a></p>' +
        '</div>';
    });
  }
  btn.addEventListener('click', validate);
  input.addEventListener('keydown', function(e){ if(e.key==='Enter') validate(); });
})();
      </script>`,
  });
}

// ============================================================
// Búsqueda inversa coordenadas → CP
// ============================================================
export function buscarPorUbicacionPage(): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo saber el código postal de mi ubicación actual?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Puedes usar nuestra herramienta de búsqueda por ubicación GPS. Presiona "Usar mi ubicación actual" para que tu navegador comparta tus coordenadas, y el sistema te mostrará los 5 códigos postales más cercanos con su distancia aproximada.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué tan precisa es la búsqueda de CP por coordenadas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La búsqueda utiliza el centroide (punto central) de cada código postal. La precisión es de unos cientos de metros en zonas urbanas. En zonas rurales con CPs más extensos, la precisión puede variar más. Mostramos los 5 CPs más cercanos para que puedas elegir el correcto.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Puedo buscar un código postal con coordenadas de Google Maps?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí. Copia la latitud y longitud desde Google Maps (haz clic derecho en un punto del mapa) y pégalas en los campos de coordenadas manuales. El formato debe ser decimal, por ejemplo: latitud 19.4326, longitud -99.1332.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué rango de coordenadas cubre México?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'México se encuentra entre las latitudes 14° y 33° Norte, y las longitudes -118° y -86° Oeste. Nuestra herramienta valida que las coordenadas estén dentro de este rango para asegurar resultados correctos.',
        },
      },
    ],
  };

  return layout({
    title: 'Buscar Código Postal por Ubicación GPS - Coordenadas a CP México 2026',
    description: 'Encuentra el código postal más cercano a tu ubicación GPS en México. Usa tu ubicación actual o ingresa coordenadas para obtener el CP correspondiente. Gratis y sin registro.',
    canonical: '/buscar-por-ubicacion',
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: 'Buscar por Ubicación', url: '/buscar-por-ubicacion' },
    ],
    structuredData,
    body: `
      <div class="card">
        <h2>Buscar CP por Ubicación</h2>
        <p>Encuentra el código postal más cercano a unas coordenadas GPS o usa tu ubicación actual. Mostramos los 5 códigos postales más cercanos con su distancia aproximada.</p>
        <div style="margin-top:16px">
          <button id="geo-btn" style="padding:12px 24px;background:#006847;color:#fff;border:none;border-radius:24px;font-size:1rem;cursor:pointer;font-weight:600;width:100%">📍 Usar mi ubicación actual</button>
        </div>
        <p style="text-align:center;margin:12px 0;color:#4a4a4a;font-size:.9rem">— o ingresa coordenadas manualmente —</p>
        <div style="display:flex;gap:8px">
          <input type="text" class="search-box" id="lat-input" placeholder="Latitud (ej. 19.4326)" inputmode="decimal" style="margin-bottom:0;flex:1">
          <input type="text" class="search-box" id="lng-input" placeholder="Longitud (ej. -99.1332)" inputmode="decimal" style="margin-bottom:0;flex:1">
        </div>
        <button id="coord-btn" style="margin-top:8px;padding:12px 24px;background:#006847;color:#fff;border:none;border-radius:24px;font-size:1rem;cursor:pointer;font-weight:600;width:100%">Buscar CP</button>
        <div id="geo-result" style="margin-top:16px"></div>
      </div>
      ${adSlot('ubicacion-top')}
      <div class="card">
        <h3>¿Cómo funciona la búsqueda por ubicación?</h3>
        <p>Nuestra herramienta de geolocalización inversa encuentra el código postal más cercano a cualquier punto en México. El proceso es sencillo:</p>
        <ol style="padding-left:20px;line-height:2">
          <li><strong>Obtener coordenadas:</strong> usa el botón de ubicación automática o ingresa latitud y longitud manualmente.</li>
          <li><strong>Búsqueda por proximidad:</strong> el sistema calcula la distancia a todos los códigos postales cercanos usando la fórmula de Haversine.</li>
          <li><strong>Resultados ordenados:</strong> se muestran los 5 CPs más cercanos con la distancia en kilómetros, municipio y estado.</li>
        </ol>
        <p style="margin-top:12px">La precisión depende del tamaño del código postal. En zonas urbanas densas los CPs son más pequeños y la precisión es mayor. En zonas rurales los CPs cubren áreas más amplias.</p>
      </div>
      <div class="card">
        <h3>¿Cuándo necesitas buscar un CP por ubicación?</h3>
        <ul style="padding-left:20px;line-height:2">
          <li><strong>Estás en un lugar desconocido</strong> y necesitas saber el código postal para un envío o trámite.</li>
          <li><strong>Trabajas con coordenadas GPS</strong> (flotillas, logística, campo) y necesitas convertirlas a código postal.</li>
          <li><strong>Desarrollo de apps:</strong> necesitas asignar un CP a la ubicación del usuario para cálculo de envíos.</li>
          <li><strong>Compras en línea:</strong> no sabes el CP de tu ubicación actual para completar un formulario.</li>
          <li><strong>Mudanza reciente:</strong> aún no conoces el código postal de tu nueva dirección.</li>
        </ul>
      </div>
      ${adSlot('ubicacion-middle')}
      <div class="card">
        <h3>¿Cómo obtener coordenadas desde Google Maps?</h3>
        <p>Si quieres buscar el código postal de un lugar específico usando Google Maps:</p>
        <ol style="padding-left:20px;line-height:2">
          <li>Abre <strong>Google Maps</strong> en tu computadora o celular.</li>
          <li>Haz <strong>clic derecho</strong> (o mantén presionado en móvil) sobre el punto que te interesa.</li>
          <li>Se mostrarán las <strong>coordenadas</strong> (latitud, longitud) en formato decimal.</li>
          <li>Copia ambos valores y pégalos en los campos de arriba.</li>
        </ol>
        <p style="margin-top:12px">Las coordenadas de México van de latitud 14° a 33° y longitud -118° a -86°.</p>
      </div>
      <div class="card">
        <h3>Preguntas frecuentes</h3>
        <h4 style="margin-top:12px">¿Necesito activar el GPS de mi celular?</h4>
        <p>Sí, para usar la función "Usar mi ubicación actual" necesitas permitir que el navegador acceda a tu ubicación. En computadora, la ubicación se estima por tu conexión a internet y puede ser menos precisa.</p>
        <h4 style="margin-top:12px">¿Puedo buscar códigos postales fuera de México?</h4>
        <p>No, esta herramienta solo cubre códigos postales de México (SEPOMEX). Las coordenadas deben estar dentro del territorio mexicano.</p>
        <h4 style="margin-top:12px">¿El resultado es exacto?</h4>
        <p>El resultado es una aproximación basada en el centroide (punto central) de cada código postal. Te recomendamos verificar el CP correcto revisando la colonia en la <a href="/">página de búsqueda principal</a>.</p>
      </div>
      <div class="card">
        <h3>Otras herramientas útiles</h3>
        <div class="tools-grid">
          <a href="/validar-cp"><strong>Validar CP</strong><br><small>Verifica si un CP existe</small></a>
          <a href="/distancia"><strong>Distancia entre CPs</strong><br><small>Calcula km en línea recta</small></a>
          <a href="/formato-direccion"><strong>Formato Dirección</strong><br><small>Guía para escribir direcciones</small></a>
        </div>
      </div>
      ${adSlot('ubicacion-bottom')}
      <script>
(function(){
  var geoBtn = document.getElementById('geo-btn');
  var coordBtn = document.getElementById('coord-btn');
  var latInput = document.getElementById('lat-input');
  var lngInput = document.getElementById('lng-input');
  var result = document.getElementById('geo-result');
  function search(lat, lng) {
    result.innerHTML = '<p style="color:#4a4a4a;padding:8px">Buscando códigos postales cercanos...</p>';
    fetch('/api/coordenadas-cp?lat=' + lat + '&lng=' + lng).then(function(r){return r.json()}).then(function(data){
      if (!data.results || data.results.length === 0) {
        result.innerHTML = '<p style="color:#d32f2f;padding:8px">No se encontraron códigos postales cercanos.</p>';
        return;
      }
      var html = '<table><thead><tr><th>CP</th><th>Distancia</th><th>Municipio</th><th>Estado</th></tr></thead><tbody>';
      data.results.forEach(function(r){
        html += '<tr><td><a href="/codigo-postal/' + r.codigo_postal + '">' + r.codigo_postal + '</a></td><td>' + r.distancia + '</td><td>' + r.municipio + '</td><td>' + r.estado + '</td></tr>';
      });
      html += '</tbody></table>';
      result.innerHTML = '<div class="result-box result-box--ok"><h3>Códigos postales cercanos a ' + parseFloat(lat).toFixed(4) + ', ' + parseFloat(lng).toFixed(4) + '</h3>' + html + '</div>';
    });
  }
  geoBtn.addEventListener('click', function(){
    if (!navigator.geolocation) { result.innerHTML = '<p style="color:#d32f2f">Tu navegador no soporta geolocalización.</p>'; return; }
    geoBtn.textContent = 'Obteniendo ubicación...';
    navigator.geolocation.getCurrentPosition(function(pos){
      latInput.value = pos.coords.latitude.toFixed(6);
      lngInput.value = pos.coords.longitude.toFixed(6);
      geoBtn.textContent = '📍 Usar mi ubicación actual';
      search(pos.coords.latitude, pos.coords.longitude);
    }, function(){
      geoBtn.textContent = '📍 Usar mi ubicación actual';
      result.innerHTML = '<p style="color:#d32f2f">No se pudo obtener tu ubicación. Permite el acceso o ingresa coordenadas manualmente.</p>';
    });
  });
  coordBtn.addEventListener('click', function(){
    var lat = parseFloat(latInput.value), lng = parseFloat(lngInput.value);
    if (isNaN(lat) || isNaN(lng) || lat < 14 || lat > 33 || lng < -118 || lng > -86) {
      result.innerHTML = '<p style="color:#d32f2f">Coordenadas inválidas. Latitud: 14-33, Longitud: -118 a -86 (México).</p>';
      return;
    }
    search(lat, lng);
  });
})();
      </script>`,
  });
}

// ============================================================
// Calculadora de distancia entre CPs
// ============================================================
export function distanciaCPPage(): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo calcular la distancia entre dos códigos postales en México?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ingresa los dos códigos postales de 5 dígitos en nuestra calculadora y presiona "Calcular". El sistema obtiene las coordenadas de cada CP y calcula la distancia en línea recta usando la fórmula de Haversine. El resultado se muestra en kilómetros.',
        },
      },
      {
        '@type': 'Question',
        name: '¿La distancia mostrada es por carretera?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, la distancia calculada es en línea recta (geodésica) entre los centroides de ambos códigos postales. La distancia real por carretera generalmente es mayor, ya que las carreteras no van en línea recta. Como referencia, la distancia por carretera suele ser entre 1.2 y 1.5 veces la distancia en línea recta.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Para qué sirve calcular la distancia entre códigos postales?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Es útil para estimar costos de envío por paquetería, calcular zonas de cobertura de servicios de entrega, comparar distancias entre sucursales, planificar rutas de distribución y determinar si un destino cae dentro de un radio de servicio.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué fórmula se usa para calcular la distancia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Se utiliza la fórmula de Haversine, que calcula la distancia más corta entre dos puntos sobre la superficie de una esfera (la Tierra). Esta fórmula toma en cuenta la curvatura terrestre y proporciona una distancia geodésica precisa.',
        },
      },
    ],
  };

  return layout({
    title: 'Calcular Distancia entre Códigos Postales de México - km en Línea Recta 2026',
    description: 'Calcula la distancia en kilómetros entre dos códigos postales de México en línea recta. Herramienta gratuita para estimar distancias de envío con fórmula de Haversine.',
    canonical: '/distancia',
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: 'Distancia entre CPs', url: '/distancia' },
    ],
    structuredData,
    body: `
      <div class="card">
        <h2>Calcular Distancia entre Códigos Postales</h2>
        <p>Ingresa dos códigos postales de 5 dígitos para calcular la distancia aproximada en línea recta entre ellos. El resultado incluye la ubicación de cada CP.</p>
        <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
          <input type="text" class="search-box" id="cp1" placeholder="CP origen (ej. 06600)" maxlength="5" inputmode="numeric" style="margin-bottom:0;flex:1;min-width:140px">
          <input type="text" class="search-box" id="cp2" placeholder="CP destino (ej. 44100)" maxlength="5" inputmode="numeric" style="margin-bottom:0;flex:1;min-width:140px">
          <button id="dist-btn" style="padding:12px 24px;background:#006847;color:#fff;border:none;border-radius:24px;font-size:1rem;cursor:pointer;font-weight:600;white-space:nowrap">Calcular</button>
        </div>
        <div id="dist-result" style="margin-top:16px"></div>
      </div>
      ${adSlot('distancia-top')}
      <div class="card">
        <h3>¿Cómo se calcula la distancia?</h3>
        <p>Utilizamos la <strong>fórmula de Haversine</strong> para calcular la distancia geodésica (en línea recta sobre la superficie terrestre) entre los centroides de cada código postal.</p>
        <p style="margin-top:8px">Esta fórmula considera la curvatura de la Tierra para dar un resultado preciso. La distancia real por carretera generalmente es entre <strong>1.2x y 1.5x mayor</strong> que la distancia en línea recta, dependiendo de la geografía y las vías disponibles.</p>
      </div>
      <div class="card">
        <h3>Usos comunes de la calculadora de distancias</h3>
        <ul style="padding-left:20px;line-height:2">
          <li><strong>Envíos y paquetería:</strong> estimar el costo de envío según la distancia entre origen y destino (DHL, FedEx, Estafeta, Correos de México).</li>
          <li><strong>Logística y distribución:</strong> planificar rutas de entrega y comparar distancias entre almacenes y puntos de venta.</li>
          <li><strong>Zonas de cobertura:</strong> determinar si un cliente está dentro del radio de servicio de una tienda o restaurante.</li>
          <li><strong>Mudanzas:</strong> calcular la distancia aproximada de una mudanza entre dos ciudades o zonas.</li>
          <li><strong>Seguros y finanzas:</strong> algunas aseguradoras y instituciones financieras usan la distancia entre CPs para cálculos de riesgo o cobertura.</li>
        </ul>
      </div>
      ${adSlot('distancia-middle')}
      <div class="card">
        <h3>Distancias de referencia en México</h3>
        <p>Algunas distancias en línea recta entre ciudades importantes de México para que tengas un punto de comparación:</p>
        <table>
          <thead><tr><th>Ruta</th><th>CPs ejemplo</th><th>Distancia aprox.</th></tr></thead>
          <tbody>
            <tr><td>CDMX → Guadalajara</td><td>06600 → 44100</td><td>~460 km</td></tr>
            <tr><td>CDMX → Monterrey</td><td>06600 → 64000</td><td>~740 km</td></tr>
            <tr><td>Guadalajara → Monterrey</td><td>44100 → 64000</td><td>~680 km</td></tr>
            <tr><td>CDMX → Cancún</td><td>06600 → 77500</td><td>~1,300 km</td></tr>
            <tr><td>Tijuana → Mérida</td><td>22000 → 97000</td><td>~3,000 km</td></tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <h3>Preguntas frecuentes</h3>
        <h4 style="margin-top:12px">¿La distancia es por carretera?</h4>
        <p>No, es la distancia en línea recta (geodésica). La distancia por carretera suele ser mayor. Para distancias por carretera, consulta Google Maps o Waze.</p>
        <h4 style="margin-top:12px">¿Qué pasa si un CP no tiene coordenadas?</h4>
        <p>Algunos códigos postales muy nuevos o especiales (como los de oficinas de correos) pueden no tener coordenadas en nuestra base de datos. En ese caso, el sistema mostrará un mensaje de error.</p>
        <h4 style="margin-top:12px">¿Puedo calcular distancias con CPs de otros países?</h4>
        <p>No, esta herramienta solo funciona con códigos postales de México (5 dígitos, asignados por SEPOMEX).</p>
        <h4 style="margin-top:12px">¿Qué tan precisa es la medición?</h4>
        <p>La precisión depende de la ubicación del centroide de cada CP. En zonas urbanas con CPs pequeños, la precisión es de cientos de metros. En zonas rurales con CPs más extensos, puede variar algunos kilómetros.</p>
      </div>
      <div class="card">
        <h3>Otras herramientas útiles</h3>
        <div class="tools-grid">
          <a href="/validar-cp"><strong>Validar CP</strong><br><small>Verifica si un CP existe</small></a>
          <a href="/buscar-por-ubicacion"><strong>CP por Ubicación</strong><br><small>Encuentra el CP más cercano</small></a>
          <a href="/formato-direccion"><strong>Formato Dirección</strong><br><small>Guía para escribir direcciones</small></a>
        </div>
      </div>
      ${adSlot('distancia-bottom')}
      <script>
(function(){
  var cp1 = document.getElementById('cp1');
  var cp2 = document.getElementById('cp2');
  var btn = document.getElementById('dist-btn');
  var result = document.getElementById('dist-result');
  function calc() {
    var v1 = cp1.value.trim(), v2 = cp2.value.trim();
    if (!/^\\d{5}$/.test(v1) || !/^\\d{5}$/.test(v2)) {
      result.innerHTML = '<p style="color:#d32f2f;padding:8px">⚠ Ingresa dos códigos postales válidos de 5 dígitos.</p>';
      return;
    }
    if (v1 === v2) {
      result.innerHTML = '<p style="color:#4a4a4a;padding:8px">Los códigos postales son iguales. La distancia es 0 km.</p>';
      return;
    }
    result.innerHTML = '<p style="color:#4a4a4a;padding:8px">Calculando...</p>';
    fetch('/api/distancia?cp1=' + v1 + '&cp2=' + v2).then(function(r){return r.json()}).then(function(data){
      if (data.error) {
        result.innerHTML = '<p style="color:#d32f2f;padding:8px">⚠ ' + data.error + '</p>';
        return;
      }
      result.innerHTML = '<div class="result-box result-box--ok" style="text-align:center">' +
        '<div class="result-big">' + data.distancia_km + ' km</div>' +
        '<p style="margin-top:8px;color:#4a4a4a">Distancia en línea recta</p>' +
        '<div class="info-grid" style="text-align:left;margin-top:16px">' +
        '<div class="info-item"><div class="info-label">Origen — CP ' + v1 + '</div><div class="info-value"><a href="/codigo-postal/' + v1 + '">' + data.origen.municipio + ', ' + data.origen.estado + '</a></div></div>' +
        '<div class="info-item"><div class="info-label">Destino — CP ' + v2 + '</div><div class="info-value"><a href="/codigo-postal/' + v2 + '">' + data.destino.municipio + ', ' + data.destino.estado + '</a></div></div>' +
        '</div></div>';
    });
  }
  btn.addEventListener('click', calc);
  cp2.addEventListener('keydown', function(e){ if(e.key==='Enter') calc(); });
})();
      </script>`,
  });
}

// ============================================================
// Prefijos de CP — listado general
// ============================================================
export function prefijosPage(
  prefijos: { prefijo: string; count: number; estados: string }[]
): string {
  const grid = prefijos
    .map(
      p =>
        `<a href="/codigos-postales/${p.prefijo}"><strong>${p.prefijo}xxx</strong><br><small>${p.count.toLocaleString('es-MX')} CPs · ${escapeHtml(p.estados)}</small></a>`
    )
    .join('');

  return layout({
    title: 'Códigos Postales de México por Prefijo - Navegar por Rango de CP',
    description: 'Explora todos los códigos postales de México organizados por prefijo (primeros 2 dígitos). Encuentra rápidamente el rango de CP de tu zona.',
    canonical: '/codigos-postales',
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: 'Códigos Postales por Prefijo', url: '/codigos-postales' },
    ],
    body: `
      <div class="card">
        <h2>Códigos Postales por Prefijo</h2>
        <p>Los códigos postales de México tienen 5 dígitos. Los primeros dos dígitos indican la región o estado al que pertenece el código. Selecciona un prefijo para ver todos los códigos postales de ese rango.</p>
      </div>
      ${adSlot('prefijos-top')}
      <div class="card">
        <h2>Todos los Prefijos</h2>
        <div class="grid">${grid}</div>
      </div>
      ${adSlot('prefijos-bottom')}`,
  });
}

// ============================================================
// Prefijo detalle — CPs de un prefijo
// ============================================================
export function prefijoDetallePage(
  prefijo: string,
  codigos: { codigo_postal: string; colonias: number; municipio: string; estado: string }[],
  estadosDelPrefijo: string[]
): string {
  const rows = codigos
    .map(
      c =>
        `<tr>
          <td><a href="/codigo-postal/${c.codigo_postal}">${c.codigo_postal}</a></td>
          <td>${c.colonias}</td>
          <td>${escapeHtml(c.municipio)}</td>
          <td>${escapeHtml(c.estado)}</td>
        </tr>`
    )
    .join('');

  const estadosText = estadosDelPrefijo.join(', ');
  const rangeStart = `${prefijo}000`;
  const rangeEnd = `${prefijo}999`;

  return layout({
    title: `Códigos Postales ${rangeStart}-${rangeEnd} | Prefijo ${prefijo} - ${estadosText}`,
    description: `${codigos.length} códigos postales con prefijo ${prefijo} (${rangeStart} a ${rangeEnd}). Pertenecen a: ${estadosText}. Consulta colonias, municipios y ubicación.`,
    canonical: `/codigos-postales/${prefijo}`,
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: 'Prefijos', url: '/codigos-postales' },
      { name: `Prefijo ${prefijo}`, url: `/codigos-postales/${prefijo}` },
    ],
    body: `
      <div class="card">
        <h2>Códigos Postales con Prefijo ${prefijo}</h2>
        <p>Se encontraron <strong>${codigos.length.toLocaleString('es-MX')}</strong> códigos postales en el rango <strong>${rangeStart}</strong> a <strong>${rangeEnd}</strong>, pertenecientes a: <strong>${escapeHtml(estadosText)}</strong>.</p>
      </div>
      ${adSlot('prefijo-top')}
      <div class="card">
        <table>
          <thead><tr><th>Código Postal</th><th>Colonias</th><th>Municipio</th><th>Estado</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${adSlot('prefijo-bottom')}
      <div class="card">
        <h3>¿Qué significan los primeros dígitos de un código postal?</h3>
        <p>En México, los primeros dos dígitos del código postal indican la región geográfica. Los códigos que empiezan con <strong>${prefijo}</strong> corresponden a ${escapeHtml(estadosText)}. Los dígitos siguientes identifican el municipio y la colonia específica.</p>
      </div>`,
  });
}

// ============================================================
// Formato de Dirección Postal
// ============================================================
export function formatoDireccionPage(): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cómo escribir correctamente una dirección postal en México',
    description: 'Guía paso a paso para escribir una dirección postal mexicana correctamente, incluyendo el formato oficial de SEPOMEX.',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Nombre del destinatario', text: 'Escribe el nombre completo de la persona o empresa que recibirá el envío.' },
      { '@type': 'HowToStep', position: 2, name: 'Calle y número', text: 'Indica el nombre de la calle, número exterior y, si aplica, número interior.' },
      { '@type': 'HowToStep', position: 3, name: 'Colonia', text: 'Escribe el nombre de la colonia o asentamiento.' },
      { '@type': 'HowToStep', position: 4, name: 'Código postal', text: 'Incluye el código postal de 5 dígitos asignado por SEPOMEX.' },
      { '@type': 'HowToStep', position: 5, name: 'Municipio y estado', text: 'Agrega el nombre del municipio (o alcaldía) y el estado.' },
      { '@type': 'HowToStep', position: 6, name: 'País', text: 'Para envíos internacionales, agrega "México" al final.' },
    ],
  };

  return layout({
    title: 'Cómo Escribir una Dirección Postal en México - Formato Correcto 2026',
    description: 'Aprende el formato correcto para escribir una dirección postal en México. Guía con ejemplos, orden de los campos y tips para envíos por SEPOMEX y paquetería.',
    canonical: '/formato-direccion',
    breadcrumbs: [
      { name: 'Inicio', url: '/' },
      { name: 'Formato de Dirección', url: '/formato-direccion' },
    ],
    structuredData,
    body: `
      <div class="card">
        <h2>Cómo Escribir Correctamente una Dirección Postal en México</h2>
        <p>El formato correcto de una dirección postal es esencial para que tu correspondencia o paquete llegue sin problemas. En México, el Servicio Postal Mexicano (SEPOMEX) y las empresas de paquetería utilizan un formato estandarizado.</p>
      </div>
      ${adSlot('formato-top')}
      <div class="card">
        <h3>Formato Oficial de Dirección Postal</h3>
        <div class="address-box address-box--official">
          <div><strong>Nombre del destinatario</strong></div>
          <div>Calle Nombre de la Calle #123, Int. 4</div>
          <div>Colonia Nombre de la Colonia</div>
          <div>C.P. 01234, Municipio/Alcaldía</div>
          <div>Estado, México</div>
        </div>
      </div>
      <div class="card">
        <h3>Ejemplo Real</h3>
        <div class="address-box address-box--example">
          <div>Juan Pérez López</div>
          <div>Av. Reforma #456, Piso 3, Of. 301</div>
          <div>Col. Juárez</div>
          <div>C.P. 06600, Cuauhtémoc</div>
          <div>Ciudad de México, México</div>
        </div>
      </div>
      <div class="card">
        <h3>Campos de la Dirección Paso a Paso</h3>
        <table>
          <thead><tr><th>#</th><th>Campo</th><th>Descripción</th><th>Ejemplo</th></tr></thead>
          <tbody>
            <tr><td>1</td><td><strong>Destinatario</strong></td><td>Nombre completo de la persona o razón social</td><td>Juan Pérez López</td></tr>
            <tr><td>2</td><td><strong>Calle y número</strong></td><td>Nombre de la calle, número exterior e interior</td><td>Av. Reforma #456, Int. 301</td></tr>
            <tr><td>3</td><td><strong>Colonia</strong></td><td>Nombre del asentamiento (colonia, fraccionamiento, pueblo, etc.)</td><td>Col. Juárez</td></tr>
            <tr><td>4</td><td><strong>Código Postal</strong></td><td>5 dígitos asignados por SEPOMEX</td><td>C.P. 06600</td></tr>
            <tr><td>5</td><td><strong>Municipio/Alcaldía</strong></td><td>Municipio o delegación/alcaldía</td><td>Cuauhtémoc</td></tr>
            <tr><td>6</td><td><strong>Estado</strong></td><td>Entidad federativa</td><td>Ciudad de México</td></tr>
            <tr><td>7</td><td><strong>País</strong></td><td>Solo para envíos internacionales</td><td>México</td></tr>
          </tbody>
        </table>
      </div>
      ${adSlot('formato-middle')}
      <div class="card">
        <h3>Tips para Escribir tu Dirección</h3>
        <ul style="padding-left:20px;line-height:2">
          <li>Siempre incluye el <strong>código postal</strong> — es el dato más importante para la entrega.</li>
          <li>Usa <strong>"Col."</strong> antes del nombre de la colonia para mayor claridad.</li>
          <li>Si tienes número interior (departamento, oficina, piso), sepáralo con <strong>"Int."</strong></li>
          <li>Para envíos internacionales, escribe <strong>"México"</strong> o <strong>"Mexico"</strong> como última línea.</li>
          <li>Escribe el nombre del estado <strong>sin abreviar</strong> para evitar confusiones.</li>
          <li>Verifica que el código postal corresponda a la colonia usando nuestro <a href="/">buscador de códigos postales</a>.</li>
        </ul>
      </div>
      <div class="card">
        <h3>Preguntas Frecuentes</h3>
        <h4 style="margin-top:12px">¿Qué pasa si pongo mal el código postal?</h4>
        <p>Si el código postal no coincide con la colonia, tu envío puede retrasarse o ser devuelto. SEPOMEX y las paqueterías usan el CP como referencia principal para la zona de entrega.</p>
        <h4 style="margin-top:12px">¿Es obligatorio poner la colonia?</h4>
        <p>Sí, la colonia es un campo esencial en las direcciones mexicanas. Un mismo código postal puede abarcar varias colonias, por lo que omitirla dificulta la entrega.</p>
        <h4 style="margin-top:12px">¿Cómo encuentro mi código postal?</h4>
        <p>Puedes buscarlo en nuestro <a href="/">buscador</a> ingresando el nombre de tu colonia, municipio o estado.</p>
      </div>
      ${adSlot('formato-bottom')}`,
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
