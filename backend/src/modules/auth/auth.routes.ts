import { Router } from 'express';
import { register, verifyEmail, resendVerification, login, logout } from './auth.controller';
import { requireAuth } from '../../middleware/auth';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/register', authLimiter, register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/login', authLimiter, login);
router.post('/logout', requireAuth, logout);

export default router;
