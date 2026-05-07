import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';

import { config } from '../config/env';
import { AppError } from '../utils/AppError';

interface AuthUser {
  userId: string;
  email?: string;
  role?: string;
}

interface AuthTokenPayload extends JwtPayload {
  userId: string;
  email?: string;
  role?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    next(new AppError("Token d'authentification manquant.", 401));
    return;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    next(new AppError("Format d'autorisation invalide. Utilisez 'Bearer <token>'.", 401));
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as AuthTokenPayload | string;

    if (typeof decoded === 'string' || !decoded.userId) {
      next(new AppError("Token invalide: donnees utilisateur introuvables.", 401));
      return;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next(new AppError('Token expire. Veuillez vous reconnecter.', 401));
      return;
    }

    next(new AppError('Token invalide ou non verifiable.', 401));
  }
};
