import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

import DatabaseSetupGuide from '../components/DatabaseSetupGuide';

export default function Marketplace() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products', { params: { search, category: selectedCategory } }),
        api.get('/categories')
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data);
      setShowSetup(false);
    } catch (error: any) {
      console.error('Erro ao buscar dados', error);
      // If we get an error, it might be because tables are missing
      setShowSetup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {showSetup && <DatabaseSetupGuide />}
      
      {/* Hero Section */}
      <section className="bg-blue-600 rounded-3xl p-8 md:p-16 text-white overflow-hidden relative">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Encontre os melhores produtos.</h1>
          <p className="text-blue-100 text-lg mb-8">O marketplace completo para você gerenciar e comprar com facilidade.</p>
          <div className="flex bg-white rounded-2xl p-2 shadow-xl max-w-md">
            <Search className="text-gray-400 m-2" />
            <input 
              type="text" 
              placeholder="O que você está procurando?" 
              className="flex-1 outline-none text-gray-800 px-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-500 opacity-20 transform skew-x-12 translate-x-1/2"></div>
      </section>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Filter size={18} /> Categorias
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-4 py-2 rounded-xl transition-all ${!selectedCategory ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-100'}`}
              >
                Todas
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-4 py-2 rounded-xl transition-all ${selectedCategory === cat.id ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-100'}`}
                >
                  {cat.nome}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-3xl h-80"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                >
                  <Link to={`/product/${product.id}`}>
                    <div className="h-56 bg-gray-50 relative overflow-hidden">
                      {product.imagemUrl ? (
                        <img 
                          src={product.imagemUrl} 
                          alt={product.nome} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag size={48} />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-blue-600 shadow-sm">
                        R$ {product.preco.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2">{product.categoria?.nome}</p>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{product.nome}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4">{product.descricao}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Vendedor: {product.vendedor}</span>
                        <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:bg-blue-700 transition-colors">
                          <ShoppingBag size={20} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-600">Nenhum produto encontrado</h3>
              <p className="text-gray-400">Tente ajustar seus filtros ou busca.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
