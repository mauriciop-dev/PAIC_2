-- SQL Migration: Core Business Tables for PAIC IAaaS
-- Creates all tenant-aware tables needed before IA security tables.
-- Order: conjuntos (root tenant) -> dependent tables

-- ============================================================
-- 1. conjuntos (Root Tenant Table)
-- ============================================================
CREATE TABLE IF NOT EXISTS conjuntos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  nit VARCHAR(50),
  address TEXT,
  admin_name VARCHAR(255),
  admin_email VARCHAR(255),
  admin_phone VARCHAR(50),
  subscription_plan VARCHAR(20) DEFAULT 'Free',
  plan_price DECIMAL(10,2),
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS not applied directly to conjuntos; access is controlled via application-layer validation.
-- ============================================================
-- 2. user_profiles (Linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'Subscriber',
  trial_expires_at TIMESTAMPTZ,
  conjunto_id UUID REFERENCES conjuntos(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

-- ============================================================
-- 3. residents
-- ============================================================
CREATE TABLE IF NOT EXISTS residents (
  apartment VARCHAR(10) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conjunto_id, apartment)
);

CREATE INDEX idx_residents_conjunto ON residents(conjunto_id);

ALTER TABLE residents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view residents of their conjunto" ON residents
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage residents" ON residents
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 4. account_status
-- ============================================================
CREATE TABLE IF NOT EXISTS account_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  apartment VARCHAR(10) NOT NULL,
  last_payment_date DATE,
  admin_fee_value DECIMAL(10,2) DEFAULT 0,
  pending_installments INT DEFAULT 0,
  other_charges DECIMAL(10,2) DEFAULT 0,
  outstanding_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conjunto_id, apartment)
);

CREATE INDEX idx_account_status_conjunto ON account_status(conjunto_id);

ALTER TABLE account_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view account_status of their conjunto" ON account_status
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage account_status" ON account_status
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 5. providers
-- ============================================================
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  specialty VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_providers_conjunto ON providers(conjunto_id);

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view providers of their conjunto" ON providers
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage providers" ON providers
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 6. internal_staff
-- ============================================================
CREATE TABLE IF NOT EXISTS internal_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_internal_staff_conjunto ON internal_staff(conjunto_id);

ALTER TABLE internal_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view staff of their conjunto" ON internal_staff
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage staff" ON internal_staff
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 7. common_areas
-- ============================================================
CREATE TABLE IF NOT EXISTS common_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color JSONB DEFAULT '{"bg": "#dbeafe", "text": "#1e40af", "border": "#93c5fd"}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_common_areas_conjunto ON common_areas(conjunto_id);

ALTER TABLE common_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view common areas of their conjunto" ON common_areas
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage common areas" ON common_areas
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 8. reservations
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  apartment VARCHAR(10),
  resident_name VARCHAR(255),
  common_area_id UUID REFERENCES common_areas(id) ON DELETE SET NULL,
  date DATE,
  start_time TIME,
  end_time TIME,
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservations_conjunto ON reservations(conjunto_id);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view reservations of their conjunto" ON reservations
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage reservations" ON reservations
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 9. due_dates
-- ============================================================
CREATE TABLE IF NOT EXISTS due_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  item VARCHAR(255),
  category VARCHAR(100),
  due_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_due_dates_conjunto ON due_dates(conjunto_id);

ALTER TABLE due_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view due_dates of their conjunto" ON due_dates
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage due_dates" ON due_dates
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 10. tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_conjunto ON tasks(conjunto_id);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view tasks of their conjunto" ON tasks
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage tasks" ON tasks
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 11. incomes
-- ============================================================
CREATE TABLE IF NOT EXISTS incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incomes_conjunto ON incomes(conjunto_id);

ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view incomes of their conjunto" ON incomes
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage incomes" ON incomes
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 12. expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  date DATE,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_conjunto ON expenses(conjunto_id);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view expenses of their conjunto" ON expenses
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage expenses" ON expenses
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 13. visitor_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS visitor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  apartment VARCHAR(10),
  visitor_name VARCHAR(255),
  date DATE,
  status VARCHAR(50) DEFAULT 'Autorizado',
  entry_time TIMESTAMPTZ,
  exit_time TIMESTAMPTZ,
  access_point_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visitor_logs_conjunto ON visitor_logs(conjunto_id);

ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view visitor_logs of their conjunto" ON visitor_logs
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage visitor_logs" ON visitor_logs
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 14. package_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS package_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  apartment VARCHAR(10),
  courier VARCHAR(255),
  tracking_number VARCHAR(255),
  received_date TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'En recepción',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_package_logs_conjunto ON package_logs(conjunto_id);

