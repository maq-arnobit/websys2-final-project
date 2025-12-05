
// src/routes/dealer.routes.ts
import { Router } from 'express';
import { DealerController } from './dealers-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.get('/:id', authenticate(), DealerController.getById);
router.put('/:id', authenticate(['dealer']), DealerController.update);
router.delete('/:id', authenticate(['dealer']), DealerController.delete);
router.get('/:id/inventory', authenticate(), DealerController.getInventory);
router.get('/:id/orders', authenticate(['dealer']), DealerController.getOrders);
router.get('/:id/purchase-orders', authenticate(['dealer']), DealerController.getPurchaseOrders);

export default router;