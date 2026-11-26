import Complaint from '../models/Complaint.js';
import Category from '../models/Category.js';
import Assignment from '../models/Assignment.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import ComplaintVote from '../models/ComplaintVote.js';
import AuditLog from '../models/AuditLog.js';
import generateTrackingId from '../services/trackingIdGenerator.js';
import { calculateSlaDeadline, processAutomaticEscalations } from '../services/slaService.js';
import { findDuplicateComplaints } from '../services/duplicateDetectionService.js';
import { classifyImage } from '../services/aiService.js';

/**
 * @desc    Create a new campus complaint
 * @route   POST /api/complaints
 * @access  Private (Student, Admin)
 */
export const createComplaint = async (req, res, next) => {
  try {
    let {
      title,
      description,
      category,
      building,
      floor,
      room,
      landmark,
      priority,
    } = req.body;

    if (req.body.location) {
      try {
        const loc = typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location;
        if (loc) {
          building = building || loc.building;
          floor = floor || loc.floor;
          room = room || loc.room;
          landmark = landmark || loc.landmark;
        }
      } catch (e) {}
    }

    if (!title || !description || !category || !building || !room) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, building, and room',
      });
    }

    // Process uploaded images
    const images = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        images.push({
          url: `/uploads/${file.filename}`,
          uploadedAt: new Date(),
        });
      });
    } else if (req.file) {
      images.push({
        url: `/uploads/${req.file.filename}`,
        uploadedAt: new Date(),
      });
    }

    // Verify category exists or resolve category ID
    let categoryId = category;
    const catDoc = await Category.findById(category).catch(() => null);
    if (!catDoc) {
      // Find by slug or name fallback
      const foundCat = await Category.findOne({
        $or: [{ slug: category }, { name: category }],
      });
      if (foundCat) {
        categoryId = foundCat._id;
      } else {
        const firstCat = await Category.findOne();
        if (firstCat) categoryId = firstCat._id;
      }
    }

    // Generate unique institutional tracking ID: CF-YYYY-XXXX
    const trackingId = await generateTrackingId();

    // Calculate server-side target resolution deadline
    const { slaHours, slaDeadline } = await calculateSlaDeadline(priority || 'medium');

    let parsedAiAnalysis = undefined;
    if (req.body.aiAnalysis) {
      try {
        parsedAiAnalysis = typeof req.body.aiAnalysis === 'string' ? JSON.parse(req.body.aiAnalysis) : req.body.aiAnalysis;
      } catch (e) {
        // Fallback
      }
    }

    const complaint = await Complaint.create({
      trackingId,
      title,
      description,
      category: categoryId,
      location: {
        building,
        floor: floor || 'Ground Floor',
        room,
        landmark: landmark || '',
      },
      priority: priority || 'medium',
      status: 'submitted',
      images,
      student: req.user._id,
      slaHours,
      slaDeadline,
      aiAnalysis: parsedAiAnalysis,
    });

    // Create initial audit record in Assignment collection
    await Assignment.create({
      complaint: complaint._id,
      assignedBy: req.user._id,
      assignedTo: req.user._id, // Self-reported
      action: 'assigned',
      notes: 'Initial issue reported by student with photo verification.',
    });

    // Create confirmation notification for the student
    await Notification.create({
      recipient: req.user._id,
      title: 'Complaint Registered Successfully',
      message: `Your issue ticket ${trackingId} has been logged and queued for administrative triage.`,
      type: 'status_update',
      relatedComplaint: complaint._id,
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('category', 'name icon defaultSlaHours')
      .populate('student', 'name email department phoneNumber');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      trackingId: complaint.trackingId,
      complaint: populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated, filtered complaints (scoped by role)
 * @route   GET /api/complaints
 * @access  Private
 */
export const getComplaints = async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // Role-based data scoping
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'staff') {
      query.assignedStaff = req.user._id;
    }
    // Admins see all

    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { trackingId: searchRegex },
        { title: searchRegex },
        { 'location.building': searchRegex },
        { 'location.room': searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    const sortKey = (sortBy === 'upvotes' || sortBy === 'upvoteCount') ? 'upvoteCount' : (sortBy || 'createdAt');
    const sortOrder = order === 'asc' ? 1 : -1;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('category', 'name icon defaultSlaHours')
      .populate('student', 'name email department phoneNumber')
      .populate('assignedStaff', 'name email department phoneNumber')
      .sort({ [sortKey]: sortOrder, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Public & authenticated tracking by unique code (e.g. CF-2026-1042)
 * @route   GET /api/complaints/track/:trackingId
 * @access  Public
 */
export const getComplaintByTrackingId = async (req, res, next) => {
  try {
    const { trackingId } = req.params;

    const complaint = await Complaint.findOne({
      trackingId: trackingId.toUpperCase().trim(),
    })
      .populate('category', 'name icon defaultSlaHours')
      .populate('student', 'name department')
      .populate('assignedStaff', 'name department phoneNumber')
      .populate('feedback.submittedBy', 'name department');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `No issue ticket found with tracking ID "${trackingId}". Please check the ID and try again.`,
      });
    }

    // Fetch comments for this ticket
    const comments = await Comment.find({
      complaint: complaint._id,
      isInternal: false, // Hide internal staff notes from public tracking
    })
      .populate('author', 'name role department avatar')
      .sort({ createdAt: 1 });

    // Fetch assignment history
    const assignments = await Assignment.find({ complaint: complaint._id })
      .populate('assignedTo', 'name department')
      .sort({ createdAt: 1 });

    // Dynamic resolution timeline generation
    const statusOrder = ['submitted', 'assigned', 'in_progress', 'resolved'];
    const currentIdx = statusOrder.indexOf(complaint.status);

    const timeline = [
      {
        step: 'Submitted',
        title: 'Issue Reported',
        description: `Ticket generated with initial photo evidence.`,
        time: complaint.createdAt,
        isComplete: currentIdx >= 0,
      },
      {
        step: 'Assigned',
        title: 'Technician Assigned',
        description: complaint.assignedStaff
          ? `Dispatched to ${complaint.assignedStaff.name} (${complaint.assignedStaff.department}).`
          : 'Pending administrator technician assignment.',
        time: assignments.length > 1 ? assignments[1].createdAt : null,
        isComplete: currentIdx >= 1,
      },
      {
        step: 'In Progress',
        title: 'Repair In Progress',
        description:
          currentIdx >= 2
            ? 'Technician arrived on-site and commenced repair work.'
            : 'Technician pending arrival on-site.',
        time: complaint.status === 'in_progress' || currentIdx >= 2 ? complaint.updatedAt : null,
        isComplete: currentIdx >= 2,
      },
      {
        step: 'Resolved',
        title: 'Issue Resolved & Verified',
        description: complaint.resolutionRemarks
          ? `Resolution Remarks: "${complaint.resolutionRemarks}"`
          : 'Awaiting technician resolution verification and after-repair photo upload.',
        time: complaint.resolvedAt,
        isComplete: currentIdx >= 3,
      },
    ];

    res.status(200).json({
      success: true,
      complaint,
      timeline,
      comments,
      assignments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed complaint by MongoDB ObjectId
 * @route   GET /api/complaints/:id
 * @access  Private
 */
export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('category', 'name icon defaultSlaHours')
      .populate('student', 'name email department phoneNumber')
      .populate('assignedStaff', 'name email department phoneNumber')
      .populate('feedback.submittedBy', 'name department');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const comments = await Comment.find({ complaint: complaint._id })
      .populate('author', 'name role department avatar')
      .sort({ createdAt: 1 });

    const assignments = await Assignment.find({ complaint: complaint._id })
      .populate('assignedBy', 'name role')
      .populate('assignedTo', 'name role department')
      .sort({ createdAt: -1 });

    let resultComplaint = complaint.toObject ? complaint.toObject() : complaint;
    if (req.user.role === 'staff' && resultComplaint.feedback && resultComplaint.feedback.submittedBy) {
      resultComplaint.feedback.submittedBy = {
        name: 'Verified Student (Anonymous)',
        department: 'Campus Student',
      };
    }

    res.status(200).json({
      success: true,
      complaint: resultComplaint,
      comments,
      assignments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a comment/activity update to a complaint
 * @route   POST /api/complaints/:id/comments
 * @access  Private
 */
export const addComment = async (req, res, next) => {
  try {
    const { content, isInternal } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const comment = await Comment.create({
      complaint: complaint._id,
      author: req.user._id,
      content: content.trim(),
      isInternal: req.user.role !== 'student' ? Boolean(isInternal) : false,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name role department avatar'
    );

    // Notify student if commented by staff/admin
    if (String(req.user._id) !== String(complaint.student)) {
      await Notification.create({
        recipient: complaint.student,
        title: `New update on ${complaint.trackingId}`,
        message: `${req.user.name} posted: "${content.trim().substring(0, 60)}..."`,
        type: 'comment',
        relatedComplaint: complaint._id,
      });
    }

    res.status(201).json({
      success: true,
      comment: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit student resolution feedback & desired changes (FOR STUDENTS ONLY)
 * @route   POST /api/complaints/:id/feedback
 * @access  Private (Students only)
 */
export const submitComplaintFeedback = async (req, res, next) => {
  try {
    // Strict Role Guard: Only students can submit satisfaction feedback & change requests
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Feedback submission is reserved exclusively for students.',
      });
    }

    const { rating, isSatisfied, desiredChanges, comments } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Verify student ownership
    if (String(complaint.student) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only submit feedback for your own reported issues.',
      });
    }

    const numericRating = rating ? Math.min(5, Math.max(1, Number(rating))) : 5;
    const cleanSatisfied = isSatisfied || (numericRating >= 4 ? 'satisfied' : (numericRating === 3 ? 'partially_satisfied' : 'unsatisfied'));

    complaint.feedback = {
      rating: numericRating,
      isSatisfied: cleanSatisfied,
      desiredChanges: (desiredChanges || '').trim(),
      comments: (comments || '').trim(),
      submittedAt: new Date(),
      submittedBy: req.user._id,
    };

    await complaint.save();

    // Log in public comment timeline
    const satisfiedLabel = cleanSatisfied === 'satisfied' ? 'Satisfied ⭐' + numericRating : (cleanSatisfied === 'partially_satisfied' ? 'Partially Satisfied ⭐' + numericRating : 'Unsatisfied ⚠️' + numericRating);
    const commentSummary = `Student Feedback [${satisfiedLabel}]: ${cleanSatisfied === 'satisfied' ? 'Student is satisfied with resolution.' : 'Student requested adjustments.'}${complaint.feedback.desiredChanges ? ` | Requested Changes: "${complaint.feedback.desiredChanges}"` : ''}${complaint.feedback.comments ? ` | Notes: "${complaint.feedback.comments}"` : ''}`;

    await Comment.create({
      complaint: complaint._id,
      author: req.user._id,
      content: commentSummary,
      isInternal: false,
    });

    // Recalculate technician rating and notify assigned technician anonymously
    if (complaint.assignedStaff) {
      const staffComplaintsWithRating = await Complaint.find({
        assignedStaff: complaint.assignedStaff,
        'feedback.rating': { $ne: null },
      }).select('feedback.rating');

      if (staffComplaintsWithRating.length > 0) {
        const sum = staffComplaintsWithRating.reduce((acc, c) => acc + (c.feedback?.rating || 0), 0);
        const avg = parseFloat((sum / staffComplaintsWithRating.length).toFixed(1));
        await User.findByIdAndUpdate(complaint.assignedStaff, { rating: avg });
      }

      // Notify assigned technician with student identity strictly anonymous
      await Notification.create({
        recipient: complaint.assignedStaff,
        title: `Student Review: ${numericRating}/5 Stars on ${complaint.trackingId}`,
        message: `A verified student reviewed ticket: ${numericRating}/5 stars.${complaint.feedback.desiredChanges ? ` Adjustments requested: "${complaint.feedback.desiredChanges.substring(0, 50)}..."` : ''}`,
        type: 'comment',
        relatedComplaint: complaint._id,
      });
    }

    // Notify administrators with full student identity visible
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        title: `Student Feedback on ${complaint.trackingId}`,
        message: `${req.user.name} reviewed ticket: ${numericRating}/5 stars for assigned technician.`,
        type: 'comment',
        relatedComplaint: complaint._id,
      });
    }

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('category', 'name icon defaultSlaHours')
      .populate('student', 'name department')
      .populate('assignedStaff', 'name department phoneNumber')
      .populate('feedback.submittedBy', 'name department');

    res.status(200).json({
      success: true,
      message: 'Student feedback recorded successfully. Thank you for helping improve campus facilities!',
      feedback: complaint.feedback,
      complaint: populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check for potential duplicate complaints
 * @route   POST /api/complaints/check-duplicates
 * @access  Private / Authenticated
 */
export const checkDuplicates = async (req, res, next) => {
  try {
    const { category, building, room, title, description, excludeId } = req.body;

    const duplicates = await findDuplicateComplaints({
      category,
      building,
      room,
      title,
      description,
      excludeId,
    });

    res.status(200).json({
      success: true,
      hasDuplicates: duplicates.length > 0,
      count: duplicates.length,
      duplicates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Community Upvote a complaint
 * @route   POST /api/complaints/:id/vote
 * @access  Private (Students & Authenticated Users)
 */
export const voteComplaint = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user._id;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check if already voted
    const existingVote = await ComplaintVote.findOne({
      complaint: complaintId,
      student: userId,
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already upvoted this issue.',
        upvoted: true,
        upvoteCount: complaint.upvoteCount || 0,
      });
    }

    // Create vote record
    await ComplaintVote.create({
      complaint: complaintId,
      student: userId,
    });

    // Atomically increment upvote count
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { $inc: { upvoteCount: 1 } },
      { new: true }
    );

    // Notify original reporter if someone else upvoted
    if (String(complaint.student) !== String(userId)) {
      await Notification.create({
        recipient: complaint.student,
        title: `👍 Your issue gained a supporter!`,
        message: `${req.user.name} upvoted ${complaint.trackingId}. Total supporters: ${updatedComplaint.upvoteCount}.`,
        type: 'upvote',
        relatedComplaint: complaint._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      upvoted: true,
      upvoteCount: updatedComplaint.upvoteCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove an upvote from a complaint
 * @route   DELETE /api/complaints/:id/vote
 * @access  Private
 */
export const unvoteComplaint = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user._id;

    const existingVote = await ComplaintVote.findOneAndDelete({
      complaint: complaintId,
      student: userId,
    });

    if (!existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have not voted for this issue.',
        upvoted: false,
      });
    }

    // Atomically decrement upvote count (ensuring >= 0)
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { $inc: { upvoteCount: -1 } },
      { new: true }
    );

    if (updatedComplaint.upvoteCount < 0) {
      updatedComplaint.upvoteCount = 0;
      await updatedComplaint.save();
    }

    res.status(200).json({
      success: true,
      message: 'Vote removed',
      upvoted: false,
      upvoteCount: updatedComplaint.upvoteCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all complaint IDs the current user has voted for
 * @route   GET /api/complaints/my-votes
 * @access  Private
 */
export const getUserVotes = async (req, res, next) => {
  try {
    const votes = await ComplaintVote.find({ student: req.user._id }).select('complaint');
    const votedIds = votes.map((v) => String(v.complaint));

    res.status(200).json({
      success: true,
      votedIds,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get trending and most supported campus issues
 * @route   GET /api/complaints/trending
 * @access  Public / Authenticated
 */
export const getTrendingComplaints = async (req, res, next) => {
  try {
    const trending = await Complaint.find({
      status: { $in: ['submitted', 'assigned', 'in_progress'] },
    })
      .populate('category', 'name icon defaultSlaHours')
      .populate('student', 'name department')
      .sort({ upvoteCount: -1, createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: trending.length,
      trending,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Computer Vision Image Classification Endpoint
 * @route   POST /api/complaints/analyze-image
 * @access  Private / Authenticated
 */
export const analyzeComplaintImage = async (req, res, next) => {
  try {
    let filename = '';
    let userDescription = req.body.description || req.body.categoryHint || '';

    if (req.file) {
      filename = req.file.filename || req.file.originalname || '';
    } else if (req.body.filename || req.body.imageName || req.body.image) {
      filename = req.body.filename || req.body.imageName || req.body.image;
    }

    const analysis = await classifyImage(filename, userDescription);

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Adjust complaint SLA target deadline (ADMIN ONLY with audit reason)
 * @route   PUT /api/complaints/:id/deadline
 * @access  Private (Admin only)
 */
export const adjustSlaDeadline = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can adjust SLA deadlines.' });
    }

    const { newDeadline, reason } = req.body;
    if (!newDeadline || !reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'New deadline and audit reason are required.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const oldDeadline = complaint.slaDeadline;
    const targetDate = new Date(newDeadline);

    complaint.slaDeadline = targetDate;
    complaint.isOverdue = targetDate.getTime() < Date.now();

    complaint.deadlineAdjustments.push({
      adjustedBy: req.user._id,
      oldDeadline,
      newDeadline: targetDate,
      reason: reason.trim(),
      adjustedAt: new Date(),
    });

    await complaint.save();

    // Log in AuditLog
    await AuditLog.create({
      action: 'SLA_DEADLINE_EXTENDED',
      performedBy: req.user._id,
      entityType: 'Complaint',
      entityId: complaint._id,
      details: {
        trackingId: complaint.trackingId,
        oldDeadline,
        newDeadline: targetDate,
        reason: reason.trim(),
      },
    });

    // Post to comment stream
    await Comment.create({
      complaint: complaint._id,
      author: req.user._id,
      content: `⏱️ Administrator SLA Target Adjusted: Deadline extended to ${targetDate.toLocaleString()}. Reason: "${reason.trim()}"`,
      isInternal: false,
    });

    res.status(200).json({
      success: true,
      message: 'SLA deadline updated successfully with audit trail.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get overdue complaints and SLA performance analytics
 * @route   GET /api/complaints/overdue
 * @access  Private (Admin only)
 */
export const getOverdueComplaints = async (req, res, next) => {
  try {
    const overdue = await Complaint.find({
      status: { $in: ['submitted', 'assigned', 'in_progress'] },
      slaDeadline: { $ne: null, $lt: new Date() },
    })
      .populate('category', 'name icon')
      .populate('assignedStaff', 'name email department phoneNumber')
      .populate('student', 'name department')
      .sort({ slaDeadline: 1 });

    res.status(200).json({
      success: true,
      count: overdue.length,
      overdue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger automatic SLA escalation check
 * @route   POST /api/complaints/process-escalations
 * @access  Private (Admin / System)
 */
export const triggerEscalations = async (req, res, next) => {
  try {
    const result = await processAutomaticEscalations();
    res.status(200).json({
      success: true,
      message: `Processed ${result.processedCount} tickets, escalated ${result.escalatedCount}.`,
      result,
    });
  } catch (error) {
    next(error);
  }
};
