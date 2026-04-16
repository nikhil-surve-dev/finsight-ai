import express from 'express';
import multer from 'multer';
import { extractTransactionsFromImage, getFinancialInsights } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup Multer to store file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post('/extract', protect, upload.single('image'), extractTransactionsFromImage);
router.get('/insights', protect, getFinancialInsights);

export default router;
