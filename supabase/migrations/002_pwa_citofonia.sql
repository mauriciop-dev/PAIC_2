-- ===========================================================
-- Fase 2: PWA + Citofonía Virtual
-- ===========================================================

-- Tabla para registrar push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  subscription_endpoint TEXT NOT NULL UNIQUE,
  auth_secret TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_push_user_conjunto ON push_subscriptions(user_id, conjunto_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus propias subscripciones" ON push_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuarios crean sus propias subscripciones" ON push_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios eliminan sus propias subscripciones" ON push_subscriptions
  FOR DELETE USING (user_id = auth.uid());

-- Tabla para calls WebRTC (con histórico)
CREATE TABLE IF NOT EXISTS citofonia_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  residente_id UUID REFERENCES auth.users(id),
  porteria_user_id UUID REFERENCES auth.users(id),
  inicio TIMESTAMPTZ DEFAULT NOW(),
  fin TIMESTAMPTZ,
  duracion_segundos INT,
  estado VARCHAR(20) DEFAULT 'pending',
  connection_quality VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE citofonia_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Personal de portería ve calls de su conjunto" ON citofonia_calls
  FOR SELECT USING (
    conjunto_id IN (SELECT conjunto_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Personal de portería crea calls" ON citofonia_calls
  FOR INSERT WITH CHECK (
    conjunto_id IN (SELECT conjunto_id FROM user_profiles WHERE id = auth.uid())
  );

-- Tabla de autorizaciones de visitas (más detallado)
CREATE TABLE IF NOT EXISTS visita_autorizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  visitante_id UUID,
  residente_id UUID,
  apartamento VARCHAR(10),
  motivo TEXT,
  autorizado BOOLEAN DEFAULT FALSE,
  notificacion_push_id UUID REFERENCES push_subscriptions(id),
  creada_at TIMESTAMPTZ DEFAULT NOW(),
  expirada_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
  respondida_at TIMESTAMPTZ
);

ALTER TABLE visita_autorizaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Residentes ven autorizaciones de su apartamento" ON visita_autorizaciones
  FOR SELECT USING (
    conjunto_id IN (SELECT conjunto_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Personal de portería crea autorizaciones" ON visita_autorizaciones
  FOR INSERT WITH CHECK (
    conjunto_id IN (SELECT conjunto_id FROM user_profiles WHERE id = auth.uid())
  );
