import { Router } from 'express';
import { ProviderController } from './providers-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();
const providerController = new ProviderController();

router.get('/:id', authenticate(['provider']), (req, res) => providerController.getById(req, res));
router.put('/:id', authenticate(['provider']), (req, res) => providerController.update(req, res));
router.delete('/:id', authenticate(['provider']), (req, res) => providerController.delete(req, res));
router.get('/:id/substances', authenticate(), (req, res) => providerController.getSubstances(req, res));
router.get('/:id/transport-options', authenticate(), (req, res) => providerController.getTransportOptions(req, res));
router.get('/:id/purchase-orders', authenticate(['provider']), (req, res) => providerController.getPurchaseOrders(req, res));

export default router;