ALTER TABLE package_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view package_logs of their conjunto" ON package_logs
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage package_logs" ON package_logs
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 15. access_points
-- ============================================================
CREATE TABLE IF NOT EXISTS access_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_access_points_conjunto ON access_points(conjunto_id);

ALTER TABLE access_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view access_points of their conjunto" ON access_points
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage access_points" ON access_points
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 16. user_roles (Custom Role Definitions)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_roles_conjunto ON user_roles(conjunto_id);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view roles of their conjunto" ON user_roles
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage roles" ON user_roles
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 17. users (Platform Users - internal login per conjunto)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(50),
  role VARCHAR(100),
  password VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_platform_users_conjunto ON users(conjunto_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view platform users of their conjunto" ON users
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage platform users" ON users
  FOR ALL USING (
    conjunto_id IN (
      SELECT conjunto_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- Stored Procedures / RPCs
-- ============================================================

-- Get debtors for a conjunto
CREATE OR REPLACE FUNCTION get_debtors(p_conjunto_id UUID)
RETURNS TABLE(apartment VARCHAR, name VARCHAR, balance DECIMAL)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT r.apartment, r.name, a.outstanding_balance
  FROM residents r
  JOIN account_status a ON a.conjunto_id = r.conjunto_id AND a.apartment = r.apartment
  WHERE r.conjunto_id = p_conjunto_id
    AND a.outstanding_balance > 0
  ORDER BY a.outstanding_balance DESC;
END;
$$;

-- Get dashboard summary
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_conjunto_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_residents', (SELECT COUNT(*) FROM residents WHERE conjunto_id = p_conjunto_id),
    'total_debtors', (SELECT COUNT(*) FROM get_debtors(p_conjunto_id)),
    'total_packages', (SELECT COUNT(*) FROM package_logs WHERE conjunto_id = p_conjunto_id),
    'total_visitors', (SELECT COUNT(*) FROM visitor_logs WHERE conjunto_id = p_conjunto_id),
    'total_income', (SELECT COALESCE(SUM(amount), 0) FROM incomes WHERE conjunto_id = p_conjunto_id),
    'total_expenses', (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE conjunto_id = p_conjunto_id)
  ) INTO result;
  RETURN result;
END;
$$;

-- Get financial chart data
CREATE OR REPLACE FUNCTION get_financial_chart_data(p_conjunto_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'incomes', (SELECT jsonb_agg(jsonb_build_object('date', date, 'amount', amount, 'category', category))
                FROM incomes WHERE conjunto_id = p_conjunto_id ORDER BY date DESC),
    'expenses', (SELECT jsonb_agg(jsonb_build_object('date', date, 'amount', amount, 'category', category))
                 FROM expenses WHERE conjunto_id = p_conjunto_id ORDER BY date DESC)
  ) INTO result;
  RETURN result;
END;
$$;

-- Authenticate platform user by email and password
CREATE OR REPLACE FUNCTION authenticate_platform_user(_email TEXT, _password TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_record users%ROWTYPE;
  result JSONB;
BEGIN
  SELECT * INTO user_record FROM users WHERE email = _email AND password = _password LIMIT 1;
  IF user_record.id IS NULL THEN
    RETURN NULL;
  END IF;
  result := jsonb_build_object(
    'id', user_record.id,
    'name', user_record.name,
    'email', user_record.email,
    'role', user_record.role,
    'conjunto_id', user_record.conjunto_id,
    'phone_number', user_record.phone_number
  );
  RETURN result;
END;
$$;

-- Update platform user password
CREATE OR REPLACE FUNCTION update_user_password(user_id UUID, new_password TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE users SET password = new_password, updated_at = NOW() WHERE id = user_id;
END;
$$;

-- Get platform-wide stats for super admin
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_conjuntos', (SELECT COUNT(*) FROM conjuntos),
    'total_residents', (SELECT COUNT(*) FROM residents),
    'total_users', (SELECT COUNT(*) FROM user_profiles),
    'total_income', (SELECT COALESCE(SUM(amount), 0) FROM incomes),
    'total_expenses', (SELECT COALESCE(SUM(amount), 0) FROM expenses)
  ) INTO result;
  RETURN result;
END;
$$;

-- Get super admin chart data
CREATE OR REPLACE FUNCTION get_super_admin_charts()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'conjuntos', (SELECT jsonb_agg(jsonb_build_object('name', name, 'id', id)) FROM conjuntos ORDER BY name),
    'revenue', (SELECT jsonb_agg(jsonb_build_object('month', to_char(date, 'YYYY-MM'), 'total', SUM(amount)))
                FROM incomes GROUP BY to_char(date, 'YYYY-MM') ORDER BY to_char(date, 'YYYY-MM'))
  ) INTO result;
  RETURN result;
END;
$$;
