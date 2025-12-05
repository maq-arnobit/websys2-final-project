// src/routes/customer.routes.ts
import { Router } from 'express';
import { CustomerController } from './customers-controller';
import { authenticate } from '../auth/auth-middleware';

const router = Router();

// Customer can only access their own profile
router.get('/:id', authenticate(['customer']), CustomerController.getById);

// Customer can only update their own account
router.put('/:id', authenticate(['customer']), CustomerController.update);

// Customer can only delete their own account
router.delete('/:id', authenticate(['customer']), CustomerController.delete);

// Customer can only view their own orders
router.get('/:id/orders', authenticate(['customer']), CustomerController.getOrders);

export default router;