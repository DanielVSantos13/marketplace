import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const ProductController = {
  async getAll(req: Request, res: Response) {
    try {
      const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
      const from = (Number(page) - 1) * Number(limit);
      const to = from + Number(limit) - 1;

      let query = supabase
        .from('Produto')
        .select('*, categoria:Categoria(*)', { count: 'exact' });

      if (search) {
        query = query.or(`nome.ilike.%${search}%,descricao.ilike.%${search}%`);
      }
      if (category) {
        query = query.eq('categoriaId', category);
      }
      if (minPrice) {
        query = query.gte('preco', Number(minPrice));
      }
      if (maxPrice) {
        query = query.lte('preco', Number(maxPrice));
      }

      const { data, count, error } = await query
        .range(from, to)
        .order('createdAt', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
          return res.json({ data: [], meta: { total: 0, page: Number(page), limit: Number(limit), totalPages: 0 } });
        }
        throw error;
      }

      res.json({
        data: data || [],
        meta: {
          total: count || 0,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil((count || 0) / Number(limit)),
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('Produto')
        .select('*, categoria:Categoria(*), avaliacoes:Avaliacao(*)')
        .eq('id', id)
        .single();

      if (error || !data) return res.status(404).json({ error: 'Produto não encontrado' });
      
      // Sort reviews manually as Supabase SDK single() with nested select ordering is tricky
      if (data.avaliacoes) {
        data.avaliacoes.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { nome, descricao, preco, estoque, imagemUrl, vendedor, categoriaId } = req.body;
      
      if (!nome || !preco || !categoriaId || !vendedor) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando: nome, preco, categoriaId, vendedor' });
      }

      console.log('Tentando criar produto:', { nome, preco, estoque, categoriaId });
      
      const { data, error } = await supabase
        .from('Produto')
        .insert([{
          nome,
          descricao: descricao || '',
          preco: Number(preco),
          estoque: Number(estoque) || 0,
          imagemUrl: imagemUrl || null,
          vendedor,
          categoriaId,
          updatedAt: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro Supabase ao criar produto:', error);
        return res.status(400).json({ error: error.message, details: error.details });
      }
      res.status(201).json(data);
    } catch (error) {
      console.error('Erro inesperado ao criar produto:', error);
      res.status(500).json({ error: 'Erro interno ao criar produto' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, descricao, preco, estoque, imagemUrl, vendedor, categoriaId } = req.body;
      
      const updateData: any = {};
      if (nome) updateData.nome = nome;
      if (descricao) updateData.descricao = descricao;
      if (preco) updateData.preco = Number(preco);
      if (estoque) updateData.estoque = Number(estoque);
      if (imagemUrl !== undefined) updateData.imagemUrl = imagemUrl;
      if (vendedor) updateData.vendedor = vendedor;
      if (categoriaId) updateData.categoriaId = categoriaId;
      updateData.updatedAt = new Date().toISOString();

      const { data, error } = await supabase
        .from('Produto')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      console.log('--- INICIANDO EXCLUSÃO AGRESSIVA ---');
      console.log('ID alvo:', id);

      // 1. Verificar se o produto existe antes de tudo
      const { data: existingProduct, error: findError } = await supabase
        .from('Produto')
        .select('id, nome')
        .eq('id', id)
        .single();

      if (findError || !existingProduct) {
        console.error('Produto não encontrado para exclusão:', findError);
        return res.status(404).json({ error: 'Produto não encontrado no banco de dados.' });
      }

      console.log('Produto encontrado:', existingProduct.nome);

      // 2. Limpar dependências (Avaliações e Itens de Pedido)
      console.log('Limpando dependências...');
      
      const [delReviews, delItems] = await Promise.all([
        supabase.from('Avaliacao').delete().eq('produtoId', id),
        supabase.from('ItemPedido').delete().eq('produtoId', id)
      ]);

      if (delReviews.error) console.warn('Erro ao deletar avaliações:', delReviews.error.message);
      if (delItems.error) console.warn('Erro ao deletar itens de pedido:', delItems.error.message);

      // 3. Deletar o produto final
      console.log('Executando delete final na tabela Produto...');
      const { error: delError, status } = await supabase
        .from('Produto')
        .delete()
        .eq('id', id);

      if (delError) {
        console.error('Erro fatal do Supabase ao deletar produto:', delError);
        return res.status(400).json({ 
          error: 'O Supabase recusou a exclusão do produto.', 
          details: delError.message,
          code: delError.code
        });
      }

      console.log('Sucesso! Status Supabase:', status);
      res.json({ message: 'Produto e todo o seu histórico foram removidos com sucesso.' });
    } catch (error) {
      console.error('Erro catastrófico no controller de exclusão:', error);
      res.status(500).json({ error: 'Erro interno ao processar a exclusão total.' });
    }
  },
};
