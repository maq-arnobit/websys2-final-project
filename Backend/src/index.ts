import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4200;

app.use(cookieParser());

app.use(cors({
  origin: true, 
  credentials: true, 
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

import authRoutes from './auth/auth-routes';
import customerRoutes from './customers/customers-routes';
import orderRoutes from './orders/orders-routes';
import substanceRoutes from './substances/substances-routes';
import inventoryRoutes from './inventory/inventory-routes';
import providerRoutes from './providers/providers-routes';
import providerTransportRoutes from './provider_transports/provider_transports-routes';
import purchaseOrderRoutes from './purchase_orders/purchase_orders-routes';
import shipmentRoutes from './shipments/shipments-routes';
import orderItemRoutes from './orders_items/orders_items-routes';
import dealerRoutes from './dealers/dealers-routes';

app.use('/dealers', dealerRoutes);
app.use('/provider-transports', providerTransportRoutes);
app.use('/purchase-orders', purchaseOrderRoutes);
app.use('/shipments', shipmentRoutes);
app.use('/order-items', orderItemRoutes);
app.use('/customers', customerRoutes);
app.use('/orders', orderRoutes);
app.use('/substances', substanceRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/providers', providerRoutes);  
app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;