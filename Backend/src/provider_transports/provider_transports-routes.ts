import { Router } from 'express';
import { ProviderTransportController } from './provider_transports-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

router.get('/', authenticate(), ProviderTransportController.getAll);
router.get('/:id', authenticate(), ProviderTransportController.getById);
router.post('/', authenticate(['provider']), ProviderTransportController.create);
router.put('/:id', authenticate(['provider']), ProviderTransportController.update);
router.delete('/:id', authenticate(['provider']), ProviderTransportController.delete);

export default router;