import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../utils/auth';

interface DecodedToken {
  id: string; // Replace with actual fields returned by your token
  email: string; // Replace with actual fields returned by your token
  role?: string; // Optional field, if applicable
}

type Handler = (
  req: NextApiRequest & { user?: DecodedToken },
  res: NextApiResponse
) => Promise<void>;

export const protectRoute = (handler: Handler): Handler => {
  return async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token is missing' });
    }

    try {
      const decoded = verifyToken(token) as unknown as DecodedToken;

      if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      req.user = decoded; // Attach the user info to the request object
      return handler(req, res);
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
};
export const roleBasedAccess = (allowedRoles: string | any[]) => {
  return (handler: (arg0: any, arg1: any) => any) => {
    return async (
      req: { user: { role: any } },
      res: {
        status: (arg0: number) => {
          (): any;
          new (): any;
          json: { (arg0: { error: string }): any; new (): any };
        };
      }
    ) => {
      const { role } = req.user;

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return handler(req, res);
    };
  };
};
