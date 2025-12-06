import { Router } from 'express';
import { AuthController } from '../auth/auth-controller';
import { CustomerController } from '../customers/customers-controller';
import { DealerController } from '../dealers/dealers-controller';
import { ProviderController } from '../providers/providers-controller';
import { SubstancesController } from '../substance/substances-controller';
import { authenticate } from '../middleware/auth-middleware';
import { ProviderTransportsController } from '../provider-transports/provider-transports-controller';
import { PurchaseOrdersController } from '../purchase-orders/purchase-orders-controller';
import { InventoryController } from '../inventory/inventory-controller';
import { OrdersController } from '../orders/orders-controller';


const router = Router();

// Auth Routes
router.post('/auth/register/customer', AuthController.registerCustomer);
router.post('/auth/register/dealer', AuthController.registerDealer);
router.post('/auth/register/provider', AuthController.registerProvider);
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', authenticate(), AuthController.logout);
router.get('/auth/profile', authenticate(), AuthController.getProfile);

// Customer Routes 
const customerController = new CustomerController();
router.get('/customers/:id', authenticate(['customer']), (req, res) => customerController.getById(req, res));
router.put('/customers/:id', authenticate(['customer']), (req, res) => customerController.update(req, res));
router.delete('/customers/:id', authenticate(['customer']), (req, res) => customerController.delete(req, res));
router.get('/customers/:id/orders', authenticate(['customer']), CustomerController.getOrders);

// Dealer Routes
const dealerController = new DealerController();
router.get('/dealers/:id/inventory', authenticate(), DealerController.getInventory);
router.put('/dealers/:id', authenticate(['dealer']), (req, res) => dealerController.update(req, res));
router.delete('/dealers/:id', authenticate(['dealer']), (req, res) => dealerController.delete(req, res));
router.get('/dealers/:id/inventory', authenticate(['dealer']), DealerController.getInventory);
router.get('/dealers/:id/orders', authenticate(['dealer']), DealerController.getOrders);
router.get('/dealers/:id/purchase-orders', authenticate(['dealer']), DealerController.getPurchaseOrders);

// Provider Routes
const providerController = new ProviderController();
router.get('/providers/:id', authenticate(), (req, res) => providerController.getById(req, res));
router.put('/providers/:id', authenticate(['provider']), (req, res) => providerController.update(req, res));
router.delete('/providers/:id', authenticate(['provider']), (req, res) => providerController.delete(req, res));
router.get('/providers/:id/substances', authenticate(), ProviderController.getSubstances);
router.get('/providers/:id/transport-options', authenticate(), ProviderController.getTransportOptions);
router.get('/providers/:id/purchase-orders', authenticate(['provider']), ProviderController.getPurchaseOrders);

// Substances Routes
router.post('/substances', authenticate(['provider']), SubstancesController.create);
router.get('/substances', authenticate(), SubstancesController.getAll);
router.get('/substances/:id', authenticate(), SubstancesController.getById);
router.put('/substances/:id', authenticate(['provider']), SubstancesController.update);
router.delete('/substances/:id', authenticate(['provider']), SubstancesController.delete);

// Provider Transport Routes 
router.post('/provider-transports', authenticate(['provider']), ProviderTransportsController.create);
router.put('/provider-transports/:id', authenticate(['provider']), ProviderTransportsController.update);
router.delete('/provider-transports/:id', authenticate(['provider']), ProviderTransportsController.delete);

// Purchase Order Routes
router.post('/purchase-orders', authenticate(['dealer']), PurchaseOrdersController.create);
router.get('/purchase-orders', authenticate(), PurchaseOrdersController.getAll);
router.get('/purchase-orders/:id', authenticate(), PurchaseOrdersController.getById);
router.put('/purchase-orders/:id', authenticate(['dealer', 'provider']), PurchaseOrdersController.update);
router.delete('/purchase-orders/:id', authenticate(['dealer']), PurchaseOrdersController.delete);

// Inventory Routes 
router.post('/inventory', authenticate(['dealer']), InventoryController.create);
router.get('/inventory', authenticate(), InventoryController.getAll);
router.get('/inventory/:id', authenticate(), InventoryController.getById);
router.put('/inventory/:id', authenticate(['dealer']), InventoryController.update);
router.delete('/inventory/:id', authenticate(['dealer']), InventoryController.delete);

// Order Routes
router.post('/orders', authenticate(['customer']), OrdersController.create);
router.get('/orders', authenticate(), OrdersController.getAll);
router.get('/orders/:id', authenticate(), OrdersController.getById);
router.put('/orders/:id', authenticate(['customer', 'dealer']), OrdersController.update);
router.delete('/orders/:id', authenticate(['customer']), OrdersController.delete);

export default router;