import { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    imagemUrl: '',
    vendedor: '',
    categoriaId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products', { params: { limit: 100 } }),
        api.get('/categories')
      ]);
      setProducts(prodRes.data.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados', error);
    } finally {
      setLoading(false);
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, imagemUrl: res.data.url });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem. Verifique se o bucket "marketplace" existe e é público no Supabase.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        nome: product.nome || '',
        descricao: product.descricao || '',
        preco: (product.preco || 0).toString(),
        estoque: (product.estoque || 0).toString(),
        imagemUrl: product.imagemUrl || '',
        vendedor: product.vendedor || '',
        categoriaId: product.categoriaId || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        nome: '',
        descricao: '',
        preco: '',
        estoque: '',
        imagemUrl: '',
        vendedor: '',
        categoriaId: categories[0]?.id || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Erro ao salvar produto', error);
      const message = error.response?.data?.error || error.message;
      const details = error.response?.data?.details || '';
      alert(`Erro ao salvar produto: ${message}\n${details}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      console.log('Solicitando exclusão do produto:', id);
      const res = await api.delete(`/products/${id}`);
      console.log('Resposta da exclusão:', res.status);
      
      alert('Produto excluído com sucesso!');
      fetchData();
    } catch (error: any) {
      console.error('Erro ao excluir produto', error);
      const errorMsg = error.response?.data?.error || error.message;
      const details = error.response?.data?.details || '';
      alert(`Erro ao excluir produto: ${errorMsg}\n${details}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-gray-400">Gerencie o catálogo do seu marketplace</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Produto</th>
                <th className="px-6 py-4 font-bold">Categoria</th>
                <th className="px-6 py-4 font-bold">Preço</th>
                <th className="px-6 py-4 font-bold">Estoque</th>
                <th className="px-6 py-4 font-bold">Vendedor</th>
                <th className="px-6 py-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center">Carregando...</td></tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {product.imagemUrl ? (
                            <img src={product.imagemUrl} alt={product.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20} /></div>
                          )}
                        </div>
                        <span className="font-bold">{product.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                        {product.categoria?.nome}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">R$ {product.preco.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {product.estoque > 0 ? (
                          <CheckCircle size={14} className="text-green-500" />
                        ) : (
                          <AlertCircle size={14} className="text-red-500" />
                        )}
                        <span className={product.estoque > 0 ? 'text-gray-600' : 'text-red-600 font-bold'}>
                          {product.estoque} un.
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{product.vendedor}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Nenhum produto cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2">Nome do Produto</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 transition-colors"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2">Descrição</label>
                    <textarea 
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Preço (R$)</label>
                    <input 
                      type="number" step="0.01" required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 transition-colors"
                      value={formData.preco}
                      onChange={(e) => setFormData({...formData, preco: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Estoque Inicial</label>
                    <input 
                      type="number" required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 transition-colors"
                      value={formData.estoque}
                      onChange={(e) => setFormData({...formData, estoque: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Categoria</label>
                    <select 
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 transition-colors bg-white"
                      value={formData.categoriaId}
                      onChange={(e) => setFormData({...formData, categoriaId: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Vendedor</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 transition-colors"
                      value={formData.vendedor}
                      onChange={(e) => setFormData({...formData, vendedor: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2">Imagem do Produto</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-200">
                          {formData.imagemUrl ? (
                            <img src={formData.imagemUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={32} /></div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <Plus size={20} className="text-blue-500" />
                            <span className="text-sm font-bold text-gray-600">{uploading ? 'Enviando...' : 'Fazer Upload de Imagem'}</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploading}
                            />
                          </label>
                          <p className="text-[10px] text-gray-400">Formatos aceitos: JPG, PNG, WEBP. Tamanho máx: 5MB.</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Ou cole a URL da imagem</label>
                        <input 
                          type="url"
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 transition-colors text-sm"
                          placeholder="https://exemplo.com/imagem.jpg"
                          value={formData.imagemUrl}
                          onChange={(e) => setFormData({...formData, imagemUrl: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
