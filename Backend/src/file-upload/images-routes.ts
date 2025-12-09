import { Router } from 'express';
import { ImageController } from './images-controller';
import { authenticate } from '../auth/auth-middleware';
import { upload } from './upload-middleware';

const router = Router();

router.post('/substance/:substanceId', authenticate(['provider']), upload.single('image'), (req, res) => ImageController.uploadSubstanceImage(req, res));
router.post('/inventory/:inventoryId', authenticate(['dealer']), upload.single('image'), (req, res) => ImageController.uploadInventoryImage(req, res));
router.delete('/substance/:substanceId', authenticate(['provider']), (req, res) => ImageController.deleteSubstanceImage(req, res));
router.delete('/inventory/:inventoryId', authenticate(['dealer']), (req, res) => ImageController.deleteInventoryImage(req, res));
router.get('/:type/:id', authenticate(), (req, res) => ImageController.getImageUrl(req, res));

export default router;