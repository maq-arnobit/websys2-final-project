import { Router } from 'express';
import { OrderItemController } from './order-items-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.post('/', authenticate(['customer']), (req, res) => OrderItemController.create(req, res));
router.get('/', authenticate(), (req, res) => OrderItemController.getAll(req, res));
router.get('/:id', authenticate(), (req, res) => OrderItemController.getById(req, res));
router.get('/order/:orderId', authenticate(), (req, res) => OrderItemController.getByOrderId(req, res));
router.put('/:id', authenticate(['customer']), (req, res) => OrderItemController.update(req, res));
router.delete('/:id', authenticate(['customer']), (req, res) => OrderItemController.delete(req, res));

export default router;