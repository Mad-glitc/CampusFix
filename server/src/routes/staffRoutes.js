import express from 'express';
import {
  getStaffQueue,
  updateTaskStatus,
  resolveTask,
  getMyStaffFeedback,
} from '../controllers/staffController.js';
import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All staff routes require authentication and staff or admin role
router.use(protect);
router.use(authorize('staff', 'admin'));

router.get('/queue', getStaffQueue);
router.get('/feedback', getMyStaffFeedback);
router.patch('/complaints/:id/status', updateTaskStatus);
router.post('/complaints/:id/resolve', upload.array('images', 5), resolveTask);

export default router;
