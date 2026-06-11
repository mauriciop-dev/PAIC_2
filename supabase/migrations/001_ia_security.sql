-- SQL Migration: IAaaS Phase 1 Hardening
-- Creates tables for tracking IA usage and custom chatbot prompts per conjunto.

-- 1. Create ia_usage table
CREATE TABLE IF NOT EXISTS ia_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  prompt_tokens INT NOT NULL,
  completion_tokens INT NOT NULL,
  total_cost DECIMAL(10, 6) DEFAULT 0.0,
  model_used VARCHAR(50) NOT NULL,
  executed_tool VARCHAR(100) DEFAULT 'none',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries on usage stats per conjunto
CREATE INDEX IF NOT EXISTS idx_ia_usage_conjunto ON ia_usage(conjunto_id, created_at DESC);

-- Enable RLS
ALTER TABLE ia_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own conjunto's IA usage
CREATE POLICY "Users see only their conjunto's IA usage" ON ia_usage
  FOR SELECT USING (
    conjunto_id IN (
      SELECT user_profiles.conjunto_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

-- 2. Create ia_config table
CREATE TABLE IF NOT EXISTS ia_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL UNIQUE REFERENCES conjuntos(id) ON DELETE CASCADE,
  system_prompt TEXT,
  custom_tools JSONB DEFAULT '[]',
  tone VARCHAR(50) DEFAULT 'formal', -- formal, amigable, técnico
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ia_config ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can update/select their own conjunto's IA configuration
CREATE POLICY "Admins manage their conjunto's IA config" ON ia_config
  FOR ALL USING (
    conjunto_id IN (
      SELECT user_profiles.conjunto_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Helper function to log chatbot interactions
CREATE OR REPLACE FUNCTION log_chatbot_interaction(p_conjunto_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO ia_usage (conjunto_id, prompt_tokens, completion_tokens, model_used, executed_tool)
  VALUES (p_conjunto_id, 0, 0, 'interaction_log', 'chatbot_interaction');
END;
$$;
