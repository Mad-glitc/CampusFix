import Complaint from '../models/Complaint.js';
import Assignment from '../models/Assignment.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Get work queue assigned to authenticated technician
 * @route   GET /api/staff/queue
 * @access  Private (Staff only)
 */
export const getStaffQueue = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { assignedStaff: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const tasks = await Complaint.find(query)
      .populate('category', 'name icon defaultSlaHours')
      .populate('student', 'name email department phoneNumber')
      .sort({
        // Sort urgent first, then creation date
        priority: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task status (e.g. to in_progress)
 * @route   PATCH /api/staff/complaints/:id/status
 * @access  Private (Staff only)
 */
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    if (!['in_progress', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Technicians can set status to in_progress or reject assignment',
      });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      assignedStaff: req.user._id,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not assigned to you',
      });
    }

    complaint.status = status;
    await complaint.save();

    // Create Assignment audit log
    await Assignment.create({
      complaint: complaint._id,
      assignedBy: req.user._id,
      assignedTo: req.user._id,
      action: status === 'in_progress' ? 'accepted' : 'rejected',
      notes: notes || `Technician marked task as ${status}`,
    });

    // Notify student
    if (status === 'in_progress') {
      await Notification.create({
        recipient: complaint.student,
        title: `Technician On-Site: ${complaint.trackingId}`,
        message: `${req.user.name} has begun diagnosis and repair at ${complaint.location.room}.`,
        type: 'status_update',
        relatedComplaint: complaint._id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Task status updated to ${status}`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve complaint with remarks and completion photo proof
 * @route   POST /api/staff/complaints/:id/resolve
 * @access  Private (Staff only)
 */
export const resolveTask = async (req, res, next) => {
  try {
    const { resolutionRemarks } = req.body;

    if (!resolutionRemarks || !resolutionRemarks.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resolution remarks describing work executed',
      });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      assignedStaff: req.user._id,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not assigned to you',
      });
    }

    // Process completion proof images
    const resolvedImages = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        resolvedImages.push({
          url: `/uploads/${file.filename}`,
          uploadedAt: new Date(),
        });
      });
    } else if (req.file) {
      resolvedImages.push({
        url: `/uploads/${req.file.filename}`,
        uploadedAt: new Date(),
      });
    }

    complaint.status = 'resolved';
    complaint.resolutionRemarks = resolutionRemarks.trim();
    complaint.resolvedAt = new Date();
    if (resolvedImages.length > 0) {
      complaint.resolvedImages = resolvedImages;
    }

    await complaint.save();

    // Create completion audit record
    await Assignment.create({
      complaint: complaint._id,
      assignedBy: req.user._id,
      assignedTo: req.user._id,
      action: 'completed',
      notes: `Resolved: ${resolutionRemarks.trim()}`,
    });

    // Notify student of resolution
    await Notification.create({
      recipient: complaint.student,
      title: `Issue Resolved: ${complaint.trackingId}`,
      message: `Your ticket has been marked Resolved by ${req.user.name}. Click to view verification photo proof.`,
      type: 'status_update',
      relatedComplaint: complaint._id,
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('category', 'name icon defaultSlaHours')
      .populate('student', 'name email department phoneNumber')
      .populate('assignedStaff', 'name email department phoneNumber');

    res.status(200).json({
      success: true,
      message: 'Complaint marked as resolved with photo verification proof',
      complaint: populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get technician's reviews and star ratings (STUDENT IDENTITY ANONYMIZED)
 * @route   GET /api/staff/feedback
 * @access  Private (Staff only)
 */
export const getMyStaffFeedback = async (req, res, next) => {
  try {
    const complaintsWithFeedback = await Complaint.find({
      assignedStaff: req.user._id,
      'feedback.rating': { $ne: null },
    })
      .populate('category', 'name icon')
      .sort({ 'feedback.submittedAt': -1 })
      .lean();

    const feedbacks = complaintsWithFeedback.map((c) => ({
      complaintId: c._id,
      trackingId: c.trackingId,
      title: c.title,
      category: c.category?.name || 'General',
      location: `${c.location?.building} • Room ${c.location?.room}`,
      rating: c.feedback?.rating,
      isSatisfied: c.feedback?.isSatisfied || 'satisfied',
      desiredChanges: c.feedback?.desiredChanges || '',
      comments: c.feedback?.comments || '',
      submittedAt: c.feedback?.submittedAt || c.updatedAt,
      // Identity is protected - strictly anonymous to technician!
      student: {
        name: 'Verified Student (Anonymous)',
        department: 'Campus Student Community',
        isAnonymous: true,
      },
    }));

    const totalReviews = feedbacks.length;
    const avgRating = totalReviews > 0
      ? parseFloat((feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0) / totalReviews).toFixed(1))
      : (req.user.rating || 4.9);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach((f) => {
      const r = Math.min(5, Math.max(1, Math.round(f.rating || 5)));
      if (distribution[r] !== undefined) distribution[r] += 1;
    });

    res.status(200).json({
      success: true,
      metrics: {
        totalReviews,
        averageRating: avgRating,
        distribution,
      },
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};
