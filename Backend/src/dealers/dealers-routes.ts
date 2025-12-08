import { Router } from 'express';
import { DealerController } from './dealers-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();
const dealerController = new DealerController();

router.get('/:id', authenticate(['dealer']), (req, res) => dealerController.getById(req, res));
router.put('/:id', authenticate(['dealer']), (req, res) => dealerController.update(req, res));
router.delete('/:id', authenticate(['dealer']), (req, res) => dealerController.delete(req, res));
router.get('/:id/inventory', authenticate(['dealer']), (req, res) => dealerController.getInventory(req, res));
router.get('/:id/orders', authenticate(['dealer']), (req, res) => dealerController.getOrders(req, res));
router.get('/:id/purchase-orders', authenticate(['dealer']), (req, res) => dealerController.getPurchaseOrders(req, res));

export default router;