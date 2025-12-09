import { Router } from 'express';
import { SubstanceController } from './substances-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.post('/', authenticate(['provider']), (req, res) => SubstanceController.create(req, res));
router.get('/', authenticate(), (req, res) => SubstanceController.getAll(req, res));
router.get('/:id', authenticate(), (req, res) => SubstanceController.getById(req, res));
router.put('/:id', authenticate(['provider']), (req, res) => SubstanceController.update(req, res));
router.delete('/:id', authenticate(['provider']), (req, res) => SubstanceController.delete(req, res));

export default router;