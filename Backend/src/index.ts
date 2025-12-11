import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './passport/passport';
import authRoutes from './auth/auth-routes';
import customerRoutes from './customers/customers-routes';
import dealerRoutes from './dealers/dealers-routes';
import providerRoutes from './providers/providers-routes';
import substanceRoutes from './substance/substances-routes';
import inventoryRoutes from './inventory/inventory-routes';
import orderRoutes from './orders/orders-routes';
import orderItemRoutes from './order-items/order-items-routes';
import shipmentRoutes from './shipments/shipments-routes';
import purchaseOrderRoutes from './purchase-orders/purchase-orders-routes';
import providerTransportRoutes from './provider-transports/provider-transports-routes';
import imageRoutes from './file-upload/images-routes';

const app = express();

// Cookie
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true, 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session 
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, 
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dealers', dealerRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/substances', substanceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/provider-transports', providerTransportRoutes);
app.use('/api/images', imageRoutes);

export default app;

if (process.env.NODE_ENV !== 'test') {
  const PORT = Number(process.env.PORT) || 4200;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}