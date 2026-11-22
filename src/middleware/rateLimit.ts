import rateLimit from 'express-rate-limit';

const message = (text: string) => ({ error: { code: 'RATE_LIMITED', message: text } });

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Too many requests, please try again later'),
});

// Stricter limit on login/register to slow down credential stuffing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Too many authentication attempts, please try again later'),
});
