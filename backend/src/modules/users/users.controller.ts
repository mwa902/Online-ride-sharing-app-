import { Response, NextFunction } from 'express';
import { z } from 'zod';
import path from 'path';
import { db, ownUser, publicUser, avgRating, completedRides, now } from '../../db/store';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { config } from '../../config/env';

export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = db.users.find((u) => u.id === req.userId);
    if (!user) throw new AppError(404, 'User not found');
    res.json(ownUser(user));
  } catch (err) { next(err); }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const UpdateSchema = z.object({
      full_name: z.string().min(2).max(100).optional(),
      phone: z.string().min(7).max(20).optional(),
    });
    const body = UpdateSchema.parse(req.body);
    const user = db.users.find((u) => u.id === req.userId);
    if (!user) throw new AppError(404, 'User not found');

    if (body.full_name) user.full_name = body.full_name;
    if (body.phone) user.phone = body.phone;
    if (req.file) {
      user.profile_photo = `http://localhost:${config.port}/uploads/${req.file.filename}`;
    }
    user.updated_at = now();

    res.json(ownUser(user));
  } catch (err) { next(err); }
}

export async function getPublicProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const user = db.users.find((u) => u.id === id);
    if (!user) throw new AppError(404, 'User not found');
    res.json(publicUser(user));
  } catch (err) { next(err); }
}
