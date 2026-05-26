-- ============================================================================
-- TABELA: TENANT_SETTINGS (Configurações por Empresa)
-- Armazena preferências e configurações de cada empresa
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamento
  tenant_id UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Configurações Gerais
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'pt-BR' CHECK (language IN ('pt-BR', 'en-US', 'es-ES')),
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  
  -- Configurações de Segurança
  require_2fa BOOLEAN DEFAULT FALSE,
  ip_whitelist TEXT,
  session_timeout_minutes INTEGER DEFAULT 30,
  
  -- Configurações de Features
  features_enabled JSONB DEFAULT '{"offline_mode": true, "real_time_sync": true, "analytics": true}'::jsonb,
  
  -- Notificações
  email_notifications BOOLEAN DEFAULT TRUE,
  slack_webhook_url TEXT,
  
  -- Datas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenant_settings_tenant_id ON public.tenant_settings(tenant_id);

CREATE OR REPLACE FUNCTION public.update_tenant_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tenant_settings_update_timestamp ON public.tenant_settings;
CREATE TRIGGER tenant_settings_update_timestamp
  BEFORE UPDATE ON public.tenant_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tenant_settings_timestamp();

COMMENT ON TABLE public.tenant_settings IS 'Configurações e preferências de cada empresa';