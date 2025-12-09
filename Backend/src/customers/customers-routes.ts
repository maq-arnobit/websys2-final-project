import { Router } from 'express';
import { CustomerController } from './customers-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();
const customerController = new CustomerController();

router.get('/:id', authenticate(['customer']), (req, res) => customerController.getById(req, res));
router.put('/:id', authenticate(['customer']), (req, res) => customerController.update(req, res));
router.delete('/:id', authenticate(['customer']), (req, res) => customerController.delete(req, res));
router.get('/:id/orders', authenticate(['customer']), (req, res) => customerController.getOrders(req, res));

export default router;