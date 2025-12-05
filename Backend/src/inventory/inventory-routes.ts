import { Router } from 'express';
import { InventoryController } from './inventory-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.get('/', authenticate(), InventoryController.getAll);  
router.get('/:id', authenticate(), InventoryController.getById);  
router.post('/', authenticate(['dealer']), InventoryController.create);  
router.put('/:id', authenticate(['dealer']), InventoryController.update); 
router.delete('/:id', authenticate(['dealer']), InventoryController.delete);  

export default router;
