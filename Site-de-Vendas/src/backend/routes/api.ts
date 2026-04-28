import { Router } from 'express';
import multer from 'multer';
import { ProductController } from '../controllers/ProductController';
import { CategoryController } from '../controllers/CategoryController';
import { OrderController } from '../controllers/OrderController';
import { ReviewController } from '../controllers/ReviewController';
import { UploadController } from '../controllers/UploadController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @openapi
 * /upload:
 *   post:
 *     summary: Faz upload de uma imagem para o Supabase Storage
 */
router.post('/upload', upload.single('image'), UploadController.upload);

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Retorna todos os produtos
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
router.get('/products', ProductController.getAll);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Retorna um produto pelo ID
 */
router.get('/products/:id', ProductController.getById);

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Cria um novo produto
 */
router.post('/products', ProductController.create);

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Atualiza um produto
 */
router.put('/products/:id', ProductController.update);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Exclui um produto
 */
router.delete('/products/:id', ProductController.delete);

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Retorna todas as categorias
 */
router.get('/categories', CategoryController.getAll);

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Retorna todos os pedidos
 */
router.get('/orders', OrderController.getAll);

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Cria um novo pedido (Checkout)
 */
router.post('/orders', OrderController.create);

/**
 * @openapi
 * /stats:
 *   get:
 *     summary: Retorna métricas do dashboard
 */
router.get('/stats', OrderController.getStats);

// Avaliações
router.post('/reviews', ReviewController.create);

export default router;
