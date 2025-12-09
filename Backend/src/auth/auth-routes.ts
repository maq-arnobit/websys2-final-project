import { Router } from 'express';
import { AuthController } from './auth-controller';
import { authenticate } from './auth-middleware';

const router = Router();

// Registration routes
router.post('/register/customer', AuthController.registerCustomer);
router.post('/register/dealer', AuthController.registerDealer);
router.post('/register/provider', AuthController.registerProvider);

// Login route
router.post('/login', AuthController.login);

// Logout route (protected)
router.post('/logout', authenticate(), AuthController.logout);

// Profile route (protected)
router.get('/profile', authenticate(), AuthController.getProfile);

export default router;
