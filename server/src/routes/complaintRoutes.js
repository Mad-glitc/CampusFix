import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintByTrackingId,
  getComplaintById,
  addComment,
  submitComplaintFeedback,
  checkDuplicates,
  voteComplaint,
  unvoteComplaint,
  getUserVotes,
  getTrendingComplaints,
  analyzeComplaintImage,
  adjustSlaDeadline,
  getOverdueComplaints,
  triggerEscalations,
} from '../controllers/complaintController.js';
import protect from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public & Static Routes (Precede :id to prevent param collision)
router.get('/track/:trackingId', getComplaintByTrackingId);
router.get('/trending', getTrendingComplaints);
router.get('/my-votes', protect, getUserVotes);
router.get('/overdue', protect, getOverdueComplaints);

// AI & Duplicate Check Endpoints
router.post('/check-duplicates', protect, checkDuplicates);
router.post('/analyze-image', protect, upload.single('image'), analyzeComplaintImage);
router.post('/process-escalations', protect, triggerEscalations);

// Authenticated Complaint Operations
router.route('/')
  .post(protect, upload.array('images', 5), createComplaint)
  .get(protect, getComplaints);

// Parameterized Ticket Endpoints
router.route('/:id')
  .get(protect, getComplaintById);

router.post('/:id/comments', protect, addComment);
router.post('/:id/feedback', protect, submitComplaintFeedback);
router.post('/:id/vote', protect, voteComplaint);
router.delete('/:id/vote', protect, unvoteComplaint);
router.put('/:id/deadline', protect, adjustSlaDeadline);

export default router;
