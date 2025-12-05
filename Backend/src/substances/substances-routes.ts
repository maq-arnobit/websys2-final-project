import { Router } from 'express';
import { SubstanceController } from './substances-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.get('/', authenticate(), SubstanceController.getAll);  
router.get('/:id', authenticate(), SubstanceController.getById);  
router.post('/', authenticate(['dealer', 'provider']), SubstanceController.create);  
router.put('/:id', authenticate(['dealer', 'provider']), SubstanceController.update);  
router.delete('/:id', authenticate(['dealer', 'provider']), SubstanceController.delete); 
export default router;
