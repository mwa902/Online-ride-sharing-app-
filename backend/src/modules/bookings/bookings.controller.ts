import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { db, now, avgRating, Booking } from '../../db/store';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { createNotification } from '../../utils/notifications';

export async function createBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { ride_id } = z.object({ ride_id: z.string() }).parse(req.body);

    const ride = db.rides.find((r) => r.id === ride_id);
    if (!ride) throw new AppError(404, 'Ride not found');
    if (ride.status !== 'active') throw new AppError(400, 'This ride is no longer available');
    if (ride.driver_id === req.userId) throw new AppError(409, 'You cannot book your own ride');
    if (ride.available_seats <= 0) throw new AppError(422, 'This ride is fully booked');

    const existing = db.bookings.find((b) => b.ride_id === ride_id && b.passenger_id === req.userId);
    if (existing) {
      if (existing.status === 'confirmed') throw new AppError(409, 'You have already booked this ride');
      // Re-activate cancelled booking
      existing.status = 'confirmed';
      existing.updated_at = now();
      ride.available_seats -= 1;
      ride.updated_at = now();
      createNotification(ride.driver_id, 'booking_confirmed', { ride_id, passenger_id: req.userId });
      res.status(201).json({ message: 'Seat booked successfully', booking: existing });
      return;
    }

    const booking: Booking = {
      id: uuid(), ride_id, passenger_id: req.userId!,
      status: 'confirmed', created_at: now(), updated_at: now(),
    };
    db.bookings.push(booking);
    ride.available_seats -= 1;
    ride.updated_at = now();

    createNotification(ride.driver_id, 'booking_confirmed', { ride_id, passenger_id: req.userId });

    res.status(201).json({ message: 'Seat booked successfully', booking });
  } catch (err) { next(err); }
}

export async function getMyBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = db.bookings
      .filter((b) => b.passenger_id === req.userId)
      .sort((a, b) => {
        const rA = db.rides.find((r) => r.id === a.ride_id);
        const rB = db.rides.find((r) => r.id === b.ride_id);
        return new Date(rB?.departure_time ?? 0).getTime() - new Date(rA?.departure_time ?? 0).getTime();
      })
      .map((b) => {
        const ride = db.rides.find((r) => r.id === b.ride_id);
        const driver = ride ? db.users.find((u) => u.id === ride.driver_id) : null;
        return {
          ...b,
          ride_id:       ride?.id,
          origin_area:   ride?.origin_area,
          destination:   ride?.destination,
          departure_time: ride?.departure_time,
          cost_per_seat:  ride?.cost_per_seat,
          ride_status:    ride?.status,
          driver_id:      driver?.id,
          driver_name:    driver?.full_name,
          driver_phone:   driver?.phone,
          driver_rating:  driver ? avgRating(driver.id) : null,
        };
      });

    res.json({ bookings });
  } catch (err) { next(err); }
}

export async function cancelBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);

    const booking = db.bookings.find((b) => b.id === id);
    if (!booking) throw new AppError(404, 'Booking not found');
    if (booking.passenger_id !== req.userId) throw new AppError(403, 'You can only cancel your own bookings');
    if (booking.status !== 'confirmed') throw new AppError(400, 'This booking is already cancelled');

    const ride = db.rides.find((r) => r.id === booking.ride_id);
    if (!ride) throw new AppError(404, 'Ride not found');

    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    if (new Date(ride.departure_time) < oneHourFromNow) {
      throw new AppError(422, 'Cancellation window has passed. Cannot cancel within 1 hour of departure.');
    }

    booking.status = 'cancelled';
    booking.updated_at = now();
    ride.available_seats += 1;
    ride.updated_at = now();

    createNotification(ride.driver_id, 'booking_cancelled', {
      ride_id: ride.id, passenger_id: req.userId,
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) { next(err); }
}
