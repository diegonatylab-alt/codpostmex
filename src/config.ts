// Utilidades para generar slugs y helpers SEO

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function capitalize(text: string): string {
  return text.replace(/\b\w/g, c => c.toUpperCase());
}

export const SITE_NAME = 'CodigosPostalesMX';
export const SITE_URL = 'https://codigospostalesmx.com'; // Cambiar por tu dominio real
export const ADSENSE_ID = 'ca-pub-XXXXXXXXXX'; // Cambiar por tu ID de AdSense real
