import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  smtp: {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
  },
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
};
