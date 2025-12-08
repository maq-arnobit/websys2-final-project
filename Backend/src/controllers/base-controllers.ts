import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware';

export abstract class BaseController {
  protected handleError(res: Response, error: any, message: string) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    return res.status(500).json({ message, error: error.message });
  }

  protected checkOwnership(req: AuthRequest, resourceUserId: number, resourceType?: string): boolean {
    if (!req.user) return false;
    if (resourceType && req.user.type !== resourceType) return false;
    return req.user.id === resourceUserId;
  }

  protected unauthorizedResponse(res: Response, message: string = 'Access denied') {
    return res.status(403).json({ message });
  }
}   