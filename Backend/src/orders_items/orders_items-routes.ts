import { Router } from 'express';
import { OrderItemController } from './orders-items-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.get('/', authenticate(), OrderItemController.getAll);
router.get('/:id', authenticate(['customer', 'dealer']), OrderItemController.getById);
router.get('/order/:orderId', authenticate(['customer', 'dealer']), OrderItemController.getByOrderId);
router.post('/', authenticate(['customer']), OrderItemController.create);
router.put('/:id', authenticate(['customer']), OrderItemController.update);
router.delete('/:id', authenticate(['customer']), OrderItemController.delete);

export default router;