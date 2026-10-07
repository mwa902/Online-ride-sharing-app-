import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db/store';
import { config } from '../config/env';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);
  let payload: { sub: string; email: string; jti: string };

  try {
    payload = jwt.verify(token, config.jwtSecret) as typeof payload;
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(payload.jti).digest('hex');
  const session = db.sessionTokens.find(
    (s) => s.token_hash === tokenHash &&
           !s.invalidated &&
           new Date(s.last_active) > new Date(Date.now() - 7 * 24 * 3600 * 1000)
  );

  if (!session) {
    res.status(401).json({ error: 'Session expired or invalidated' });
    return;
  }

  session.last_active = new Date().toISOString();
  req.userId = payload.sub;
  req.userEmail = payload.email;
  next();
}
