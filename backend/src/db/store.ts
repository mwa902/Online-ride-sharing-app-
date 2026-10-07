/**
 * In-memory data store — replaces the database entirely.
 * Data lives in RAM; resets when the server restarts.
 * Pre-seeded with demo accounts and rides so the app works immediately.
 */
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  is_verified: boolean;
  profile_photo: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used: boolean;
}

export interface SessionToken {
  id: string;
  user_id: string;
  token_hash: string;
  last_active: string;
  invalidated: boolean;
}

export interface Ride {
  id: string;
  driver_id: string;
  origin_area: string;
  destination: string;
  departure_time: string;
  total_seats: number;
  available_seats: number;
  cost_per_seat: number;
  status: 'active' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  ride_id: string;
  passenger_id: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: string;
  ride_id: string;
  rater_id: string;
  ratee_id: string;
  score: number;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const db = {
  users:               [] as User[],
  verificationTokens:  [] as VerificationToken[],
  sessionTokens:       [] as SessionToken[],
  rides:               [] as Ride[],
  bookings:            [] as Booking[],
  ratings:             [] as Rating[],
  notifications:       [] as Notification[],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function now(): string {
  return new Date().toISOString();
}

/** Average rating for a user, rounded to 1dp. Returns null if no ratings. */
export function avgRating(userId: string): number | null {
  const scores = db.ratings.filter((r) => r.ratee_id === userId).map((r) => r.score);
  if (scores.length === 0) return null;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

/** Count completed rides where user was driver */
export function completedRides(userId: string): number {
  return db.rides.filter((r) => r.driver_id === userId && r.status === 'completed').length;
}

/** Public user shape (no email, no hash) */
export function publicUser(u: User) {
  return {
    id: u.id,
    full_name: u.full_name,
    phone: u.phone,
    profile_photo: u.profile_photo,
    average_rating: avgRating(u.id),
    total_ratings: db.ratings.filter((r) => r.ratee_id === u.id).length,
    completed_rides: completedRides(u.id),
    created_at: u.created_at,
  };
}

/** Own user shape (includes email) */
export function ownUser(u: User) {
  return { ...publicUser(u), email: u.email };
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

async function seed() {
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // Users
  const u1: User = {
    id: uuid(), full_name: 'Ali Hassan', email: 'ali.hassan@student.uol.edu.pk',
    phone: '03001234567', password_hash: hash('password123'),
    is_verified: true, profile_photo: null,
    created_at: now(), updated_at: now(),
  };
  const u2: User = {
    id: uuid(), full_name: 'Sara Ahmed', email: 'sara.ahmed@student.uol.edu.pk',
    phone: '03119876543', password_hash: hash('password123'),
    is_verified: true, profile_photo: null,
    created_at: now(), updated_at: now(),
  };
  const u3: User = {
    id: uuid(), full_name: 'Usman Malik', email: 'usman.malik@student.uol.edu.pk',
    phone: '03334455667', password_hash: hash('password123'),
    is_verified: true, profile_photo: null,
    created_at: now(), updated_at: now(),
  };
  const u4: User = {
    id: uuid(), full_name: 'Fatima Khan', email: 'fatima.khan@student.uol.edu.pk',
    phone: '03215566778', password_hash: hash('password123'),
    is_verified: true, profile_photo: null,
    created_at: now(), updated_at: now(),
  };

  db.users.push(u1, u2, u3, u4);

  // Future departure times
  const inHours = (h: number) => new Date(Date.now() + h * 3600 * 1000).toISOString();

  // Rides
  const r1: Ride = {
    id: uuid(), driver_id: u1.id, origin_area: 'Johar Town',
    destination: 'UOL Main Campus', departure_time: inHours(3),
    total_seats: 3, available_seats: 2, cost_per_seat: 150,
    status: 'active', created_at: now(), updated_at: now(),
  };
  const r2: Ride = {
    id: uuid(), driver_id: u2.id, origin_area: 'DHA Phase 5',
    destination: 'UOL Main Campus', departure_time: inHours(5),
    total_seats: 2, available_seats: 2, cost_per_seat: 200,
    status: 'active', created_at: now(), updated_at: now(),
  };
  const r3: Ride = {
    id: uuid(), driver_id: u3.id, origin_area: 'Gulberg',
    destination: 'UOL Main Campus', departure_time: inHours(2),
    total_seats: 4, available_seats: 3, cost_per_seat: 120,
    status: 'active', created_at: now(), updated_at: now(),
  };
  const r4: Ride = {
    id: uuid(), driver_id: u1.id, origin_area: 'Model Town',
    destination: 'UOL Main Campus',
    departure_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    total_seats: 3, available_seats: 0, cost_per_seat: 130,
    status: 'completed', created_at: now(), updated_at: now(),
  };

  db.rides.push(r1, r2, r3, r4);

  // Bookings
  const b1: Booking = {
    id: uuid(), ride_id: r1.id, passenger_id: u2.id,
    status: 'confirmed', created_at: now(), updated_at: now(),
  };
  const b2: Booking = {
    id: uuid(), ride_id: r4.id, passenger_id: u2.id,
    status: 'confirmed', created_at: now(), updated_at: now(),
  };
  const b3: Booking = {
    id: uuid(), ride_id: r4.id, passenger_id: u3.id,
    status: 'confirmed', created_at: now(), updated_at: now(),
  };

  db.bookings.push(b1, b2, b3);

  // Ratings
  db.ratings.push(
    { id: uuid(), ride_id: r4.id, rater_id: u2.id, ratee_id: u1.id, score: 5, comment: 'Very punctual and friendly!', created_at: now() },
    { id: uuid(), ride_id: r4.id, rater_id: u3.id, ratee_id: u1.id, score: 4, comment: 'Good driver, smooth ride.', created_at: now() },
    { id: uuid(), ride_id: r4.id, rater_id: u1.id, ratee_id: u2.id, score: 5, comment: 'Great passenger!', created_at: now() },
  );

  // Notifications
  db.notifications.push({
    id: uuid(), user_id: u1.id, type: 'booking_confirmed', is_read: false,
    payload: { ride_id: r1.id, passenger_id: u2.id },
    created_at: now(),
  });

  console.log('🌱 Demo data seeded. Login with:');
  console.log('   📧 ali.hassan@student.uol.edu.pk  / password123');
  console.log('   📧 sara.ahmed@student.uol.edu.pk  / password123');
  console.log('   📧 usman.malik@student.uol.edu.pk / password123');
  console.log('   📧 fatima.khan@student.uol.edu.pk / password123');
}

seed();
