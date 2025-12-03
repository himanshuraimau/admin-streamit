import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        userId: string;
        email: string;
        // Add any other admin properties you expect from your mock or actual auth system
      };
    }
  }
}
