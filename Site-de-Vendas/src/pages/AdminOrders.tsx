import { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (error: any) {
      console.error('Erro ao buscar pedidos', error);
      const message = error.response?.data?.error || error.message;
      const details = error.response?.data?.details || '';
      alert(`Erro ao buscar pedidos: ${message}\n${details}`);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Erro ao atualizar status', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock className="text-orange-500" size={16} />;
      case 'pago': return <CheckCircle2 className="text-green-500" size={16} />;
      case 'enviado': return <Truck className="text-blue-500" size={16} />;
      case 'entregue': return <Package className="text-purple-500" size={16} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-orange-50 text-orange-600';
      case 'pago': return 'bg-green-50 text-green-600';
      case 'enviado': return 'bg-blue-50 text-blue-600';
      case 'entregue': return 'bg-purple-50 text-purple-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-gray-400">Acompanhe e gerencie as vendas do marketplace</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20">Carregando pedidos...</div>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div 
                className="p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Pedido #{order.id.slice(0, 8)}</p>
                    <h3 className="font-bold text-lg">{order.clienteNome}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-bold text-blue-600">R$ {order.total.toFixed(2)}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                  <ChevronDown 
                    className={`text-gray-300 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} 
                  />
                </div>
              </div>

              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-gray-50 border-t border-gray-100"
                  >
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h4 className="font-bold text-gray-500 uppercase text-xs tracking-widest">Itens do Pedido</h4>
                        <div className="space-y-3">
                          {order.itens.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                  {item.produto.imagemUrl && (
                                    <img src={item.produto.imagemUrl} alt={item.produto.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-sm">{item.produto.nome}</p>
                                  <p className="text-xs text-gray-400">{item.quantidade}x R$ {item.precoUnit.toFixed(2)}</p>
                                </div>
                              </div>
                              <p className="font-bold text-sm">R$ {(item.quantidade * item.precoUnit).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="font-bold text-gray-500 uppercase text-xs tracking-widest">Gerenciar Status</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {['pendente', 'pago', 'enviado', 'entregue'].map((s) => (
                            <button 
                              key={s}
                              onClick={() => updateStatus(order.id, s)}
                              className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all ${order.status === s ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-500'}`}
                            >
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                          ))}
                        </div>
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Data do Pedido</span>
                            <span className="font-bold">{new Date(order.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">ID da Transação</span>
                            <span className="font-bold text-blue-600 flex items-center gap-1">
                              {order.transacaoId} <ExternalLink size={12} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-600">Nenhum pedido realizado</h3>
            <p className="text-gray-400">As vendas aparecerão aqui assim que os clientes finalizarem compras.</p>
          </div>
        )}
      </div>
    </div>
  );
}
