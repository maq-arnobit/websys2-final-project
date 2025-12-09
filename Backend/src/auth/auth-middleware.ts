import { Request, Response, NextFunction } from 'express';
import { Session, SessionData } from 'express-session';

// Extend Express Request type
declare global {
  namespace Express {
    interface User {
      id: number;
      type: 'customer' | 'dealer' | 'provider';
      username: string;
      email?: string;
    }
    
    interface Request {
      session: Session & Partial<SessionData>;
      logout(done: (err: any) => void): void;
      logout(options: any, done: (err: any) => void): void;
    }
  }
}

// Export Request type for convenience
export type { Request as AuthRequest } from 'express';

export const authenticate = (allowedUserTypes?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated via session
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized - Please login' });
    }

    const user = req.user as Express.User;

    // Check if user type is allowed
    if (allowedUserTypes && !allowedUserTypes.includes(user.type)) {
      return res.status(403).json({ message: 'Access denied for this user type' });
    }

    next();
  };
};