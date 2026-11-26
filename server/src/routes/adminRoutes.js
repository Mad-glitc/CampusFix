import express from 'express';
import {
  assignStaff,
  updatePriority,
  rejectComplaint,
  getStaffList,
  getAdminAnalytics,
  toggleStaffPresence,
  getStaffFeedbackDetails,
} from '../controllers/adminController.js';
import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.post('/assign', assignStaff);
router.patch('/complaints/:id/priority', updatePriority);
router.patch('/complaints/:id/reject', rejectComplaint);
router.get('/staff', getStaffList);
router.get('/staff/:id/feedback', getStaffFeedbackDetails);
router.patch('/staff/:id/presence', toggleStaffPresence);
router.put('/staff/:id/presence', toggleStaffPresence);
router.get('/analytics', getAdminAnalytics);

export default router;
