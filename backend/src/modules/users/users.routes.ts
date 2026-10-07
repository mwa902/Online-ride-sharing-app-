import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getMe, updateMe, getPublicProfile } from './users.controller';
import { requireAuth } from '../../middleware/auth';
import { config } from '../../config/env';

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const router = Router();
router.use(requireAuth);

router.get('/me', getMe);
router.patch('/me', upload.single('profile_photo'), updateMe);
router.get('/:id', getPublicProfile);

export default router;
