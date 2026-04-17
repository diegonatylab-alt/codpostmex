import { Hono } from 'hono';
import { cache } from 'hono/cache';
import {
  homePage,
  estadoPage,
  estadosListPage,
  municipioPage,
  coloniaPage,
  codigoPostalPage,
  notFoundPage,
  avisoLegalPage,
  contactoPage,
  acercaDePage,
  politicaPrivacidadPage,
  formatoDireccionPage,
} from './templates';
import { slugify, SITE_URL } from './config';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================================
// Force HTTPS (301)
// ============================================================
app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  const proto = c.req.header('x-forwarded-proto') || url.protocol.replace(':', '');

  if (proto !== 'https') {
    url.protocol = 'https:';
    return c.redirect(url.toString(), 301);
  }

  await next();
});

// ============================================================
// Cache middleware — cachea respuestas HTML por 24h en Cloudflare Edge
// ============================================================
app.use(
  '*',
  cache({
    cacheName: 'buscarcpmexico-v15',
    cacheControl: 'public, max-age=86400, s-maxage=86400',
  })
);

// ============================================================
// HOME
// ============================================================
app.get('/', async (c) => {
  const estados = await c.env.DB.prepare(`
    SELECT e.nombre, e.slug, COUNT(DISTINCT cp.codigo_postal) as count
    FROM estados e
    LEFT JOIN codigos_postales cp ON cp.clave_estado = e.clave
    GROUP BY e.clave
    ORDER BY e.nombre
  `).all();

  return c.html(
    homePage(
      estados.results.map((e: any) => ({
        nombre: e.nombre,
        slug: e.slug,
        count: e.count || 0,
      }))
    )
  );
});

// ============================================================
// LISTA DE ESTADOS
// ============================================================
app.get('/estados', async (c) => {
  const [estados, totalCPsRow] = await Promise.all([
    c.env.DB.prepare(`
      SELECT e.nombre, e.slug, COUNT(DISTINCT cp.codigo_postal) as count
      FROM estados e
      LEFT JOIN codigos_postales cp ON cp.clave_estado = e.clave
      GROUP BY e.clave
      ORDER BY e.nombre
    `).all(),
    c.env.DB.prepare(
      'SELECT COUNT(DISTINCT codigo_postal) as total_cps FROM codigos_postales'
    ).first(),
  ]);

  const totalCPs = (totalCPsRow?.total_cps as number) || 0;

  return c.html(
    estadosListPage(
      estados.results.map((e: any) => ({
        nombre: e.nombre,
        slug: e.slug,
        count: e.count || 0,
      })),
      totalCPs
    )
  );
});

// ============================================================
// ESTADO (lista de municipios)
// ============================================================
app.get('/estado/:slug', async (c) => {
  const slug = c.req.param('slug');

  const estado = await c.env.DB.prepare(
    'SELECT clave, nombre, slug FROM estados WHERE slug = ?'
  )
    .bind(slug)
    .first();

  if (!estado) return c.html(notFoundPage(), 404);

  const [municipios, estadoStats] = await Promise.all([
    c.env.DB.prepare(`
      SELECT m.nombre, m.slug, COUNT(DISTINCT cp.codigo_postal) as count
      FROM municipios m
      LEFT JOIN codigos_postales cp ON cp.clave_estado = m.clave_estado AND cp.clave_municipio = m.clave_municipio
      WHERE m.clave_estado = ?
      GROUP BY m.clave_estado, m.clave_municipio
      ORDER BY m.nombre
    `)
      .bind(estado.clave)
      .all(),
    c.env.DB.prepare(`
      SELECT COUNT(DISTINCT codigo_postal) as total_cps,
             MIN(codigo_postal) as cp_min,
             MAX(codigo_postal) as cp_max
      FROM codigos_postales
      WHERE clave_estado = ?
    `)
      .bind(estado.clave)
      .first(),
  ]);

  const stats = {
    totalCPs: (estadoStats?.total_cps as number) || 0,
    cpMin: (estadoStats?.cp_min as string) || '',
    cpMax: (estadoStats?.cp_max as string) || '',
  };

  return c.html(
    estadoPage(
      { nombre: estado.nombre as string, slug: estado.slug as string },
      municipios.results.map((m: any) => ({
        nombre: m.nombre,
        slug: m.slug,
        count: m.count || 0,
      })),
      stats
    )
  );
});

