import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { submitRating, getUserRatings } from './ratings.controller';

const router = Router();
router.use(requireAuth);

router.post('/', submitRating);
router.get('/user/:userId', getUserRatings);

export default router;
