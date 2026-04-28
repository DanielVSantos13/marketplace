import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const UploadController = {
  async upload(req: MulterRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const file = req.file;
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('marketplace')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Erro no Supabase Storage:', error);
        return res.status(500).json({ error: 'Erro ao fazer upload para o Supabase Storage', details: error.message });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('marketplace')
        .getPublicUrl(filePath);

      res.json({ url: publicUrl });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ error: 'Erro interno no servidor durante o upload' });
    }
  }
};
