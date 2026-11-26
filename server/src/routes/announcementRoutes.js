import express from 'express';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementAsRead,
  resolveAnnouncement,
  reopenAnnouncement,
} from '../controllers/announcementController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow optional auth on list so unauthenticated/public visitors still see notices, but authenticated users get isRead flags
router.get('/', (req, res, next) => {
  // If authorization header present, run protect, otherwise proceed as guest
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getAnnouncements);

router.get('/:id', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getAnnouncementById);

// Admin Management
router.post('/', protect, createAnnouncement);
router.put('/:id', protect, updateAnnouncement);
router.delete('/:id', protect, deleteAnnouncement);
router.patch('/:id/resolve', protect, resolveAnnouncement);
router.put('/:id/resolve', protect, resolveAnnouncement);
router.patch('/:id/reopen', protect, reopenAnnouncement);
router.put('/:id/reopen', protect, reopenAnnouncement);

// Student read tracking
router.post('/:id/read', protect, markAnnouncementAsRead);
router.put('/:id/read', protect, markAnnouncementAsRead);

export default router;
