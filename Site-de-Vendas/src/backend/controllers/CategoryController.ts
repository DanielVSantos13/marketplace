import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const CategoryController = {
  async getAll(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('Categoria')
        .select('*')
        .order('nome', { ascending: true });
      
      if (error) {
        if (error.code === 'PGRST205') {
          return res.json([]); // Return empty array if table doesn't exist yet
        }
        throw error;
      }
      res.json(data);
    } catch (error) {
      console.error('CategoryController.getAll error:', error);
      res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { nome } = req.body;
      console.log('Tentando criar categoria:', { nome });
      
      const { data, error } = await supabase
        .from('Categoria')
        .insert([{ nome }])
        .select()
        .single();

      if (error) {
        console.error('Erro Supabase ao criar categoria:', error);
        return res.status(400).json({ error: error.message, details: error.details });
      }
      res.status(201).json(data);
    } catch (error) {
      console.error('Erro inesperado ao criar categoria:', error);
      res.status(500).json({ error: 'Erro interno ao criar categoria' });
    }
  },
};
