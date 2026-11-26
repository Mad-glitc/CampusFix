import express from 'express';
import {
  getLostFoundItems,
  getLostFoundItemById,
  createLostFoundItem,
  updateLostFoundStatus,
  deleteLostFoundItem,
} from '../controllers/lostFoundController.js';
import protect from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getLostFoundItems);
router.get('/:id', getLostFoundItemById);
router.post('/', upload.single('image'), createLostFoundItem);
router.patch('/:id/status', updateLostFoundStatus);
router.delete('/:id', deleteLostFoundItem);

export default router;
