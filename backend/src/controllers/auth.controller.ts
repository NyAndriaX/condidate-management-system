import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../config/env';
import { UserModel } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

interface AuthBody {
  email: string;
  password: string;
  name?: string;
}

interface SafeUser {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

const createToken = (userId: string, email: string, role: string): string =>
  jwt.sign({ userId, email, role }, config.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
  });

const toSafeUser = (userData: {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}): SafeUser => ({
  _id: userData._id,
  email: userData.email,
  name: userData.name,
  role: userData.role,
  createdAt: userData.createdAt,
  updatedAt: userData.updatedAt,
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body as AuthBody;

  if (!email || !password || !name) {
    throw new AppError('Email, mot de passe et nom sont requis.', 400);
  }

  const existingUser = await UserModel.findOne({ email }).exec();
  if (existingUser) {
    throw new AppError('Un utilisateur avec cet email existe deja.', 409);
  }

  const user = await UserModel.create({ email, password, name });
  const token = createToken(user.id, user.email, user.role);

  res.status(201).json({
    success: true,
    token,
    user: toSafeUser({
      _id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }),
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as AuthBody;

  if (!email || !password) {
    throw new AppError('Email et mot de passe sont requis.', 400);
  }

  const user = await UserModel.findOne({ email }).exec();
  if (!user) {
    throw new AppError('Identifiants invalides.', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Identifiants invalides.', 401);
  }

  const token = createToken(user.id, user.email, user.role);

  res.status(200).json({
    success: true,
    token,
    user: toSafeUser({
      _id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }),
  });
});
