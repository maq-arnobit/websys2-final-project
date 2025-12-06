import { Request, Response } from 'express';
import { hashPassword, comparePassword } from '../utils/utils';
import { createSession, deleteSession, AuthRequest } from '../middleware/auth-middleware';

let db: any;

interface UserModel {
  findOne: (options: any) => Promise<any>;
  create: (data: any) => Promise<any>;
  findByPk: (id: number, options?: any) => Promise<any>;
}

interface ModelConfig {
  model: UserModel;
  idField: string;
  requiredFields: string[];
  additionalFields?: Record<string, any>;
}

export class AuthController {
  private static getDb() {
    if (!db) {
      db = require('../../models');
    }
    return db;
  }

  private static getModelConfig(): Record<string, ModelConfig> {
    const database = this.getDb();
    
    return {
      customer: {
        model: database.Customer,
        idField: 'customer_id',
        requiredFields: ['username', 'password', 'email'],
        additionalFields: { status: 'active' }
      },
      dealer: {
        model: database.Dealer,
        idField: 'dealer_id',
        requiredFields: ['username', 'password', 'email'],
        additionalFields: { status: 'active', rating: 0.0 }
      },
      provider: {
        model: database.Provider,
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
          [userType]: sanitizedUser
        });
      } catch (error: any) {
        if ((error.code === '23505' || error.parent?.code === '23505') && 
            (error.constraint?.includes('_pkey') || error.parent?.constraint?.includes('_pkey'))) {
          attempts++;
          
          const db = this.getDb();
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

  static login = async (req: Request, res: Response) => {
    try {
      const { username, password, userType } = req.body;

      if (!username || !password || !userType) {
        return res.status(400).json({ message: 'Username, password, and userType are required' });
      }

      const modelConfig = this.getModelConfig();
      const config = modelConfig[userType];
      
      if (!config) {
        return res.status(400).json({ message: 'Invalid user type' });
      }

      const user = await config.model.findOne({ where: { username } });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ message: 'Account is not active' });
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const userId = user[config.idField];
      const sessionId = createSession(userId, userType, username);

      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
      });

      return res.status(200).json({
        message: 'Login successful',
        userType,
        userId,
        username: user.username,
        email: user.email
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  }

  static logout = async (req: AuthRequest, res: Response) => {
    try {
      const sessionId = req.cookies?.sessionId;

      if (sessionId) {
        deleteSession(sessionId);
      }

      res.clearCookie('sessionId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });

      return res.status(200).json({ message: 'Logout successful' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error logging out', error: error.message });
    }
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
