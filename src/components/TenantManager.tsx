import { useState } from 'react';
import TenantService from '../services/TenantService';

interface FormData {
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  plan: 'starter' | 'professional' | 'enterprise';
  max_users: number;
  max_storage_gb: number;
  max_locations: number;
  max_pallets: number;
}

interface Props {
  onSave: () => void;
}

export default function TenantManager({ onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    cnpj: '',
    plan: 'starter',
    max_users: 10,
    max_storage_gb: 100,
    max_locations: 50,
    max_pallets: 1000,
  });

  const planLimits = {
    starter: { users: 10, storage: 100, locations: 50, pallets: 1000 },
    professional: { users: 50, storage: 500, locations: 200, pallets: 5000 },
    enterprise: { users: 999, storage: 5000, locations: 1000, pallets: 50000 },
  };

  const handlePlanChange = (plan: 'starter' | 'professional' | 'enterprise') => {
    const limits = planLimits[plan];
    setFormData({
      ...formData,
      plan,
      max_users: limits.users,
      max_storage_gb: limits.storage,
      max_locations: limits.locations,
      max_pallets: limits.pallets,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);

      // Validações
      if (!formData.name || !formData.email) {
        throw new Error('Nome e email são obrigatórios');
      }

      // Criar tenant
      const tenant = await TenantService.createTenant({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        cnpj: formData.cnpj || null,
        plan: formData.plan,
        status: 'active',
        max_users: formData.max_users,
        max_storage_gb: formData.max_storage_gb,
        max_locations: formData.max_locations,
        max_pallets: formData.max_pallets,
      });

      // Criar settings padrão
      await TenantService.createTenantSettings(tenant.id);

      // Limpar form
      setFormData({
        name: '',
        email: '',
        phone: '',
        cnpj: '',
        plan: 'starter',
        max_users: 10,
        max_storage_gb: 100,
        max_locations: 50,
        max_pallets: 1000,
      });

      onSave();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 p-8 rounded-lg border border-slate-800">
      <h2 className="text-2xl font-bold mb-6">Criar Nova Empresa</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plano */}
        <div>
          <label className="block text-sm font-medium mb-3">Plano</label>
          <div className="grid grid-cols-3 gap-4">
            {(['starter', 'professional', 'enterprise'] as const).map((plan) => (
              <button
                key={plan}
                type="button"
                onClick={() => handlePlanChange(plan)}
                className={`p-4 rounded-lg border-2 transition ${
                  formData.plan === plan
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="font-medium capitalize">{plan}</div>
                <div className="text-sm text-slate-400 mt-2">
                  {planLimits[plan].users} usuários
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium mb-2">Nome da Empresa *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 outline-none"
            placeholder="Nome da empresa"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 outline-none"
            placeholder="email@empresa.com"
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium mb-2">Telefone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 outline-none"
            placeholder="(11) 99999-9999"
          />
        </div>

        {/* CNPJ */}
        <div>
          <label className="block text-sm font-medium mb-2">CNPJ</label>
          <input
            type="text"
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 outline-none"
            placeholder="00.000.000/0000-00"
          />
        </div>

        {/* Limites */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Max Usuários</label>
            <input
              type="number"
              value={formData.max_users}
              onChange={(e) =>
                setFormData({ ...formData, max_users: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Storage (GB)</label>
            <input
              type="number"
              value={formData.max_storage_gb}
              onChange={(e) =>
                setFormData({ ...formData, max_storage_gb: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Localizações</label>
            <input
              type="number"
              value={formData.max_locations}
              onChange={(e) =>
                setFormData({ ...formData, max_locations: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Pallets</label>
            <input
              type="number"
              value={formData.max_pallets}
              onChange={(e) =>
                setFormData({ ...formData, max_pallets: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg font-medium transition"
          >
            {loading ? 'Criando...' : 'Criar Empresa'}
          </button>
        </div>
      </form>
    </div>
  );
}