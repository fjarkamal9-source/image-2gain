CREATE TABLE IF NOT EXISTS venues_cache (
  id SERIAL PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  nom TEXT NOT NULL,
  commune TEXT,
  activites TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS venues_cache_coords
  ON venues_cache (lat, lng);

ALTER TABLE venues_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "venues_cache_read" ON venues_cache
  FOR SELECT USING (true);
