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
