import {Request, Response, NextFunction} from 'express';
import { authenticate } from './auth-middleware';
 

jest.mock('./auth-middleware', () => ({
    authenticate: (allowedUserTypes: string[] = []) => {
        return (req: any, res: any, next: any) => {

            if (!req.isAuthenticated()) {
                return res.status(401).json({ message: 'Unauthorized - Please login' });
            }

            if (allowedUserTypes.length > 0 &&(!req.user || !allowedUserTypes.includes(req.user.type))) {
                return res.status(403).json({ message: 'Access denied for this user type' });
            }

            next();
        };
    }
}));

describe("Authentication Middleware", () => {
    const mockRes = () => {
        const res = {} as any;
        res.status = jest.fn().mockReturnValue(res),
        res.json = jest.fn().mockReturnValue(res)
        return res;
    }

    const mockNext = () => jest.fn();

    test("Should return 401 if not authorized", async () => {
        const req = {
            isAuthenticated: () => false,
            user: null
        } as Request;
        const res = mockRes();
        const next = mockNext();

        authenticate()(req,res,next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({message: 'Unauthorized - Please login'});
        expect(next).not.toHaveBeenCalled();


    })

    test("Should accept user", async () => {
        const req = {
            isAuthenticated: () => true,
            user: {type: 'customer'}
        } as any;

        const res = mockRes();
        const next = mockNext();

        authenticate(['customer'])(req,res,next);

        expect(next).toHaveBeenCalled();
    })

    test("Should return 403 if not in user type", async () => {
        const req = {
            isAuthenticated: () => true,
            user: { type: "alien" }
         } as any;

    const res = mockRes();
    const next = mockNext();

    authenticate(['customer','dealer','provider'])(req,res,next);

     expect(res.status).toHaveBeenCalledWith(403);
     expect(res.json).toHaveBeenCalledWith({message: 'Access denied for this user type'});
     expect(next).not.toHaveBeenCalled();

    })
   
    
})