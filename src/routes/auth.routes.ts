import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);

router.post('/login', authRateLimiter, validate(loginSchema), authController.login);

router.get('/me', authenticate, authController.getMe);

export default router;
