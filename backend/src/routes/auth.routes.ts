import { Router } from 'express';

import { login, register } from '../controllers/auth.controller';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import { validate } from '../middleware/validation.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', authRateLimiter, validate(loginSchema), login);

export { authRouter };
