# 📮 Buscar CP México

Sitio web de consulta de códigos postales de México, optimizado para SEO y monetización con AdSense.

**Stack:** Cloudflare Workers + Hono + D1 (SQLite) — $0/mes  
**Deploy:** Automático desde GitHub → Cloudflare Pages

---

## Requisitos Previos

1. **Node.js** (v18+): https://nodejs.org/
2. **Cuenta de Cloudflare** (gratuita): https://dash.cloudflare.com/sign-up
3. **Cuenta de GitHub** (gratuita): https://github.com/

---

## Instalación paso a paso

### 1. Instalar Node.js

Descargá e instalá Node.js LTS desde https://nodejs.org/  
Después de instalar, **cerrá y volvé a abrir la terminal** y verificá:

```bash
node --version    # v18.x.x o superior
npm --version     # 9.x.x o superior
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Autenticarte en Cloudflare

```bash
npx wrangler login
```

Se abrirá el navegador para que autorices tu cuenta.

### 4. Crear la base de datos D1

```bash
npx wrangler d1 create codigos-postales-db
```

Esto te dará un **database_id**. Copialo y pegalo en `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "codigos-postales-db"
database_id = "PEGA-TU-ID-AQUI"
```

### 5. Crear las tablas (local)

```bash
npm run db:migrate
```

### 6. Importar datos de prueba (local)

```bash
npm run db:seed
```

### 7. Correr en modo desarrollo

```bash
npm run dev
```

Abrí http://localhost:8787 en tu navegador. ¡Listo!

---

## Subir a GitHub + Deploy Automático

### 1. Crear el repositorio en GitHub

```bash
git init
git add .
git commit -m "Initial commit: Códigos Postales MX"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/codigos-postales-mx.git
git push -u origin main
```

### 2. Conectar GitHub con Cloudflare (una sola vez)

1. Ir a **Cloudflare Dashboard** → **Workers & Pages** → **Create**
2. Pestaña **"Connect to Git"**
3. Seleccionar tu repositorio de GitHub
4. Configurar:
   - **Framework preset:** None
   - **Build command:** `npm install`
   - **Build output directory:** (dejar vacío)
5. En **Environment variables**, agregar si es necesario
6. Click en **Deploy**

### 3. Flujo de trabajo diario

A partir de ahora, cada vez que hagas cambios:

```bash
git add .
git commit -m "descripción del cambio"
git push
```

**Cloudflare detecta el push automáticamente y redespliega en ~30 segundos.** No tenés que hacer nada más.

---

## Desplegar manualmente (alternativa)

## Desplegar manualmente (alternativa)

Si preferís no conectar GitHub, siempre podés desplegar manualmente:

### 1. Crear tablas en producción

```bash
npm run db:migrate:remote
```

### 2. Importar datos en producción

```bash
npm run db:seed:remote
```

### 3. Desplegar el Worker

```bash
npm run deploy
```

Tu sitio estará en `https://codigos-postales-mx.TU-USUARIO.workers.dev`

---

## Importar datos completos de SEPOMEX

El archivo de muestra tiene ~80 registros para testing. Para los datos completos (~140,000):

1. Andá a: https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Descarga.aspx
2. Descargá el archivo de texto
3. Renombralo a `CPdescarga.txt`
4. Colocalo en la carpeta `/data/`
5. Ejecutá:

```bash
npm run db:seed           # local
npm run db:seed:remote    # producción
```

---

## Agregar coordenadas geográficas (opcional)

Para habilitar mapas y búsqueda GPS, necesitas agregar coordenadas a la base de datos:

### 1. Crear la tabla de coordenadas

```bash
npm run db:migrate:coords          # local
npm run db:migrate:coords:remote   # producción
```

### 2. Descargar datos de GeoNames

```bash
npm run geo:download
```

Esto descarga las coordenadas de códigos postales de México desde GeoNames (gratis).

> **Nota:** El script de descarga requiere `unzip` en el sistema. Está disponible por defecto en macOS y Linux. En Windows, instalalo con `choco install unzip` o usá WSL.

### 3. Importar coordenadas

```bash
npm run geo:enrich          # local
npm run geo:enrich:remote   # producción
```

---

## Dominio personalizado

1. Comprá un dominio (ej: codigospostalesmx.com) en Cloudflare Registrar (~$10/año)
2. En el dashboard de Cloudflare > Workers > tu worker > Settings > Triggers
3. Agregá tu dominio como "Custom Domain"
4. Actualizá `SITE_URL` en `src/config.ts`

---

## Configurar AdSense

1. Andá a https://adsense.google.com/
2. Agregá tu sitio y esperá la aprobación (necesitás algo de contenido y tráfico)
3. Una vez aprobado, copiá tu ID de publicador (`ca-pub-XXXXXXXXXX`)
4. Pegalo en `src/config.ts` en la variable `ADSENSE_ID`
5. Redesplegá: `npm run deploy`

---

## Estructura del proyecto

```
├── wrangler.toml         # Config de Cloudflare Workers + D1
├── schema.sql            # Esquema de la base de datos
├── data/
│   └── sample-sepomex.txt  # Datos de prueba (80 registros)
├── scripts/
│   └── seed.js           # Script de importación de datos
└── src/
    ├── index.ts          # Rutas principales (Hono)
    ├── templates.ts      # Templates HTML con SEO
    └── config.ts         # Configuración (dominio, AdSense)
```

## URLs generadas

| URL | Descripción |
|-----|-------------|
| `/` | Home con buscador y lista de estados |
| `/estados` | Lista de 32 estados |
| `/estado/:slug` | Municipios de un estado |
| `/estado/:estado/:municipio` | Colonias/CPs de un municipio |
| `/codigo-postal/:cp` | Página individual de un CP |
| `/api/buscar?q=...` | API de búsqueda (JSON) |
| `/sitemap-index.xml` | Sitemap index |
| `/sitemaps/:estado.xml` | Sitemap por estado |
| `/robots.txt` | Robots.txt |

## Costos

| Concepto | Costo |
|----------|-------|
| Cloudflare Workers (free) | $0 |
| Cloudflare D1 (free) | $0 |
| Dominio .com | ~$10/año |
| **Total** | **~$0.83/mes** |
