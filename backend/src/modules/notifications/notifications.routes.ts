import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { getNotifications, markRead, markAllRead } from './notifications.controller';

const router = Router();
router.use(requireAuth);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

export default router;
