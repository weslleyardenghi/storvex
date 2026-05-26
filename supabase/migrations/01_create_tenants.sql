-- ============================================================================
-- TABELA: TENANTS (Empresas)
-- Armazena informações de cada empresa que vai usar o StorVex
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações Básicas
  name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  website TEXT,
  
  -- Dados da Empresa
  cnpj TEXT UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Brasil',
  
  -- Plano e Status
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trial', 'suspended')),
  
  -- Limites
  max_users INTEGER DEFAULT 10,
  max_storage_gb INTEGER DEFAULT 100,
  max_locations INTEGER DEFAULT 50,
  max_pallets INTEGER DEFAULT 1000,
  
  -- Datas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  logo_url TEXT,
  custom_domain TEXT UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  notes TEXT
);

CREATE INDEX idx_tenants_status ON public.tenants(status);
CREATE INDEX idx_tenants_plan ON public.tenants(plan);
CREATE INDEX idx_tenants_email ON public.tenants(email);
CREATE INDEX idx_tenants_cnpj ON public.tenants(cnpj);
CREATE INDEX idx_tenants_created_at ON public.tenants(created_at);

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS last_access_at TIMESTAMP WITH TIME ZONE;

CREATE OR REPLACE FUNCTION public.update_tenants_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tenants_update_timestamp ON public.tenants;
CREATE TRIGGER tenants_update_timestamp
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tenants_timestamp();

COMMENT ON TABLE public.tenants IS 'Tabela de empresas/clientes do SaaS StorVex';
COMMENT ON COLUMN public.tenants.id IS 'ID único da empresa';
COMMENT ON COLUMN public.tenants.name IS 'Nome da empresa (único)';
COMMENT ON COLUMN public.tenants.plan IS 'Plano de preço: starter, professional ou enterprise';
COMMENT ON COLUMN public.tenants.status IS 'Status de atividade da empresa';