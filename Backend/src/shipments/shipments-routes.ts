import { Router } from 'express';
import { ShipmentController } from './shipments-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.post('/', authenticate(['dealer']), (req, res) => ShipmentController.create(req, res));
router.get('/', authenticate(), (req, res) => ShipmentController.getAll(req, res));
router.get('/:id', authenticate(), (req, res) => ShipmentController.getById(req, res));
router.get('/order/:orderId', authenticate(), (req, res) => ShipmentController.getByOrderId(req, res));
router.put('/:id', authenticate(['dealer']), (req, res) => ShipmentController.update(req, res));
router.delete('/:id', authenticate(['dealer']), (req, res) => ShipmentController.delete(req, res));

export default router;