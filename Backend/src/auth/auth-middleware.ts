import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    type: 'customer' | 'dealer' | 'provider';
    username: string;
  };
}


const sessions = new Map<string, { userId: number; userType: string; username: string }>();

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const createSession = (userId: number, userType: string, username: string): string => {
  const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  sessions.set(sessionId, { userId, userType, username });
  return sessionId;
};

export const getSession = (sessionId: string) => {
  return sessions.get(sessionId);
};

export const deleteSession = (sessionId: string): void => {
  sessions.delete(sessionId);
};

export const authenticate = (allowedUserTypes?: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session token provided' });
    }

    const session = getSession(sessionId);

    if (!session) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    if (allowedUserTypes && !allowedUserTypes.includes(session.userType)) {
      return res.status(403).json({ message: 'Access denied for this user type' });
    }

    req.user = {
      id: session.userId,
      type: session.userType as 'customer' | 'dealer' | 'provider',
      username: session.username
    };

    next();
  };
};