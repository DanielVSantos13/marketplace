import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ShoppingCart, Star, ArrowLeft, User, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.error('Erro ao buscar produto', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item: any) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Produto adicionado ao carrinho!');
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        produtoId: id,
        nota: reviewNote,
        comentario: reviewComment,
        autor: reviewAuthor
      });
      setReviewComment('');
      setReviewAuthor('');
      fetchProduct();
    } catch (error) {
      console.error('Erro ao enviar avaliação', error);
    }
  };

  if (loading) return <div className="text-center py-20">Carregando...</div>;
  if (!product) return <div className="text-center py-20">Produto não encontrado</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-50 rounded-3xl overflow-hidden aspect-square flex items-center justify-center p-8"
        >
          {product.imagemUrl ? (
            <img 
              src={product.imagemUrl} 
              alt={product.nome} 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <ShoppingCart size={120} className="text-gray-200" />
          )}
        </motion.div>

        {/* Info Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-sm font-bold uppercase">
              {product.categoria?.nome}
            </span>
            <h1 className="text-4xl font-bold mt-4">{product.nome}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={18} fill={i <= 4 ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-gray-400 text-sm">({product.avaliacoes?.length} avaliações)</span>
            </div>
          </div>

          <p className="text-3xl font-bold text-blue-600">R$ {product.preco.toFixed(2)}</p>
          
          <div className="prose prose-blue text-gray-600">
            <p>{product.descricao}</p>
          </div>

          <div className="flex items-center gap-4 py-6 border-y border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Vendedor</p>
                <p className="font-bold">{product.vendedor}</p>
              </div>
            </div>
            <div className="ml-auto">
              <p className="text-xs text-gray-400">Estoque</p>
              <p className={`font-bold ${product.estoque > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.estoque > 0 ? `${product.estoque} unidades` : 'Esgotado'}
              </p>
            </div>
          </div>

          <button 
            onClick={addToCart}
            disabled={product.estoque <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
          >
            <ShoppingCart size={24} />
            Adicionar ao Carrinho
          </button>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <section className="space-y-8 pt-12 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="text-blue-600" /> Avaliações
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Review Form */}
          <div className="bg-gray-50 p-8 rounded-3xl h-fit">
            <h3 className="font-bold mb-4">Deixe sua avaliação</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Seu Nome</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Nota</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button 
                      key={i} 
                      type="button"
                      onClick={() => setReviewNote(i)}
                      className={`p-1 transition-colors ${i <= reviewNote ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star fill={i <= reviewNote ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Comentário</label>
                <textarea 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-blue-500 h-24 resize-none"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                ></textarea>
              </div>
              <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors">
                Enviar Avaliação
              </button>
            </form>
          </div>

          {/* Review List */}
          <div className="md:col-span-2 space-y-6">
            {product.avaliacoes?.length > 0 ? (
              product.avaliacoes.map((review: any) => (
                <div key={review.id} className="p-6 border border-gray-100 rounded-3xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {review.autor.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold">{review.autor}</span>
                    </div>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={14} fill={i <= review.nota ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comentario}</p>
                  <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                Nenhuma avaliação ainda. Seja o primeiro a avaliar!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
