CREATE TABLE IF NOT EXISTS cp_coordenadas (
  codigo_postal TEXT PRIMARY KEY,
  latitud REAL NOT NULL,
  longitud REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cp_coord_lat ON cp_coordenadas(latitud);
CREATE INDEX IF NOT EXISTS idx_cp_coord_lng ON cp_coordenadas(longitud);
