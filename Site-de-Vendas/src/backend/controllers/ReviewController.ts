import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const ReviewController = {
  async create(req: Request, res: Response) {
    try {
      const { produtoId, nota, comentario, autor } = req.body;
      const { data, error } = await supabase
        .from('Avaliacao')
        .insert([{
          produtoId,
          nota: Number(nota),
          comentario,
          autor,
        }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar avaliação' });
    }
  },
};
