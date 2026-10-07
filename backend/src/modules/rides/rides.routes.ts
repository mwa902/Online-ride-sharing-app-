import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import {
  postRide, searchRides, getRide, getMyRides,
  cancelRide, completeRide
} from './rides.controller';

const router = Router();
router.use(requireAuth);

router.post('/', postRide);
router.get('/search', searchRides);
router.get('/mine', getMyRides);
router.get('/:id', getRide);
router.patch('/:id/cancel', cancelRide);
router.patch('/:id/complete', completeRide);

export default router;
