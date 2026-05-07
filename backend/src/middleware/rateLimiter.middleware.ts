import rateLimit from 'express-rate-limit';

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000);
const max = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100);

export const apiRateLimiter = rateLimit({
  windowMs,
  max,
  message: 'Trop de requetes, reessayez plus tard',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs,
  max,
  message: 'Trop de requetes, reessayez plus tard',
  standardHeaders: true,
  legacyHeaders: false,
});
