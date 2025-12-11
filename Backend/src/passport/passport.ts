import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { comparePassword } from '../utils/utils';
import db from '../../models'; 

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

export default passport;
