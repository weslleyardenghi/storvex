import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Building2, TrendingUp, HardDrive, RefreshCw } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  max_users: number;
  created_at: string;
}

interface Props {
  tenants: Tenant[];
  onViewDetails: (tenant: Tenant) => void;
  onRefresh: () => void;
}

export default function TenantDashboard({ tenants, onViewDetails, onRefresh }: Props) {
  const activeCount = tenants.filter((t) => t.status === 'active').length;
  const inactiveCount = tenants.filter((t) => t.status !== 'active').length;

  const planData = {
    starter: tenants.filter((t) => t.plan === 'starter').length,
    professional: tenants.filter((t) => t.plan === 'professional').length,
    enterprise: tenants.filter((t) => t.plan === 'enterprise').length,
  };

  const chartData = [
    { name: 'Starter', value: planData.starter, fill: '#3b82f6' },
    { name: 'Professional', value: planData.professional, fill: '#10b981' },
    { name: 'Enterprise', value: planData.enterprise, fill: '#f59e0b' },
  ];

  const statusData = [
    { name: 'Ativas', value: activeCount, fill: '#10b981' },
    { name: 'Inativas', value: inactiveCount, fill: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard StorVex</h1>
            <p className="text-slate-400 mt-2">Visão geral do sistema</p>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            <RefreshCw size={18} />
            Atualizar
          </button>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total de Empresas */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total de Empresas</p>
                <p className="text-3xl font-bold mt-2">{tenants.length}</p>
              </div>
              <Building2 size={32} className="text-blue-400" />
            </div>
          </div>

          {/* Empresas Ativas */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Ativas</p>
                <p className="text-3xl font-bold mt-2 text-green-400">{activeCount}</p>
              </div>
              <TrendingUp size={32} className="text-green-400" />
            </div>
          </div>

          {/* Usuários Total */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Usuários Máx</p>
                <p className="text-3xl font-bold mt-2">
                  {tenants.reduce((acc, t) => acc + t.max_users, 0)}
                </p>
              </div>
              <Users size={32} className="text-purple-400" />
            </div>
          </div>

          {/* Storage Total */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Storage Máx</p>
                <p className="text-3xl font-bold mt-2">
                  {tenants.reduce((acc, t) => acc + (t.max_users || 0), 0) / 10} TB
                </p>
              </div>
              <HardDrive size={32} className="text-orange-400" />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Distribuição por Plano */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Distribuição por Plano</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Status das Empresas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Empresas */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Empresas Recentes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">Plano</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Usuários</th>
                  <th className="text-left py-3 px-4">Criada em</th>
                  <th className="text-left py-3 px-4">Ação</th>
                </tr>
              </thead>
              <tbody>
                {tenants.slice(0, 10).map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="border-b border-slate-800 hover:bg-slate-800 transition"
                  >
                    <td className="py-3 px-4 font-medium">{tenant.name}</td>
                    <td className="py-3 px-4 text-slate-400">{tenant.plan}</td>
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
                      <button
                        onClick={() => onViewDetails(tenant)}
                        className="text-blue-400 hover:text-blue-300 transition"
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}