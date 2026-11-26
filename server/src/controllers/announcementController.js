import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Campus Announcement Center Controller
 */

// @desc    Get all active campus announcements
// @route   GET /api/announcements
// @access  Public / Authenticated
export const getAnnouncements = async (req, res, next) => {
  try {
    const { category, priority, status, search } = req.query;
    const now = new Date();

    const query = {
      // Hide expired announcements unless specifically requested by admin
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    };

    if (status === 'all') {
      query.status = { $in: ['published', 'resolved', 'archived'] };
    } else if (status === 'resolved') {
      query.isResolved = true;
    } else if (status === 'archived') {
      query.status = 'archived';
    } else if (status) {
      query.status = status;
    } else {
      // Default: show both published and resolved notices so resolution status is visible to all
      query.status = { $in: ['published', 'resolved'] };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ title: searchRegex }, { content: searchRegex }];
    }

    // Role-based target audience filtering for authenticated users
    if (req.user && req.user.role !== 'admin') {
      query.targetAudience = { $in: ['all', req.user.role] };
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'name role department')
      .populate('resolvedBy', 'name role department')
      .sort({ isEmergency: -1, priority: -1, publishedAt: -1 });

    // Attach isRead flag if user is logged in
    const formatted = announcements.map((ann) => {
      const isRead = req.user
        ? ann.readBy.some((r) => String(r.user) === String(req.user._id))
        : false;
      return {
        ...ann.toObject(),
        isRead,
        readCount: ann.readBy.length,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      announcements: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single announcement details
// @route   GET /api/announcements/:id
// @access  Public / Authenticated
export const getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate('author', 'name role department');
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // Auto mark as read if authenticated
    if (req.user) {
      const alreadyRead = announcement.readBy.some((r) => String(r.user) === String(req.user._id));
      if (!alreadyRead) {
        announcement.readBy.push({ user: req.user._id, readAt: new Date() });
        await announcement.save();
      }
    }

    res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new campus announcement
// @route   POST /api/announcements
// @access  Private (Admin only)
export const createAnnouncement = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can create campus announcements.' });
    }

    const {
      title,
      content,
      category,
      priority,
      targetAudience,
      targetLocations,
      imageUrl,
      isEmergency,
      expiresAt,
      scheduledFor,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const isEmergencyBool = isEmergency === true || priority === 'emergency';

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      category: category || 'General Announcement',
      priority: priority || (isEmergencyBool ? 'emergency' : 'normal'),
      author: req.user._id,
      targetAudience: Array.isArray(targetAudience) && targetAudience.length ? targetAudience : ['all'],
      targetLocations: Array.isArray(targetLocations) ? targetLocations : (targetLocations ? [targetLocations] : []),
      imageUrl: imageUrl || '',
      isEmergency: isEmergencyBool,
      status: scheduledFor && new Date(scheduledFor) > new Date() ? 'scheduled' : 'published',
      publishedAt: new Date(),
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    // Send notifications to campus users matching target audience
    const audienceFilter = announcement.targetAudience.includes('all')
      ? {}
      : { role: { $in: announcement.targetAudience } };

    const targetUsers = await User.find(audienceFilter).select('_id');
    const notifs = targetUsers.map((u) => ({
      recipient: u._id,
      title: `${isEmergencyBool ? '🚨 EMERGENCY NOTICE: ' : '📢 Announcement: '}${announcement.title.substring(0, 40)}`,
      message: announcement.content.substring(0, 100) + '...',
      type: 'announcement',
      relatedAnnouncement: announcement._id,
    }));

    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    // Audit log
    await AuditLog.create({
      action: 'ANNOUNCEMENT_CREATED',
      performedBy: req.user._id,
      entityType: 'Announcement',
      entityId: announcement._id,
      details: {
        title: announcement.title,
        category: announcement.category,
        priority: announcement.priority,
        isEmergency: announcement.isEmergency,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully to campus network.',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin only)
export const updateAnnouncement = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can update announcements.' });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const { title, content, category, priority, targetLocations, isEmergency, status, expiresAt } = req.body;

    if (title) announcement.title = title.trim();
    if (content) announcement.content = content.trim();
    if (category) announcement.category = category;
    if (priority) announcement.priority = priority;
    if (targetLocations !== undefined) announcement.targetLocations = targetLocations;
    if (isEmergency !== undefined) announcement.isEmergency = isEmergency;
    if (status) announcement.status = status;
    if (expiresAt !== undefined) announcement.expiresAt = expiresAt ? new Date(expiresAt) : null;

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive / delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin only)
export const deleteAnnouncement = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can delete announcements.' });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    announcement.status = 'archived';
    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement archived successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark announcement as read by student/user
// @route   POST /api/announcements/:id/read
// @access  Private
export const markAnnouncementAsRead = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const alreadyRead = announcement.readBy.some((r) => String(r.user) === String(req.user._id));
    if (!alreadyRead) {
      announcement.readBy.push({ user: req.user._id, readAt: new Date() });
      await announcement.save();
    }

    res.status(200).json({
      success: true,
      message: 'Marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark announcement/problem as resolved
// @route   PATCH /api/announcements/:id/resolve
// @access  Private (Admin only)
export const resolveAnnouncement = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can mark announcements as resolved.' });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    const { resolutionNote } = req.body;

    announcement.isResolved = true;
    announcement.status = 'resolved';
    announcement.resolvedAt = new Date();
    announcement.resolvedBy = req.user._id;
    announcement.resolutionNote = resolutionNote
      ? resolutionNote.trim()
      : 'The maintenance problem has been successfully resolved and normal campus operations are fully restored.';

    // Clear emergency state so sirens turn green
    announcement.isEmergency = false;

    await announcement.save();

    // Broadcast resolution notification to all targeted campus users
    const audienceFilter = announcement.targetAudience.includes('all')
      ? {}
      : { role: { $in: announcement.targetAudience } };

    const targetUsers = await User.find(audienceFilter).select('_id');
    const notifs = targetUsers.map((u) => ({
      recipient: u._id,
      title: `✅ PROBLEM RESOLVED: ${announcement.title.substring(0, 40)}`,
      message: `${announcement.title} problem has been resolved. ${announcement.resolutionNote}`,
      type: 'announcement',
      relatedAnnouncement: announcement._id,
    }));

    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    // Audit log
    await AuditLog.create({
      action: 'ANNOUNCEMENT_RESOLVED',
      performedBy: req.user._id,
      entityType: 'Announcement',
      entityId: announcement._id,
      details: {
        title: announcement.title,
        category: announcement.category,
        resolutionNote: announcement.resolutionNote,
        resolvedAt: announcement.resolvedAt,
      },
    });

    res.status(200).json({
      success: true,
      message: `"${announcement.title}" has been marked as resolved. Latest resolution notification has been broadcast to all campus users.`,
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reopen a previously resolved announcement
// @route   PATCH /api/announcements/:id/reopen
// @access  Private (Admin only)
export const reopenAnnouncement = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can reopen announcements.' });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    announcement.isResolved = false;
    announcement.status = 'published';
    announcement.resolvedAt = null;
    announcement.resolvedBy = null;
    announcement.resolutionNote = '';

    await announcement.save();

    res.status(200).json({
      success: true,
      message: `"${announcement.title}" has been reopened.`,
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementAsRead,
  resolveAnnouncement,
  reopenAnnouncement,
};
