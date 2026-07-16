-- Habilitar extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  link text NOT NULL,
  image text,
  store text NOT NULL,
  category text NOT NULL DEFAULT 'Otros',
  sub_category text,
  brand text,
  product_id text,
  description text,
  scraped_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store, product_id)
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_products_scraped_at ON products(scraped_at DESC);

-- Tabla de ejecuciones de scraping
CREATE TABLE IF NOT EXISTS scraping_runs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store text NOT NULL,
  run_date date NOT NULL,
  total_products integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scraping_runs_store ON scraping_runs(store);
CREATE INDEX IF NOT EXISTS idx_scraping_runs_date ON scraping_runs(run_date DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS básicas (opcional, desactivado por defecto para el prototype)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON scraping_runs FOR ALL USING (true) WITH CHECK (true);
