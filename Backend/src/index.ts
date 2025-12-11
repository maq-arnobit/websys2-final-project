import express from 'express';
import cors from 'cors';
import session from 'express-session';
// import passport from './passport/passport';
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
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { comparePassword } from './utils/utils';
import db from '../models'; 

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

interface ModelConfig {
  model: any;
  idField: string;
}

const getModelConfig = (): Record<string, ModelConfig> => {
  return {
    customer: {
      model: db.Customer,
      idField: 'customer_id'
    },
    dealer: {
      model: db.Dealer,
      idField: 'dealer_id'
    },
    provider: {
      model: db.Provider,
      idField: 'provider_id'
    }
  };
};

// Local Strategy for login
passport.use('local', new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
  async (req, username, password, done) => {
    try {
      console.log('Passport strategy called');
      console.log('req.body:', req.body);
      console.log('userType:', req.body?.userType);
      
      const { userType } = req.body;

      if (!userType) {
        console.log('No userType provided');
        return done(null, false, { message: 'User type is required' });
      }

      const modelConfig = getModelConfig();
      console.log('Model config:', Object.keys(modelConfig));
      
      const config = modelConfig[userType];
      console.log('Selected config:', config);

      if (!config) {
        console.log('Invalid user type:', userType);
        return done(null, false, { message: 'Invalid user type' });
      }

      console.log('Looking for user with username:', username);
      const user = await config.model.findOne({ where: { username } });

      if (!user) {
        console.log('User not found');
        return done(null, false, { message: 'Invalid credentials' });
      }

      if (user.status !== 'active') {
        return done(null, false, { message: 'Account is not active' });
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const userId = user[config.idField];

      return done(null, {
        id: userId,
        type: userType,
        username: user.username,
        email: user.email
      });
    } catch (error) {
      console.error('Passport strategy error:', error);
      return done(error);
    }
  }
));

// Serialize user into session
passport.serializeUser((user: any, done) => {
  done(null, {
    id: user.id,
    type: user.type
  });
});

// Deserialize user from session
passport.deserializeUser(async (sessionData: any, done) => {
  try {
    const { id, type } = sessionData;
    const modelConfig = getModelConfig();
    const config = modelConfig[type];

    if (!config) {
      return done(new Error('Invalid user type'));
    }

    const user = await config.model.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return done(new Error('User not found'));
    }

    if (user.status !== 'active') {
      return done(new Error('Account is not active'));
    }

    const userId = user[config.idField];

    done(null, {
      id: userId,
      type: type,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    done(error);
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

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
