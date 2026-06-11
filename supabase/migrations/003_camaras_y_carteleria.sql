-- SQL Migration: IAaaS Phase 3 - Cameras & Digital Signage
-- Creates tables for camera management, LPR events, and digital signage content.

-- 1. Create camaras table
CREATE TABLE IF NOT EXISTS camaras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  ubicacion VARCHAR(255),
  rtsp_url TEXT NOT NULL,
  stream_key VARCHAR(255),
  modelo VARCHAR(100),
  ubicacion_fisica VARCHAR(50),
  activa BOOLEAN DEFAULT TRUE,
  resolucion VARCHAR(20) DEFAULT '1920x1080',
  fps INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camaras_conjunto ON camaras(conjunto_id);

-- 2. Create lpr_events table (License Plate Recognition)
CREATE TABLE IF NOT EXISTS lpr_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  camara_id UUID REFERENCES camaras(id) ON DELETE SET NULL,
  placa VARCHAR(20),
  confianza DECIMAL(3,2),
  residencia_id UUID,
  accion VARCHAR(50),
  imagen_url TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lpr_conjunto ON lpr_events(conjunto_id, timestamp DESC);

-- 3. Create carteleria_contenidos table (Digital signage content)
CREATE TABLE IF NOT EXISTS carteleria_contenidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT,
  tipo VARCHAR(50) DEFAULT 'texto',
  media_url TEXT,
  prioridad INT DEFAULT 0,
  vigente_desde TIMESTAMPTZ DEFAULT NOW(),
  vigente_hasta TIMESTAMPTZ,
  estado VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carteleria_conjunto ON carteleria_contenidos(conjunto_id);

-- 4. Create carteleria_displays table
CREATE TABLE IF NOT EXISTS carteleria_displays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  ubicacion VARCHAR(255),
  resolucion VARCHAR(20) DEFAULT '1920x1080',
  device_type VARCHAR(50),
  device_id VARCHAR(255) UNIQUE,
  estado VARCHAR(20) DEFAULT 'online',
  ultima_sincronizacion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_displays_conjunto ON carteleria_displays(conjunto_id);

-- 5. Create carteleria_schedule table
CREATE TABLE IF NOT EXISTS carteleria_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id UUID NOT NULL REFERENCES carteleria_displays(id) ON DELETE CASCADE,
  contenido_id UUID NOT NULL REFERENCES carteleria_contenidos(id) ON DELETE CASCADE,
  posicion INT DEFAULT 0,
  duracion_segundos INT DEFAULT 30,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS
ALTER TABLE camaras ENABLE ROW LEVEL SECURITY;
ALTER TABLE lpr_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE carteleria_contenidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carteleria_displays ENABLE ROW LEVEL SECURITY;
ALTER TABLE carteleria_schedule ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
CREATE POLICY "Usuarios ven camaras de su conjunto" ON camaras
  FOR SELECT USING (
    conjunto_id IN (SELECT conjuntoId FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins pueden insertar camaras" ON camaras
  FOR INSERT WITH CHECK (
    conjunto_id IN (SELECT conjuntoId FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins pueden actualizar camaras" ON camaras
  FOR UPDATE USING (
    conjunto_id IN (SELECT conjuntoId FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Usuarios ven eventos LPR de su conjunto" ON lpr_events
  FOR SELECT USING (
    conjunto_id IN (SELECT conjuntoId FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Usuarios ven contenidos de su conjunto" ON carteleria_contenidos
  FOR SELECT USING (
    conjunto_id IN (SELECT conjuntoId FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins pueden gestionar contenidos" ON carteleria_contenidos
  FOR INSERT WITH CHECK (
    conjunto_id IN (SELECT conjuntoId FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins pueden actualizar contenidos" ON carteleria_contenidos
  FOR UPDATE USING (
    conjunto_id IN (SELECT conjuntoId FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Usuarios ven displays de su conjunto" ON carteleria_displays
  FOR SELECT USING (
    conjunto_id IN (SELECT conjuntoId FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins pueden gestionar displays" ON carteleria_displays
  FOR INSERT WITH CHECK (
    conjunto_id IN (SELECT conjuntoId FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Usuarios ven schedule de su conjunto" ON carteleria_schedule
  FOR SELECT USING (
    display_id IN (SELECT id FROM carteleria_displays WHERE conjunto_id IN (SELECT conjuntoId FROM user_profiles WHERE id = auth.uid()))
  );
