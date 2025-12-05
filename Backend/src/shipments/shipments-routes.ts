import { Router } from 'express';
import { ShipmentController } from './shipments-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.get('/', authenticate(['dealer']), ShipmentController.getAll);
router.get('/:id', authenticate(['customer', 'dealer']), ShipmentController.getById);
router.get('/order/:orderId', authenticate(['customer', 'dealer']), ShipmentController.getByOrderId);
router.post('/', authenticate(['dealer']), ShipmentController.create);
router.put('/:id', authenticate(['dealer']), ShipmentController.update);
router.delete('/:id', authenticate(['dealer']), ShipmentController.delete);

export default router;