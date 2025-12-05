import { Router } from 'express';
import { PurchaseOrderController } from './purchase_orders-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.get('/', authenticate(['dealer', 'provider']), PurchaseOrderController.getAll);
router.get('/:id', authenticate(['dealer', 'provider']), PurchaseOrderController.getById);
router.post('/', authenticate(['dealer']), PurchaseOrderController.create);
router.put('/:id', authenticate(['dealer', 'provider']), PurchaseOrderController.update);
router.delete('/:id', authenticate(['dealer']), PurchaseOrderController.delete);

export default router;