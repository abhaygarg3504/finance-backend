import rateLimit from 'express-rate-limit';

export const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
  },
});
