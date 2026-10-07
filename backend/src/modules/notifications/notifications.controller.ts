import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../../db/store';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';

export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const notifications = db.notifications
      .filter((n) => n.user_id === req.userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);

    const unread_count = notifications.filter((n) => !n.is_read).length;
    res.json({ notifications, unread_count });
  } catch (err) { next(err); }
}

export async function markRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const n = db.notifications.find((n) => n.id === id && n.user_id === req.userId);
    if (!n) throw new AppError(404, 'Notification not found');
    n.is_read = true;
    res.json({ message: 'Notification marked as read' });
  } catch (err) { next(err); }
}

export async function markAllRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    db.notifications
      .filter((n) => n.user_id === req.userId && !n.is_read)
      .forEach((n) => { n.is_read = true; });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
}
