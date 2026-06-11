CREATE TABLE IF NOT EXISTS agent_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'offline',
  ultimo_heartbeat TIMESTAMPTZ,
  metrica_url TEXT,
  version VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agent_registry(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  severidad VARCHAR(20) NOT NULL,
  mensaje TEXT,
  metadata JSONB DEFAULT '{}',
  resuelta BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resuelta_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS health_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID REFERENCES conjuntos(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agent_registry(id),
  estado_general VARCHAR(20),
  latencia_ms INT,
  uptime_segundos INT,
  detalles JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_agent ON agent_alerts(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severidad ON agent_alerts(severidad, resuelta);
CREATE INDEX IF NOT EXISTS idx_health_reports_conjunto ON health_reports(conjunto_id, created_at DESC);

ALTER TABLE agent_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY agent_registry_select ON agent_registry FOR SELECT USING (true);
CREATE POLICY agent_alerts_select ON agent_alerts FOR SELECT USING (true);
CREATE POLICY health_reports_select ON health_reports FOR SELECT USING (
  conjunto_id IN (SELECT user_profiles.conjunto_id FROM user_profiles WHERE id = auth.uid())
);
