import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware';
import { BaseController } from './base-controllers';
import { hashPassword } from '../utils/utils';
const db = require('../../models');

export class UserController extends BaseController {
  constructor(
    private userType: 'customer' | 'dealer' | 'provider',
    private model: any,
    private idField: string
  ) {
    super();
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!this.checkOwnership(req, parseInt(id))) {
        return this.unauthorizedResponse(res, 'Cannot access other profiles');
      }

      const user = await this.model.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({ message: `${this.userType} not found` });
      }

      return res.status(200).json({ [this.userType]: user });
    } catch (error: any) {
      return this.handleError(res, error, `Error fetching ${this.userType}`);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { password, ...otherData } = req.body;

      if (!this.checkOwnership(req, parseInt(id), this.userType)) {
        return this.unauthorizedResponse(res, 'Cannot update other profiles');
      }

      const user = await this.model.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: `${this.userType} not found` });
      }

      const updateData: any = { ...otherData };
      if (password) {
        updateData.password = await hashPassword(password);
      }

      await user.update(updateData);

      const updatedUser = await this.model.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      return res.status(200).json({
        message: `${this.userType} updated successfully`,
        [this.userType]: updatedUser
      });
    } catch (error: any) {
      return this.handleError(res, error, `Error updating ${this.userType}`);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!this.checkOwnership(req, parseInt(id), this.userType)) {
        return this.unauthorizedResponse(res, 'Cannot delete other accounts');
      }

      const user = await this.model.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: `${this.userType} not found` });
      }

      await user.destroy();

      return res.status(200).json({ message: `${this.userType} account deleted successfully` });
    } catch (error: any) {
      return this.handleError(res, error, `Error deleting ${this.userType}`);
    }
  }
}