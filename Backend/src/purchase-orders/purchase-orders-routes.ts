import { Router } from 'express';
import { PurchaseOrderController } from './purchase-orders-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.post('/', authenticate(['dealer']), (req, res) => PurchaseOrderController.create(req, res));
router.get('/', authenticate(), (req, res) => PurchaseOrderController.getAll(req, res));
router.get('/:id', authenticate(), (req, res) => PurchaseOrderController.getById(req, res));
router.put('/:id', authenticate(['dealer', 'provider']), (req, res) => PurchaseOrderController.update(req, res));
router.delete('/:id', authenticate(['dealer']), (req, res) => PurchaseOrderController.delete(req, res));

export default router;