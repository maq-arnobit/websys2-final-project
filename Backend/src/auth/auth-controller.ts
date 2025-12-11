import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { hashPassword } from '../utils/utils';
import { AuthRequest } from './auth-middleware';

import db from '../../models';

interface ModelConfig {
  model: any;
  idField: string;
  requiredFields: string[];
  additionalFields?: Record<string, any>;
}

export class AuthController {
  private static getModelConfig(): Record<string, ModelConfig> {
    return {
      customer: {
        model: db.Customer,
        idField: 'customer_id',
        requiredFields: ['username', 'password', 'email'],
        additionalFields: { status: 'active' }
      },
      dealer: {
        model: db.Dealer,
        idField: 'dealer_id',
        requiredFields: ['username', 'password', 'email'],
        additionalFields: { status: 'active', rating: 0.0 }
      },
      provider: {
        model: db.Provider,
        idField: 'provider_id',
        requiredFields: ['username', 'password', 'email', 'businessName'],
        additionalFields: { status: 'active' }
      }
    };
  }

  private static async registerUser(req: Request, res: Response, userType: string) {
    const maxRetries = 20;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        const modelConfig = this.getModelConfig();
        const config = modelConfig[userType];

        if (!config || !config.model) {
          return res.status(500).json({ 
            message: `Configuration error for ${userType}`,
            error: 'Model not initialized'
          });
        }

        const data = req.body;

        if (attempts === 0) {
          const missingFields = config.requiredFields.filter(field => !data[field]);
          if (missingFields.length > 0) {
            return res.status(400).json({ 
              message: `Missing required fields: ${missingFields.join(', ')}` 
            });
          }
        }

        const { customer_id, dealer_id, provider_id, ...cleanData } = data;

        const hashedPassword = await hashPassword(cleanData.password);
        const userData = {
          ...cleanData,
          password: hashedPassword,
          ...config.additionalFields
        };

        const user = await config.model.create(userData);

        const userJson = user.toJSON();
        const { password, ...sanitizedUser } = userJson;

        return res.status(201).json({
          message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} registered successfully`,
        });
      } catch (error: any) {
        if ((error.code === '23505' || error.parent?.code === '23505') && 
            (error.constraint?.includes('_pkey') || error.parent?.constraint?.includes('_pkey'))) {
          attempts++;
          
          const sequenceName = `${userType}s_${userType}_id_seq`;
          
          try {
            await db.sequelize.query(`SELECT nextval('${sequenceName}')`);
            continue;
          } catch (seqError) {}
          
          if (attempts >= maxRetries) {
            return res.status(500).json({ 
              message: `Unable to create ${userType} after ${maxRetries} attempts. Please contact support.`,
              error: 'ID generation failed'
            });
          }
          continue;
        }
        
        if (error.name === 'SequelizeUniqueConstraintError') {
          let field = null;
          
          if (error.fields) {
            field = Object.keys(error.fields)[0];
          } else if (error.errors && error.errors.length > 0) {
            field = error.errors[0].path;
          } else if (error.parent?.constraint) {
            const match = error.parent.constraint.match(/_([^_]+)_key$/);
            if (match) field = match[1];
          }
          
          if (field === 'username') {
            return res.status(400).json({ message: 'Username already exists' });
          } else if (field === 'email') {
            return res.status(400).json({ message: 'Email already exists' });
          }
          return res.status(400).json({ message: 'Username or email already exists' });
        }
        
        return res.status(500).json({ 
          message: `Error registering ${userType}`, 
          error: error.message 
        });
      }
    }
  }

  static registerCustomer = async (req: Request, res: Response) => {
    return AuthController.registerUser(req, res, 'customer');
  }

  static registerDealer = async (req: Request, res: Response) => {
    return AuthController.registerUser(req, res, 'dealer');
  }

  static registerProvider = async (req: Request, res: Response) => {
    return AuthController.registerUser(req, res, 'provider');
  }

  static login = (req: Request, res: Response, next: NextFunction) => {
  // Validate userType exists before calling passport
  if (!req.body.userType) {
    return res.status(400).json({ message: 'User type is required' });
  }

  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging in', error: err.message });
    }

    if (!user) {
      return res.status(401).json({ message: info?.message || 'Invalid credentials' });
    }

    // Login user with session
    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ message: 'Error creating session', error: loginErr.message });
      }

      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          type: user.type,
          username: user.username,
          email: user.email
        }
      });
    });
  })(req, res, next);
}

  static logout = async (req: AuthRequest, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out', error: err.message });
      }
      
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          return res.status(500).json({ message: 'Error destroying session', error: sessionErr.message });
        }
        
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logout successful' });
      });
    });
  }

  static getProfile = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const modelConfig = this.getModelConfig();
      const config = modelConfig[req.user.type];
      
      const user = await config.model.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
  }
}
