// src/routes/order.routes.ts
import { Router } from 'express';
import { OrderController } from './orders-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.get('/', authenticate(), OrderController.getAll);
router.get('/:id', authenticate(), OrderController.getById);
router.post('/', authenticate(['customer']), OrderController.create);
router.put('/:id', authenticate(['customer', 'dealer']), OrderController.update);
router.delete('/:id', authenticate(['customer']), OrderController.delete);

export default router;