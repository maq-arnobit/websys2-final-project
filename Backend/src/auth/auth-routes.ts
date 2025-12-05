//auth-routes.ts
import { Router } from 'express';
import { AuthController } from './auth-controller';
import { authenticate } from './auth-middleware';

const router = Router();

// Registration routes
router.post('/register/customer', AuthController.registerCustomer);
router.post('/register/dealer', AuthController.registerDealer);
router.post('/register/provider', AuthController.registerProvider);

// Login & Logout
router.post('/login', AuthController.login);
router.post('/logout', authenticate(), AuthController.logout);

// Profile
router.get('/profile', authenticate(), AuthController.getProfile);

export default router;