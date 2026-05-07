import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { authenticate } from '../../src/middleware/auth.middleware';
import { AppError } from '../../src/utils/AppError';
import { generateTestToken } from '../setup';

describe('auth.middleware authenticate', () => {
  const res = {} as Response;
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
  });

  it('should populate req.user with valid token', () => {
    const token = generateTestToken({
      userId: 'user-123',
      email: 'valid@example.com',
      role: 'admin',
    });

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request;

    authenticate(req, res, next);

    expect(req.user).toEqual({
      userId: 'user-123',
      email: 'valid@example.com',
      role: 'admin',
    });
    expect(next).toHaveBeenCalledWith();
  });

  it('should return 401 when token is missing', () => {
    const req = {
      headers: {},
    } as Request;

    authenticate(req, res, next);

    const error = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('manquant');
  });

  it('should return 401 for invalid token', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    } as Request;

    authenticate(req, res, next);

    const error = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('invalide');
  });

  it('should return 401 for expired token', () => {
    const expiredToken = jwt.sign(
      {
        userId: 'expired-user',
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '0s' },
    );

    const req = {
      headers: {
        authorization: `Bearer ${expiredToken}`,
      },
    } as Request;

    authenticate(req, res, next);

    const error = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('expire');
  });
});
