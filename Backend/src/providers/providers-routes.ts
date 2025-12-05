import { Router } from 'express';
import { ProviderController } from './providers-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.get('/:id', authenticate(), ProviderController.getById);
router.put('/:id', authenticate(['provider']), ProviderController.update);
router.delete('/:id', authenticate(['provider']), ProviderController.delete);
router.get('/:id/substances', authenticate(), ProviderController.getSubstances);
router.get('/:id/transport-options', authenticate(), ProviderController.getTransportOptions);
router.get('/:id/purchase-orders', authenticate(['provider']), ProviderController.getPurchaseOrders);

export default router;