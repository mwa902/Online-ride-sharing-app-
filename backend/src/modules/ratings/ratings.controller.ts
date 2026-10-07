import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { db, now, avgRating, Rating } from '../../db/store';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';

const SubmitSchema = z.object({
  ride_id:  z.string(),
  ratee_id: z.string(),
  score:    z.number().int().min(1).max(5),
  comment:  z.string().max(500).optional(),
});

export async function submitRating(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = SubmitSchema.parse(req.body);
    if (body.ratee_id === req.userId) throw new AppError(400, 'You cannot rate yourself');

    const ride = db.rides.find((r) => r.id === body.ride_id);
    if (!ride) throw new AppError(404, 'Ride not found');
    if (ride.status !== 'completed') throw new AppError(422, 'Ratings can only be submitted for completed rides');

    // Check rater participated
    const isDriver = ride.driver_id === req.userId;
    const isPassenger = db.bookings.some(
      (b) => b.ride_id === body.ride_id && b.passenger_id === req.userId && b.status === 'confirmed'
    );
    if (!isDriver && !isPassenger) throw new AppError(403, 'You did not participate in this ride');

    // Check ratee participated
    const rateeIsDriver = ride.driver_id === body.ratee_id;
    const rateeIsPassenger = db.bookings.some(
      (b) => b.ride_id === body.ride_id && b.passenger_id === body.ratee_id && b.status === 'confirmed'
    );
    if (!rateeIsDriver && !rateeIsPassenger) throw new AppError(403, 'That user did not participate in this ride');

    // Duplicate check
    const dup = db.ratings.find(
      (r) => r.ride_id === body.ride_id && r.rater_id === req.userId && r.ratee_id === body.ratee_id
    );
    if (dup) throw new AppError(409, 'You have already rated this user for this ride');

    const rating: Rating = {
      id: uuid(), ride_id: body.ride_id, rater_id: req.userId!,
      ratee_id: body.ratee_id, score: body.score,
      comment: body.comment ?? null, created_at: now(),
    };
    db.ratings.push(rating);
    res.status(201).json(rating);
  } catch (err) { next(err); }
}

export async function getUserRatings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = z.object({ userId: z.string() }).parse(req.params);
    const userRatings = db.ratings.filter((r) => r.ratee_id === userId);

    if (userRatings.length === 0) {
      res.json({ average_rating: null, total_ratings: 0, message: 'No ratings yet', ratings: [] });
      return;
    }

    const avg = avgRating(userId);
    const list = userRatings
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((r) => {
        const rater = db.users.find((u) => u.id === r.rater_id);
        return { ...r, rater_name: rater?.full_name ?? 'Unknown' };
      });

    res.json({ average_rating: avg, total_ratings: userRatings.length, ratings: list });
  } catch (err) { next(err); }
}
