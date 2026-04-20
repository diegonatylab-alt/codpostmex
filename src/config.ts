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

export const SITE_NAME = 'Buscar CP México';
export const SITE_URL = 'https://buscarcpmexico.com';
export const ADSENSE_ID = 'ca-pub-XXXXXXXXXX'; // Cambiar por ID real cuando AdSense esté aprobado: ca-pub-3904107966422584

// ============================================================
// Zonas horarias de México por clave de estado (INEGI)
// Desde oct 2022 México eliminó el horario de verano, excepto
// municipios fronterizos con EE.UU. que siguen DST de EE.UU.
// ============================================================
export interface ZonaHoraria {
  nombre: string;
  utc: string;
  utcOffset: number; // horas vs UTC en horario estándar
  abreviatura: string;
}

export const ZONAS_HORARIAS: Record<string, ZonaHoraria> = {
  sureste: { nombre: 'Tiempo del Sureste', utc: 'UTC-5', utcOffset: -5, abreviatura: 'EST' },
  centro:  { nombre: 'Tiempo del Centro', utc: 'UTC-6', utcOffset: -6, abreviatura: 'CST' },
  pacifico:{ nombre: 'Tiempo del Pacífico', utc: 'UTC-7', utcOffset: -7, abreviatura: 'MST' },
  noroeste:{ nombre: 'Tiempo del Noroeste', utc: 'UTC-8', utcOffset: -8, abreviatura: 'PST' },
};

// Mapping: clave_estado INEGI → zona horaria
// 23 = Quintana Roo (UTC-5), 02 = Baja California (UTC-8)
// 03,08,18,25,26 = Pacífico (UTC-7): BCS, Chihuahua, Nayarit, Sinaloa, Sonora
// Resto = Centro (UTC-6)
export function getZonaHoraria(claveEstado: string): ZonaHoraria & { zona: string } {
  switch (claveEstado) {
    case '23': // Quintana Roo
      return { ...ZONAS_HORARIAS.sureste, zona: 'sureste' };
    case '02': // Baja California
      return { ...ZONAS_HORARIAS.noroeste, zona: 'noroeste' };
    case '03': // Baja California Sur
    case '08': // Chihuahua
    case '18': // Nayarit
    case '25': // Sinaloa
    case '26': // Sonora
      return { ...ZONAS_HORARIAS.pacifico, zona: 'pacifico' };
    default:   // Resto del país
      return { ...ZONAS_HORARIAS.centro, zona: 'centro' };
  }
}
