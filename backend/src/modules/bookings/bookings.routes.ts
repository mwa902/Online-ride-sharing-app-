import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { createBooking, getMyBookings, cancelBooking } from './bookings.controller';

const router = Router();
router.use(requireAuth);

router.post('/', createBooking);
router.get('/mine', getMyBookings);
router.patch('/:id/cancel', cancelBooking);

export default router;
