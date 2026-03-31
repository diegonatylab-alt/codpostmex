-- Tabla principal de códigos postales
CREATE TABLE IF NOT EXISTS codigos_postales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_postal TEXT NOT NULL,
  colonia TEXT NOT NULL,
  tipo_asentamiento TEXT NOT NULL,
  municipio TEXT NOT NULL,
  estado TEXT NOT NULL,
  ciudad TEXT,
  clave_estado TEXT NOT NULL,
  clave_municipio TEXT NOT NULL,
  zona TEXT -- Urbano / Rural / Semiurbano
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_codigo_postal ON codigos_postales(codigo_postal);
CREATE INDEX IF NOT EXISTS idx_estado ON codigos_postales(clave_estado);
CREATE INDEX IF NOT EXISTS idx_municipio ON codigos_postales(clave_estado, clave_municipio);
CREATE INDEX IF NOT EXISTS idx_colonia ON codigos_postales(colonia);

-- Tabla de estados (para navegación y sitemaps)
CREATE TABLE IF NOT EXISTS estados (
  clave TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

-- Tabla de municipios (para navegación y sitemaps)
CREATE TABLE IF NOT EXISTS municipios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clave_estado TEXT NOT NULL,
  clave_municipio TEXT NOT NULL,
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL,
  UNIQUE(clave_estado, clave_municipio),
  FOREIGN KEY (clave_estado) REFERENCES estados(clave)
);

CREATE INDEX IF NOT EXISTS idx_municipio_estado ON municipios(clave_estado);

-- Insertar los 32 estados de México
INSERT OR IGNORE INTO estados (clave, nombre, slug) VALUES
  ('01', 'Aguascalientes', 'aguascalientes'),
  ('02', 'Baja California', 'baja-california'),
  ('03', 'Baja California Sur', 'baja-california-sur'),
  ('04', 'Campeche', 'campeche'),
  ('05', 'Coahuila de Zaragoza', 'coahuila'),
  ('06', 'Colima', 'colima'),
  ('07', 'Chiapas', 'chiapas'),
  ('08', 'Chihuahua', 'chihuahua'),
  ('09', 'Ciudad de México', 'ciudad-de-mexico'),
  ('10', 'Durango', 'durango'),
  ('11', 'Guanajuato', 'guanajuato'),
  ('12', 'Guerrero', 'guerrero'),
  ('13', 'Hidalgo', 'hidalgo'),
  ('14', 'Jalisco', 'jalisco'),
  ('15', 'Estado de México', 'estado-de-mexico'),
  ('16', 'Michoacán de Ocampo', 'michoacan'),
  ('17', 'Morelos', 'morelos'),
  ('18', 'Nayarit', 'nayarit'),
  ('19', 'Nuevo León', 'nuevo-leon'),
  ('20', 'Oaxaca', 'oaxaca'),
  ('21', 'Puebla', 'puebla'),
  ('22', 'Querétaro', 'queretaro'),
  ('23', 'Quintana Roo', 'quintana-roo'),
  ('24', 'San Luis Potosí', 'san-luis-potosi'),
  ('25', 'Sinaloa', 'sinaloa'),
  ('26', 'Sonora', 'sonora'),
  ('27', 'Tabasco', 'tabasco'),
  ('28', 'Tamaulipas', 'tamaulipas'),
  ('29', 'Tlaxcala', 'tlaxcala'),
  ('30', 'Veracruz de Ignacio de la Llave', 'veracruz'),
  ('31', 'Yucatán', 'yucatan'),
  ('32', 'Zacatecas', 'zacatecas');
