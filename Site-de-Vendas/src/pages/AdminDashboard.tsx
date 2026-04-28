import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  Layers, 
  ArrowRight,
  PlusCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import DatabaseSetupGuide from '../components/DatabaseSetupGuide';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats');
      setStats(res.data);
      setShowSetup(false);
    } catch (error) {
      console.error('Erro ao buscar stats', error);
      setShowSetup(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Carregando Dashboard...</div>;

  if (showSetup) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <DatabaseSetupGuide />
      </div>
    );
  }

  const statCards = [
    { title: 'Vendas Totais', value: `R$ ${stats.totalVendas.toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Pedidos', value: stats.totalPedidos, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Produtos', value: stats.totalProdutos, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Categorias', value: stats.totalCategorias, icon: Layers, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <Link 
          to="/admin/products" 
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} /> Gerenciar Produtos
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`${card.bg} ${card.color} p-4 rounded-2xl`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold">Vendas Recentes</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.vendasPorDia}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="createdAt" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString()} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
                />
                <Bar dataKey="_sum.total" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-xl font-bold">Ações Rápidas</h3>
            <div className="grid grid-cols-1 gap-4">
              <Link to="/admin/products" className="flex justify-between items-center p-4 bg-gray-800 rounded-2xl hover:bg-gray-700 transition-colors group">
                <div className="flex items-center gap-3">
                  <Package className="text-blue-400" />
                  <span>Gerenciar Produtos</span>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/admin/orders" className="flex justify-between items-center p-4 bg-gray-800 rounded-2xl hover:bg-gray-700 transition-colors group">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="text-green-400" />
                  <span>Gerenciar Pedidos</span>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">Dica do Sistema</h3>
            <p className="text-blue-700 text-sm">
              Mantenha seu estoque atualizado para evitar cancelamentos de pedidos. 
              Produtos com estoque zero não aparecem para compra no marketplace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
