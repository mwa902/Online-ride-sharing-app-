import { v4 as uuid } from 'uuid';
import { db } from '../db/store';

export type NotificationType =
  | 'booking_confirmed'
  | 'ride_cancelled'
  | 'booking_cancelled'
  | 'rate_prompt';

export function createNotification(
  userId: string,
  type: NotificationType,
  payload: Record<string, unknown>
): void {
  db.notifications.push({
    id: uuid(),
    user_id: userId,
    type,
    payload,
    is_read: false,
    created_at: new Date().toISOString(),
  });
}
