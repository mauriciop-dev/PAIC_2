-- Tabla de memoria persistente para ODÍN
CREATE TABLE IF NOT EXISTS odin_memoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('conversacion', 'decision', 'hecho', 'contexto')),
  contenido TEXT NOT NULL,
  conjunto_id UUID REFERENCES conjuntos(id) ON DELETE CASCADE,
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_odin_memoria_conjunto ON odin_memoria(conjunto_id);
CREATE INDEX IF NOT EXISTS idx_odin_memoria_tipo ON odin_memoria(tipo);
CREATE INDEX IF NOT EXISTS idx_odin_memoria_created ON odin_memoria(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_odin_memoria_contenido_gin ON odin_memoria USING GIN(to_tsvector('spanish', contenido));

-- RLS
ALTER TABLE odin_memoria ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Admin full access" ON odin_memoria
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users read own conjunto" ON odin_memoria
  FOR SELECT USING (
    conjunto_id IN (
      SELECT id FROM conjuntos WHERE id = odin_memoria.conjunto_id
    )
  );

CREATE POLICY "Users can insert" ON odin_memoria
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
