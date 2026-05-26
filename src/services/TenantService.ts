import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface TenantData {
  name: string;
  email: string;
  phone?: string | null;
  cnpj?: string | null;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'trial' | 'suspended';
  max_users: number;
  max_storage_gb: number;
  max_locations: number;
  max_pallets: number;
}

export default class TenantService {
  /**
   * Obter todas as empresas
   */
  static async getAllTenants() {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Obter uma empresa específica
   */
  static async getTenant(id: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Criar nova empresa
   */
  static async createTenant(tenantData: TenantData) {
    const { data, error } = await supabase
      .from('tenants')
      .insert([
        {
          ...tenantData,
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Atualizar empresa
   */
  static async updateTenant(id: string, updates: Partial<TenantData>) {
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deletar empresa
   */
  static async deleteTenant(id: string) {
    const { error } = await supabase.from('tenants').delete().eq('id', id);

    if (error) throw error;
  }

  /**
   * Criar configurações padrão para empresa
   */
  static async createTenantSettings(tenantId: string) {
    const { data, error } = await supabase
      .from('tenant_settings')
      .insert([
        {
          tenant_id: tenantId,
          theme: 'dark',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          features_enabled: {
            offline_mode: true,
            real_time_sync: true,
            analytics: true,
          },
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obter configurações da empresa
   */
  static async getTenantSettings(tenantId: string) {
    const { data, error } = await supabase
      .from('tenant_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Atualizar configurações da empresa
   */
  static async updateTenantSettings(tenantId: string, updates: any) {
    const { data, error } = await supabase
      .from('tenant_settings')
      .update(updates)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Ativar/Desativar empresa
   */
  static async toggleTenantStatus(id: string) {
    const tenant = await this.getTenant(id);
    const newStatus = tenant.status === 'active' ? 'inactive' : 'active';
    return this.updateTenant(id, { status: newStatus });
  }

  /**
   * Registrar ação em auditoria
   */
  static async logAudit(
    tenantId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    changes?: any
  ) {
    const { error } = await supabase.from('audit_logs').insert([
      {
        tenant_id: tenantId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        changes,
      },
    ]);

    if (error) console.error('Erro ao registrar auditoria:', error);
  }

  /**
   * Obter logs de auditoria
   */
  static async getAuditLogs(tenantId: string, limit = 50) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}