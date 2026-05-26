-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Políticas de Segurança Multi-Tenant
-- Garante que cada empresa veja apenas seus próprios dados
-- ============================================================================

-- TENANTS TABLE
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Admin (você) pode ver todas as empresas
CREATE POLICY "admin_can_view_all_tenants" ON public.tenants
  FOR SELECT USING (auth.uid()::text = 'admin' OR auth.role() = 'service_role');

-- Apenas admin pode criar empresas
CREATE POLICY "admin_can_create_tenants" ON public.tenants
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Apenas admin pode atualizar empresas
CREATE POLICY "admin_can_update_tenants" ON public.tenants
  FOR UPDATE USING (auth.role() = 'service_role');

-- Apenas admin pode deletar empresas
CREATE POLICY "admin_can_delete_tenants" ON public.tenants
  FOR DELETE USING (auth.role() = 'service_role');

-- ============================================================================
-- TENANT_USERS TABLE
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios acessos
CREATE POLICY "users_can_view_own_tenant_access" ON public.tenant_users
  FOR SELECT USING (user_id = auth.uid());

-- Admins da empresa podem gerenciar usuários
CREATE POLICY "tenant_admins_can_manage_users" ON public.tenant_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tenant_users
      WHERE tenant_id = tenant_users.tenant_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================================================
-- TENANT_SETTINGS TABLE
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;

-- Admins podem ler configurações
CREATE POLICY "tenant_admins_can_view_settings" ON public.tenant_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tenant_users
      WHERE tenant_id = tenant_settings.tenant_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- Admins podem atualizar configurações
CREATE POLICY "tenant_admins_can_update_settings" ON public.tenant_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tenant_users
      WHERE tenant_id = tenant_settings.tenant_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================================================
-- AUDIT_LOGS TABLE
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins podem ver logs de sua empresa
CREATE POLICY "tenant_admins_can_view_logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tenant_users
      WHERE tenant_id = audit_logs.tenant_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- Sistema pode inserir logs
CREATE POLICY "system_can_insert_logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');