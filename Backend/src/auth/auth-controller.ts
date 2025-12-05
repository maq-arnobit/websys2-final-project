import { Request, Response } from 'express';
import { hashPassword, comparePassword, createSession, deleteSession, AuthRequest } from './auth-middleware';
const db = require('../../models');

export class AuthController {
  static async registerCustomer(req: Request, res: Response) {
    try {
      const { username, password, email, address } = req.body;

      if (!username || !password || !email) {
        return res.status(400).json({ message: 'Username, password, and email are required' });
      }

      const hashedPassword = await hashPassword(password);

      const customer = await db.Customer.create({
        username,
        password: hashedPassword,
        email,
        address,
        status: 'active'
      });

      return res.status(201).json({
        message: 'Customer registered successfully',
        customer: {
          customer_id: customer.customer_id,
          username: customer.username,
          email: customer.email,
          address: customer.address,
          status: customer.status
        }
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      return res.status(500).json({ message: 'Error registering customer', error: error.message });
    }
  }

  static async registerDealer(req: Request, res: Response) {
    try {
      const { username, password, email, warehouse } = req.body;

      if (!username || !password || !email) {
        return res.status(400).json({ message: 'Username, password, and email are required' });
      }

      const hashedPassword = await hashPassword(password);

      const dealer = await db.Dealer.create({
        username,
        password: hashedPassword,
        email,
        warehouse,
        status: 'active',
        rating: 0.00
      });

      return res.status(201).json({
        message: 'Dealer registered successfully',
        dealer: {
          dealer_id: dealer.dealer_id,
          username: dealer.username,
          email: dealer.email,
          warehouse: dealer.warehouse,
          status: dealer.status,
          rating: dealer.rating
        }
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      return res.status(500).json({ message: 'Error registering dealer', error: error.message });
    }
  }

  static async registerProvider(req: Request, res: Response) {
    try {
      const { username, password, email, businessName } = req.body;

      if (!username || !password || !email || !businessName) {
        return res.status(400).json({ message: 'Username, password, email, and businessName are required' });
      }

      const hashedPassword = await hashPassword(password);

      const provider = await db.Provider.create({
        username,
        password: hashedPassword,
        email,
        businessName,
        status: 'active'
      });

      return res.status(201).json({
        message: 'Provider registered successfully',
        provider: {
          provider_id: provider.provider_id,
          username: provider.username,
          email: provider.email,
          businessName: provider.businessName,
          status: provider.status
        }
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      return res.status(500).json({ message: 'Error registering provider', error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password, userType } = req.body;

      if (!username || !password || !userType) {
        return res.status(400).json({ message: 'Username, password, and userType are required' });
      }

      let user;
      let userId;
      let model;

      switch (userType) {
        case 'customer':
          model = db.Customer;
          user = await model.findOne({ where: { username } });
          userId = user?.customer_id;
          break;
        case 'dealer':
          model = db.Dealer;
          user = await model.findOne({ where: { username } });
          userId = user?.dealer_id;
          break;
        case 'provider':
          model = db.Provider;
          user = await model.findOne({ where: { username } });
          userId = user?.provider_id;
          break;
        default:
          return res.status(400).json({ message: 'Invalid user type' });
      }

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

      const sessionId = createSession(userId, userType, username);

      
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: false, 
        sameSite: 'lax', 
        maxAge: 24 * 60 * 60 * 1000, // 1 day
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

  static async logout(req: AuthRequest, res: Response) {
    try {
      const sessionId = req.cookies?.sessionId;

      if (sessionId) {
        deleteSession(sessionId);
      }

      // Clear the cookie
      res.clearCookie('sessionId', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/'
      });

      return res.status(200).json({ message: 'Logout successful' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error logging out', error: error.message });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      let user;

      switch (req.user.type) {
        case 'customer':
          user = await db.Customer.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
          });
          break;
        case 'dealer':
          user = await db.Dealer.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
          });
          break;
        case 'provider':
          user = await db.Provider.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
          });
          break;
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
  }
}