// ============================================================
// MUNICIPIO (lista de colonias/CPs)
// ============================================================
app.get('/estado/:estadoSlug/:municipioSlug', async (c) => {
  const estadoSlug = c.req.param('estadoSlug');
  const municipioSlug = c.req.param('municipioSlug');

  const estado = await c.env.DB.prepare(
    'SELECT clave, nombre, slug FROM estados WHERE slug = ?'
  )
    .bind(estadoSlug)
    .first();

  if (!estado) return c.html(notFoundPage(), 404);

  const municipio = await c.env.DB.prepare(
    'SELECT nombre, slug FROM municipios WHERE clave_estado = ? AND slug = ?'
  )
    .bind(estado.clave, municipioSlug)
    .first();

  if (!municipio) return c.html(notFoundPage(), 404);

  const [codigos, municipioStats] = await Promise.all([
    c.env.DB.prepare(`
      SELECT DISTINCT codigo_postal, colonia, tipo_asentamiento, zona
      FROM codigos_postales
      WHERE clave_estado = ? AND municipio = ?
      ORDER BY codigo_postal, colonia
    `)
      .bind(estado.clave, municipio.nombre)
      .all(),
    c.env.DB.prepare(`
      SELECT COUNT(DISTINCT codigo_postal) as total_cps,
             SUM(CASE WHEN zona = 'Urbano' THEN 1 ELSE 0 END) as urbanas,
             SUM(CASE WHEN zona = 'Rural' THEN 1 ELSE 0 END) as rurales,
             SUM(CASE WHEN zona = 'Semiurbano' THEN 1 ELSE 0 END) as semiurbanas
      FROM codigos_postales
      WHERE clave_estado = ? AND municipio = ?
    `)
      .bind(estado.clave, municipio.nombre)
      .first(),
  ]);

  const stats = {
    totalCPs: (municipioStats?.total_cps as number) || 0,
    urbanas: (municipioStats?.urbanas as number) || 0,
    rurales: (municipioStats?.rurales as number) || 0,
    semiurbanas: (municipioStats?.semiurbanas as number) || 0,
  };

  return c.html(
    municipioPage(
      { nombre: estado.nombre as string, slug: estado.slug as string },
      { nombre: municipio.nombre as string, slug: municipio.slug as string },
      codigos.results as any[],
      stats
    )
  );
});

// ============================================================
// COLONIA individual
// ============================================================
app.get('/estado/:estadoSlug/:municipioSlug/colonia/:coloniaSlug', async (c) => {
  const estadoSlug = c.req.param('estadoSlug');
  const municipioSlug = c.req.param('municipioSlug');
  const coloniaSlug = c.req.param('coloniaSlug');

  const estado = await c.env.DB.prepare(
    'SELECT clave, nombre, slug FROM estados WHERE slug = ?'
  )
    .bind(estadoSlug)
    .first();

  if (!estado) return c.html(notFoundPage(), 404);

  const municipio = await c.env.DB.prepare(
    'SELECT nombre, slug, clave_estado, clave_municipio FROM municipios WHERE clave_estado = ? AND slug = ?'
  )
    .bind(estado.clave, municipioSlug)
    .first();

  if (!municipio) return c.html(notFoundPage(), 404);

  // Buscar la colonia por slug generado dinámicamente
  const allColonias = await c.env.DB.prepare(`
    SELECT DISTINCT colonia, codigo_postal, tipo_asentamiento, zona, ciudad
    FROM codigos_postales
    WHERE clave_estado = ? AND municipio = ?
    ORDER BY colonia, codigo_postal
  `)
    .bind(estado.clave, municipio.nombre)
    .all();

  // Encontrar la colonia que coincide con el slug
  const coloniaRows = allColonias.results.filter(
    (r: any) => slugify(r.colonia) === coloniaSlug
  );

  if (coloniaRows.length === 0) return c.html(notFoundPage(), 404);

  const coloniaName = (coloniaRows[0] as any).colonia;

  // Obtener coordenadas del primer CP de esta colonia
  const firstCp = (coloniaRows[0] as any).codigo_postal;
  const coords = await c.env.DB.prepare(
    'SELECT latitud, longitud FROM cp_coordenadas WHERE codigo_postal = ?'
  ).bind(firstCp).first();

  // Colonias vecinas en el mismo municipio (hasta 12, excluyendo la actual)
  const nearby = allColonias.results
    .filter((r: any) => slugify(r.colonia) !== coloniaSlug)
    .reduce((acc: any[], r: any) => {
      if (!acc.find((a: any) => a.colonia === r.colonia)) acc.push(r);
      return acc;
    }, [])
    .slice(0, 12);

  return c.html(
    coloniaPage(
      { nombre: estado.nombre as string, slug: estado.slug as string },
      { nombre: municipio.nombre as string, slug: municipio.slug as string },
      coloniaName,
      coloniaSlug,
      coloniaRows as any[],
      nearby as any[],
      coords ? { lat: coords.latitud as number, lng: coords.longitud as number } : null
    )
  );
});

