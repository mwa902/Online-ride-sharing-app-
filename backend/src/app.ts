import express from 'express';
import cors from 'cors';
import path from 'path';
import './db/store'; // seeds demo data on startup
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRoutes          from './modules/auth/auth.routes';
import usersRoutes         from './modules/users/users.routes';
import ridesRoutes         from './modules/rides/rides.routes';
import bookingsRoutes      from './modules/bookings/bookings.routes';
import ratingsRoutes       from './modules/ratings/ratings.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';

const app = express();

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', config.uploadDir)));

app.use('/api/auth',          authRoutes);
app.use('/api/users',         usersRoutes);
app.use('/api/rides',         ridesRoutes);
app.use('/api/bookings',      bookingsRoutes);
app.use('/api/ratings',       ratingsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', mode: 'in-memory demo' }));

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`\n🚀 UOL Ride Share API  →  http://localhost:${config.port}`);
  console.log(`📡 Mode: IN-MEMORY (no database required)`);
  console.log(`🌐 Frontend          →  http://localhost:5173\n`);
});

export default app;
