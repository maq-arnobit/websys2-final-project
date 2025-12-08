import { Router } from 'express';
import { OrderController } from './orders-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.post('/', authenticate(['customer']), (req, res) => OrderController.create(req, res));
router.get('/', authenticate(), (req, res) => OrderController.getAll(req, res));
router.get('/:id', authenticate(), (req, res) => OrderController.getById(req, res));
router.put('/:id', authenticate(['customer', 'dealer']), (req, res) => OrderController.update(req, res));
router.delete('/:id', authenticate(['customer']), (req, res) => OrderController.delete(req, res));

export default router;