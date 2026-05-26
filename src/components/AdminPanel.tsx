import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import TenantManager from './TenantManager';
import TenantDashboard from './TenantDashboard';
import TenantService from '../services/TenantService';

interface Tenant {
  id: string;
  name: string;
  email: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'trial' | 'suspended';
  max_users: number;
  created_at: string;
  users_count?: number;
  storage_used?: number;
}

export default function AdminPanel() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'manage'>('dashboard');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await TenantService.getAllTenants();
      setTenants(data);
    } catch (error) {
      console.error('Erro ao carregar tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (tenant: Tenant) => {
    try {
      const newStatus = tenant.status === 'active' ? 'inactive' : 'active';
      await TenantService.updateTenant(tenant.id, { status: newStatus });
      loadTenants();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que quer deletar esta empresa?')) {
      try {
        await TenantService.deleteTenant(id);
        loadTenants();
      } catch (error) {
        console.error('Erro ao deletar:', error);
      }
    }
  };

  if (view === 'dashboard') {
    return (
      <TenantDashboard
        tenants={tenants}
        onViewDetails={(tenant) => {
          setSelectedTenant(tenant);
          setView('manage');
        }}
        onRefresh={loadTenants}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Painel de Controle StorVex</h1>
            <p className="text-slate-400 mt-2">Gerenciar empresas e acessos</p>
          </div>
          <button
            onClick={() => setView('dashboard')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
          >
            ← Voltar ao Dashboard
          </button>
        </div>

        {/* Abas */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => {
              setShowForm(false);
              setView('manage');
            }}
            className={`px-4 py-2 font-medium ${
              !showForm
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400'
            }`}
          >
            Empresas
          </button>
          <button
            onClick={() => setShowForm(true)}
            className={`px-4 py-2 font-medium ${
              showForm
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400'
            }`}
          >
            Nova Empresa
          </button>
        </div>

        {/* Conteúdo */}
        {showForm ? (
          <TenantManager
            onSave={() => {
              setShowForm(false);
              loadTenants();
            }}
          />
        ) : (
          <div className="space-y-6">
            {loading ? (
              <p className="text-slate-400">Carregando...</p>
            ) : tenants.length === 0 ? (
              <p className="text-slate-400">Nenhuma empresa cadastrada</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4">Nome</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Plano</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Usuários</th>
                      <th className="text-left py-3 px-4">Criada em</th>
                      <th className="text-left py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((tenant) => (
                      <tr
                        key={tenant.id}
                        className="border-b border-slate-800 hover:bg-slate-900 transition"
                      >
                        <td className="py-3 px-4 font-medium">{tenant.name}</td>
                        <td className="py-3 px-4 text-slate-400">{tenant.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-sm">
                            {tenant.plan}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              tenant.status === 'active'
                                ? 'bg-green-900 text-green-200'
                                : 'bg-red-900 text-red-200'
                            }`}
                          >
                            {tenant.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{tenant.max_users}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleStatus(tenant)}
                              className="p-2 hover:bg-slate-700 rounded transition"
                              title={tenant.status === 'active' ? 'Desativar' : 'Ativar'}
                            >
                              {tenant.status === 'active' ? (
                                <Eye size={18} className="text-green-400" />
                              ) : (
                                <EyeOff size={18} className="text-red-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(tenant.id)}
                              className="p-2 hover:bg-slate-700 rounded transition text-red-400"
                              title="Deletar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}