import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { db, now, avgRating, Ride } from '../../db/store';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { createNotification } from '../../utils/notifications';

const PostRideSchema = z.object({
  origin_area:    z.string().min(2).max(100),
  destination:    z.string().min(2).max(100),
  departure_time: z.string(),
  total_seats:    z.number().int().min(1).max(4),
  cost_per_seat:  z.number().min(0),
});

function rideWithDriver(ride: Ride) {
  const driver = db.users.find((u) => u.id === ride.driver_id);
  return {
    ...ride,
    driver_name:   driver?.full_name ?? '',
    driver_phone:  driver?.phone ?? '',
    driver_photo:  driver?.profile_photo ?? null,
    driver_rating: avgRating(ride.driver_id),
  };
}

export async function postRide(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = PostRideSchema.parse(req.body);
    const departureDate = new Date(body.departure_time);
    if (isNaN(departureDate.getTime())) throw new AppError(400, 'Invalid departure time format');
    if (departureDate <= new Date()) throw new AppError(400, 'Departure time must be in the future');

    const active = db.rides.find((r) => r.driver_id === req.userId && r.status === 'active');
    if (active) throw new AppError(409, 'You already have an active ride. Cancel or complete it first.');

    const ride: Ride = {
      id: uuid(), driver_id: req.userId!,
      origin_area: body.origin_area, destination: body.destination,
      departure_time: departureDate.toISOString(),
      total_seats: body.total_seats, available_seats: body.total_seats,
      cost_per_seat: body.cost_per_seat, status: 'active',
      created_at: now(), updated_at: now(),
    };
    db.rides.push(ride);
    res.status(201).json(rideWithDriver(ride));
  } catch (err) { next(err); }
}

export async function searchRides(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = z.object({
      origin_area: z.string().min(1),
      destination: z.string().min(1),
      date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }).parse(req.query);

    const results = db.rides
      .filter((r) =>
        r.status === 'active' &&
        r.available_seats > 0 &&
        new Date(r.departure_time) > new Date() &&
        r.origin_area.toLowerCase() === q.origin_area.toLowerCase() &&
        r.destination.toLowerCase() === q.destination.toLowerCase() &&
        r.departure_time.startsWith(q.date)
      )
      .sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime())
      .map(rideWithDriver);

    if (results.length === 0) {
      res.json({ rides: [], message: 'No rides found for the given criteria' });
      return;
    }
    res.json({ rides: results });
  } catch (err) { next(err); }
}

export async function getRide(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const ride = db.rides.find((r) => r.id === id);
    if (!ride) throw new AppError(404, 'Ride not found');

    const result: Record<string, unknown> = { ...rideWithDriver(ride) };

    // Attach passenger list if viewer is the driver
    if (ride.driver_id === req.userId) {
      result.bookings = db.bookings
        .filter((b) => b.ride_id === ride.id && b.status === 'confirmed')
        .map((b) => {
          const p = db.users.find((u) => u.id === b.passenger_id);
          return { ...b, passenger_name: p?.full_name ?? '', passenger_phone: p?.phone ?? '' };
        });
    }
    res.json(result);
  } catch (err) { next(err); }
}

export async function getMyRides(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const rides = db.rides
      .filter((r) => r.driver_id === req.userId)
      .sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime())
      .map((r) => ({
        ...r,
        confirmed_bookings: db.bookings.filter((b) => b.ride_id === r.id && b.status === 'confirmed').length,
      }));
    res.json({ rides });
  } catch (err) { next(err); }
}

export async function cancelRide(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const ride = db.rides.find((r) => r.id === id);
    if (!ride) throw new AppError(404, 'Ride not found');
    if (ride.driver_id !== req.userId) throw new AppError(403, 'Only the driver can cancel this ride');
    if (ride.status !== 'active') throw new AppError(400, `Cannot cancel a ride with status: ${ride.status}`);

    ride.status = 'cancelled';
    ride.updated_at = now();

    // Cancel all confirmed bookings and notify passengers
    db.bookings
      .filter((b) => b.ride_id === id && b.status === 'confirmed')
      .forEach((b) => {
        b.status = 'cancelled';
        b.updated_at = now();
        createNotification(b.passenger_id, 'ride_cancelled', {
          ride_id: id, origin_area: ride.origin_area, destination: ride.destination,
        });
      });

    res.json({ message: 'Ride cancelled successfully' });
  } catch (err) { next(err); }
}

export async function completeRide(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const ride = db.rides.find((r) => r.id === id);
    if (!ride) throw new AppError(404, 'Ride not found');
    if (ride.driver_id !== req.userId) throw new AppError(403, 'Only the driver can complete this ride');
    if (ride.status !== 'active') throw new AppError(400, `Cannot complete a ride with status: ${ride.status}`);
    if (new Date(ride.departure_time) > new Date()) {
      throw new AppError(422, 'Cannot mark a ride as completed before its departure time');
    }

    ride.status = 'completed';
    ride.updated_at = now();

    // Notify passengers to rate
    db.bookings
      .filter((b) => b.ride_id === id && b.status === 'confirmed')
      .forEach((b) => {
        createNotification(b.passenger_id, 'rate_prompt', {
          ride_id: id, driver_id: ride.driver_id,
        });
      });

    res.json({ message: 'Ride marked as completed' });
  } catch (err) { next(err); }
}
