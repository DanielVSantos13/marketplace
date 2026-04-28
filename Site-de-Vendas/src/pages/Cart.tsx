import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Checkout
  const [clienteNome, setClienteNome] = useState('');

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const total = cart.reduce((acc, item) => acc + (item.preco * item.quantity), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/orders', {
        clienteNome,
        total,
        itens: cart.map(item => ({
          produtoId: item.id,
          quantidade: item.quantity,
          precoUnit: item.preco
        }))
      });
      localStorage.removeItem('cart');
      setCart([]);
      alert('Pedido finalizado com sucesso! (Simulação de Pagamento)');
      navigate('/');
    } catch (error) {
      console.error('Erro ao finalizar pedido', error);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="bg-gray-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag size={64} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-600">Seu carrinho está vazio</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors"
        >
          Ir para o Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Seu Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <motion.div 
              key={item.id}
              layout
              className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-3xl shadow-sm"
            >
              <div className="w-24 h-24 bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden">
                {item.imagemUrl && (
                  <img src={item.imagemUrl} alt={item.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{item.nome}</h3>
                <p className="text-blue-600 font-bold">R$ {item.preco.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded-lg transition-colors">
                  <Minus size={16} />
                </button>
                <span className="font-bold w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded-lg transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Summary / Checkout */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
            <h2 className="text-xl font-bold border-b border-gray-800 pb-4">Resumo</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Frete</span>
                <span className="text-green-400 font-bold">Grátis</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-800">
                <span>Total</span>
                <span className="text-blue-400">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {checkoutStep === 1 ? (
              <button 
                onClick={() => setCheckoutStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <CreditCard size={20} />
                Finalizar Compra
              </button>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-gray-800 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Seu nome para o pedido"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                  />
                </div>
                <div className="p-4 bg-blue-900/30 border border-blue-500/30 rounded-2xl text-sm text-blue-200">
                  <p className="font-bold mb-1 flex items-center gap-2">
                    <CreditCard size={16} /> Pagamento Simulado
                  </p>
                  <p>Ao clicar em confirmar, o sistema simulará uma transação aprovada.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setCheckoutStep(1)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 py-4 rounded-2xl font-bold transition-all"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold transition-all"
                  >
                    Confirmar Pedido
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
