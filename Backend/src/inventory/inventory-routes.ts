import { Router } from 'express';
import { InventoryController } from './inventory-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.post('/', authenticate(['dealer']), (req, res) => InventoryController.create(req, res));
router.get('/', authenticate(), (req, res) => InventoryController.getAll(req, res));
router.get('/:id', authenticate(), (req, res) => InventoryController.getById(req, res));
router.put('/:id', authenticate(['dealer']), (req, res) => InventoryController.update(req, res));
router.delete('/:id', authenticate(['dealer']), (req, res) => InventoryController.delete(req, res));

export default router;