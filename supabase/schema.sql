-- CIERRES PORTAL - Database Schema
-- Pega esto en Supabase > SQL Editor > New Query > Run

-- Operaciones (cierres)
CREATE TABLE IF NOT EXISTS operaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'fideicomiso',
  pin TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'activa',
  imagen_fondo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partes (compradores/vendedores)
CREATE TABLE IF NOT EXISTS partes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operacion_id UUID REFERENCES operaciones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('comprador', 'vendedor')),
  tipo TEXT NOT NULL CHECK (tipo IN ('fisica', 'moral')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documentos
CREATE TABLE IF NOT EXISTS documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operacion_id UUID REFERENCES operaciones(id) ON DELETE CASCADE,
  party_id UUID REFERENCES partes(id) ON DELETE CASCADE,
  categoria TEXT,
  nombre_doc_es TEXT NOT NULL,
  nombre_doc_en TEXT NOT NULL,
  requerido BOOLEAN DEFAULT true,
  archivo_url TEXT,
  subido_por TEXT,
  fecha_subida TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cierres-docs', 'cierres-docs', false) 
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE operaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE partes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Policies: allow anon read (PIN validation happens in app code)
CREATE POLICY "anon_read_operaciones" ON operaciones FOR SELECT USING (true);
CREATE POLICY "anon_read_partes" ON partes FOR SELECT USING (true);
CREATE POLICY "anon_read_documentos" ON documentos FOR SELECT USING (true);
CREATE POLICY "anon_update_documentos" ON documentos FOR UPDATE USING (true);

-- Storage policies
CREATE POLICY "anon_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cierres-docs');
CREATE POLICY "anon_read_files" ON storage.objects FOR SELECT USING (bucket_id = 'cierres-docs');

-- Seed: Coral and Sandy operation
INSERT INTO operaciones (id, nombre, tipo, pin, status, imagen_fondo) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'Coral and Sandy', 'fideicomiso', '143414', 'activa', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80');

-- Seed: Parties
INSERT INTO partes (id, operacion_id, nombre, rol, tipo) VALUES
('p0000001-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'Coral', 'comprador', 'fisica'),
('p0000002-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'Sandy', 'comprador', 'fisica'),
('p0000003-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'Eco Inmuebles de la Bahía, S. de R.L. de C.V.', 'vendedor', 'moral');
