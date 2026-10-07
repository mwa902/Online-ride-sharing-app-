import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { db, now, User } from '../../db/store';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';

const UOL_EMAIL_RE = /^[\w.+\-]+@student\.uol\.edu\.pk$/i;

const RegisterSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email().refine((e) => UOL_EMAIL_RE.test(e), {
    message: 'Only @student.uol.edu.pk email addresses are accepted',
  }),
  password: z.string().min(8).max(128),
  phone: z.string().min(7).max(20),
});

const LoginSchema = z.object({
  email: z.string().email().refine((e) => UOL_EMAIL_RE.test(e), {
    message: 'Only @student.uol.edu.pk email addresses are accepted',
  }),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = RegisterSchema.parse(req.body);
    const emailLower = body.email.toLowerCase();

    if (db.users.find((u) => u.email === emailLower)) {
      throw new AppError(409, 'An account with this email already exists');
    }

    const password_hash = await bcrypt.hash(body.password, 10);
    const user: User = {
      id: uuid(), full_name: body.full_name, email: emailLower,
      phone: body.phone, password_hash,
      is_verified: false, profile_photo: null,
      created_at: now(), updated_at: now(),
    };
    db.users.push(user);

    // Verification token (auto-verify in demo mode after 2s for convenience)
    const token = crypto.randomBytes(32).toString('hex');
    db.verificationTokens.push({
      id: uuid(), user_id: user.id, token,
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      used: false,
    });

    res.status(201).json({
      message: `Account created! Use the token below to verify (no real email in demo mode).`,
      dev_token: token,
      verify_url: `http://localhost:5173/verify-email?token=${token}`,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = z.object({ token: z.string().min(1) }).parse(req.body);

    const vt = db.verificationTokens.find((v) => v.token === token);
    if (!vt) throw new AppError(400, 'Invalid or expired verification token');
    if (vt.used) throw new AppError(400, 'This verification token has already been used');
    if (new Date(vt.expires_at) < new Date()) {
      throw new AppError(400, 'Verification token has expired. Please request a new one.');
    }

    const user = db.users.find((u) => u.id === vt.user_id);
    if (!user) throw new AppError(400, 'User not found');
    user.is_verified = true;
    user.updated_at = now();
    vt.used = true;

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
}

export async function resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    if (!UOL_EMAIL_RE.test(email)) throw new AppError(400, 'Only @student.uol.edu.pk email addresses are accepted');

    const user = db.users.find((u) => u.email === email.toLowerCase());
    if (!user || user.is_verified) {
      res.json({ message: 'If an unverified account exists, a new verification token has been created.' });
      return;
    }

    // Invalidate old tokens
    db.verificationTokens.filter((v) => v.user_id === user.id && !v.used).forEach((v) => { v.used = true; });

    const token = crypto.randomBytes(32).toString('hex');
    db.verificationTokens.push({
      id: uuid(), user_id: user.id, token,
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      used: false,
    });

    res.json({
      message: 'New verification token created.',
      dev_token: token,
      verify_url: `http://localhost:5173/verify-email?token=${token}`,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = LoginSchema.parse(req.body);
    const user = db.users.find((u) => u.email === body.email.toLowerCase());

    if (!user) throw new AppError(401, 'Invalid credentials');
    if (!user.is_verified) throw new AppError(403, 'Please verify your email address before logging in');

    const ok = await bcrypt.compare(body.password, user.password_hash);
    if (!ok) throw new AppError(401, 'Invalid credentials');

    const jti = uuid();
    const token = jwt.sign(
      { sub: user.id, email: user.email, jti },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const tokenHash = crypto.createHash('sha256').update(jti).digest('hex');
    db.sessionTokens.push({
      id: uuid(), user_id: user.id, token_hash: tokenHash,
      last_active: now(), invalidated: false,
    });

    res.json({ token, expires_in: 604800 });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.slice(7);
    if (token) {
      const payload = jwt.decode(token) as { jti?: string } | null;
      if (payload?.jti) {
        const hash = crypto.createHash('sha256').update(payload.jti).digest('hex');
        const session = db.sessionTokens.find((s) => s.token_hash === hash);
        if (session) session.invalidated = true;
      }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}
