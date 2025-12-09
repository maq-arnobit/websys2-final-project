import { Router } from 'express';
import { ProviderTransportController } from './provider-transports-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.post('/', authenticate(['provider']), (req, res) => ProviderTransportController.create(req, res));
router.get('/', authenticate(), (req, res) => ProviderTransportController.getAll(req, res));
router.get('/:id', authenticate(), (req, res) => ProviderTransportController.getById(req, res));
router.put('/:id', authenticate(['provider']), (req, res) => ProviderTransportController.update(req, res));
router.delete('/:id', authenticate(['provider']), (req, res) => ProviderTransportController.delete(req, res));

export default router;