// ============================================================
// CÓDIGO POSTAL individual
// ============================================================
app.get('/codigo-postal/:cp', async (c) => {
  const rawCp = c.req.param('cp');

  // Validar que sea numérico (1-5 dígitos)
  if (!/^\d{1,5}$/.test(rawCp)) return c.html(notFoundPage(), 404);

  // Normalizar a 5 dígitos con ceros a la izquierda
  const cp = rawCp.padStart(5, '0');

  // Redirigir si la URL no tiene el formato canónico de 5 dígitos
  if (rawCp !== cp) {
    return c.redirect(`/codigo-postal/${cp}`, 301);
  }

  const colonias = await c.env.DB.prepare(`
    SELECT DISTINCT colonia, tipo_asentamiento, municipio, estado, ciudad, zona, clave_estado, clave_municipio
    FROM codigos_postales
    WHERE codigo_postal = ?
    ORDER BY colonia
  `)
    .bind(cp)
    .all();

  if (colonias.results.length === 0) return c.html(notFoundPage(), 404);

  // CPs cercanos (numérico +/- rango)
  const cpNum = parseInt(cp);
  const nearbyResult = await c.env.DB.prepare(`
    SELECT DISTINCT codigo_postal 
    FROM codigos_postales 
    WHERE codigo_postal != ? 
      AND CAST(codigo_postal AS INTEGER) BETWEEN ? AND ?
    ORDER BY codigo_postal
    LIMIT 10
  `)
    .bind(cp, cpNum - 50, cpNum + 50)
    .all();

  const nearby = nearbyResult.results.map((r: any) => r.codigo_postal);

  // Obtener coordenadas para el mapa
  const coords = await c.env.DB.prepare(
    'SELECT latitud, longitud FROM cp_coordenadas WHERE codigo_postal = ?'
  ).bind(cp).first();

  // Obtener slugs para breadcrumbs
  const first: any = colonias.results[0];
  const estadoRow = await c.env.DB.prepare(
    'SELECT slug FROM estados WHERE clave = ?'
  )
    .bind(first.clave_estado)
    .first();

  const municipioRow = await c.env.DB.prepare(
    'SELECT slug FROM municipios WHERE clave_estado = ? AND clave_municipio = ?'
  )
    .bind(first.clave_estado, first.clave_municipio)
    .first();

  return c.html(
    codigoPostalPage(
      cp,
      colonias.results as any[],
      nearby,
      (estadoRow?.slug as string) || '',
      (municipioRow?.slug as string) || '',
      coords ? { lat: coords.latitud as number, lng: coords.longitud as number } : null
    )
  );
});

// ============================================================
// API DE BÚSQUEDA (para el buscador del home)
// ============================================================
app.get('/api/buscar', async (c) => {
  const q = (c.req.query('q') || '').trim();

  if (q.length < 2) {
    return c.json({ results: [] });
  }

  let results;

  if (/^\d+$/.test(q)) {
    // Búsqueda por código postal
    results = await c.env.DB.prepare(`
      SELECT DISTINCT codigo_postal, colonia, municipio, estado
      FROM codigos_postales
      WHERE codigo_postal LIKE ?
      ORDER BY codigo_postal
      LIMIT 20
    `)
      .bind(q + '%')
      .all();
  } else {
    // Búsqueda por nombre de colonia o municipio
    results = await c.env.DB.prepare(`
      SELECT DISTINCT codigo_postal, colonia, municipio, estado
      FROM codigos_postales
      WHERE colonia LIKE ? OR municipio LIKE ?
      ORDER BY colonia
      LIMIT 20
    `)
      .bind('%' + q + '%', '%' + q + '%')
      .all();
  }

  return c.json({ results: results.results });
});

// ============================================================
// AVISO LEGAL
// ============================================================
app.get('/aviso-legal', (c) => {
  return c.html(avisoLegalPage());
});

// ============================================================
// CONTACTO
// ============================================================
app.get('/contacto', (c) => {
  return c.html(contactoPage());
});

// ============================================================
// ACERCA DE
// ============================================================
app.get('/acerca-de', (c) => {
  return c.html(acercaDePage());
});

// ============================================================
// POLITICA DE PRIVACIDAD
// ============================================================
app.get('/politica-de-privacidad', (c) => {
  return c.html(politicaPrivacidadPage());
});

// ============================================================
// FORMATO DE DIRECCIÓN POSTAL
// ============================================================
app.get('/formato-direccion', (c) => {
  return c.html(formatoDireccionPage());
});

// ============================================================
// ADS.TXT (AdSense)
// ============================================================
app.get('/ads.txt', (c) => {
  return c.text('google.com, pub-3904107966422584, DIRECT, f08c47fec0942fa0');
});

