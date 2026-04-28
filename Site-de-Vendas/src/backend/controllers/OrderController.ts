import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const OrderController = {
  async getAll(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('Pedido')
        .select('*, itens:ItemPedido(*, produto:Produto(*))')
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error('Erro Supabase ao buscar pedidos:', error);
        return res.status(400).json({ error: error.message, details: error.details });
      }
      res.json(data);
    } catch (error) {
      console.error('Erro inesperado ao buscar pedidos:', error);
      res.status(500).json({ error: 'Erro interno ao buscar pedidos' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { clienteNome, total, itens } = req.body;
      
      const transacaoId = `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create Order
      const { data: pedido, error: orderError } = await supabase
        .from('Pedido')
        .insert([{
          clienteNome,
          total: Number(total),
          transacaoId,
          status: 'pago',
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create Order Items
      const orderItems = itens.map((item: any) => ({
        pedidoId: pedido.id,
        produtoId: item.produtoId,
        quantidade: Number(item.quantidade),
        precoUnit: Number(item.precoUnit),
      }));

      const { error: itemsError } = await supabase
        .from('ItemPedido')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update Stock
      for (const item of itens) {
        const { data: prod } = await supabase
          .from('Produto')
          .select('estoque')
          .eq('id', item.produtoId)
          .single();
        
        if (prod) {
          await supabase
            .from('Produto')
            .update({ estoque: prod.estoque - Number(item.quantidade) })
            .eq('id', item.produtoId);
        }
      }

      res.status(201).json(pedido);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar pedido' });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { data, error } = await supabase
        .from('Pedido')
        .update({ status, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar status do pedido' });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const [
        pedidosRes,
        produtosRes,
        categoriasRes
      ] = await Promise.all([
        supabase.from('Pedido').select('total, createdAt'),
        supabase.from('Produto').select('*', { count: 'exact', head: true }),
        supabase.from('Categoria').select('*', { count: 'exact', head: true })
      ]);

      if (pedidosRes.error && pedidosRes.error.code !== 'PGRST205') throw pedidosRes.error;
      if (produtosRes.error && produtosRes.error.code !== 'PGRST205') throw produtosRes.error;
      if (categoriasRes.error && categoriasRes.error.code !== 'PGRST205') throw categoriasRes.error;

      const pedidos = pedidosRes.data || [];
      const totalProdutos = produtosRes.count || 0;
      const totalCategorias = categoriasRes.count || 0;

      const totalVendas = pedidos.reduce((acc, p) => acc + p.total, 0);
      const totalPedidos = pedidos.length;

      // Vendas por dia (últimos 7 dias)
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

      const vendasRecentes = (pedidos || []).filter(p => new Date(p.createdAt) >= seteDiasAtras);
      
      // Group by day manually
      const groupedVendas = vendasRecentes.reduce((acc: any, p) => {
        const date = new Date(p.createdAt).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = 0;
        acc[date] += p.total;
        return acc;
      }, {});

      const vendasPorDia = Object.entries(groupedVendas).map(([date, total]) => ({
        createdAt: date,
        _sum: { total }
      }));

      res.json({
        totalVendas,
        totalPedidos,
        totalProdutos,
        totalCategorias,
        vendasPorDia,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar métricas' });
    }
  },
};