// ============================================================
// ROBOTS.TXT
// ============================================================
app.get('/robots.txt', (c) => {
  return c.text(`User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap-index.xml`);
});

// ============================================================
// SITEMAP INDEX
// ============================================================
app.get('/sitemap-index.xml', async (c) => {
  const estados = await c.env.DB.prepare(
    'SELECT slug FROM estados ORDER BY nombre'
  ).all();

  const sitemaps = estados.results
    .map(
      (e: any) =>
        `  <sitemap>
    <loc>${SITE_URL}/sitemaps/${e.slug}.xml</loc>
  </sitemap>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemaps/pages.xml</loc>
  </sitemap>
${sitemaps}
</sitemapindex>`;

  return c.newResponse(xml, 200, {
    'Content-Type': 'application/xml',
  });
});

// ============================================================
// SITEMAP de páginas estáticas
// ============================================================
app.get('/sitemaps/pages.xml', async (c) => {
  const estados = await c.env.DB.prepare(
    'SELECT slug FROM estados ORDER BY nombre'
  ).all();

  const urls = [
    `  <url><loc>${SITE_URL}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    `  <url><loc>${SITE_URL}/estados</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
    `  <url><loc>${SITE_URL}/contacto</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>`,
    `  <url><loc>${SITE_URL}/acerca-de</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>`,
    `  <url><loc>${SITE_URL}/politica-de-privacidad</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>`,
    `  <url><loc>${SITE_URL}/aviso-legal</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>`,
    `  <url><loc>${SITE_URL}/formato-direccion</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
    ...estados.results.map(
      (e: any) =>
        `  <url><loc>${SITE_URL}/estado/${e.slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return c.newResponse(xml, 200, {
    'Content-Type': 'application/xml',
  });
});

// ============================================================
// SITEMAP por estado (municipios + CPs)
// ============================================================
app.get('/sitemaps/:file', async (c) => {
  const file = c.req.param('file');

  // Validar que termine en .xml y extraer el slug
  if (!file.endsWith('.xml')) return c.notFound();
  const estadoSlug = file.replace(/\.xml$/, '');

  // Excluir pages.xml (se maneja en la ruta anterior)
  if (estadoSlug === 'pages') return c.notFound();

  const estado = await c.env.DB.prepare(
    'SELECT clave FROM estados WHERE slug = ?'
  )
    .bind(estadoSlug)
    .first();

  if (!estado) return c.notFound();

  const [munRows, cpRows] = await Promise.all([
    c.env.DB.prepare(
      'SELECT slug, clave_municipio FROM municipios WHERE clave_estado = ? ORDER BY slug'
    )
      .bind(estado.clave)
      .all(),
    c.env.DB.prepare(
      'SELECT DISTINCT codigo_postal FROM codigos_postales WHERE clave_estado = ? ORDER BY codigo_postal'
    )
      .bind(estado.clave)
      .all(),
  ]);

  const munMap = new Map<string, string>();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const m of munRows.results as any[]) {
    munMap.set(String(m.clave_municipio), m.slug);
    xml += `  <url><loc>${SITE_URL}/estado/${estadoSlug}/${m.slug}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
  }

  for (const cp of cpRows.results as any[]) {
    xml += `  <url><loc>${SITE_URL}/codigo-postal/${cp.codigo_postal}</loc><changefreq>yearly</changefreq><priority>0.5</priority></url>\n`;
  }

  // Colonias únicas por municipio
  const colRows = await c.env.DB.prepare(
    'SELECT DISTINCT colonia, clave_municipio FROM codigos_postales WHERE clave_estado = ? ORDER BY clave_municipio, colonia'
  )
    .bind(estado.clave)
    .all();

  for (const col of colRows.results as any[]) {
    const mSlug = munMap.get(String(col.clave_municipio));
    if (mSlug) {
      xml += `  <url><loc>${SITE_URL}/estado/${estadoSlug}/${mSlug}/colonia/${slugify(col.colonia)}</loc><changefreq>yearly</changefreq><priority>0.5</priority></url>\n`;
    }
  }

  xml += `</urlset>`;

  return c.newResponse(xml, 200, {
    'Content-Type': 'application/xml',
  });
});

// ============================================================
// FAVICON
// ============================================================
app.get('/favicon.svg', (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#006847"/>
  <text x="50" y="68" font-size="48" font-weight="bold" text-anchor="middle" fill="white" font-family="system-ui,sans-serif">CP</text>
</svg>`;
  return c.newResponse(svg, 200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=31536000, immutable',
  });
});

// ============================================================
// 404 catch-all
// ============================================================
app.notFound((c) => {
  return c.html(notFoundPage(), 404);
});

export default app;
