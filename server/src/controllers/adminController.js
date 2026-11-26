import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Assignment from '../models/Assignment.js';
import Notification from '../models/Notification.js';
import Category from '../models/Category.js';

/**
 * @desc    Assign maintenance staff to a complaint
 * @route   POST /api/admin/assign
 * @access  Private (Admin only)
 */
export const assignStaff = async (req, res, next) => {
  try {
    const { complaintId, staffId, priority, notes } = req.body;

    if (!complaintId || !staffId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both complaintId and staffId',
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'staff') {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not a valid maintenance technician',
      });
    }

    // Update complaint
    complaint.assignedStaff = staff._id;
    complaint.status = 'assigned';
    if (priority) complaint.priority = priority;
    await complaint.save();

    // Create Assignment audit log
    await Assignment.create({
      complaint: complaint._id,
      assignedBy: req.user._id,
      assignedTo: staff._id,
      action: 'assigned',
      notes: notes || `Assigned to technician ${staff.name}`,
    });

    // Notify staff member
    await Notification.create({
      recipient: staff._id,
      title: 'New Maintenance Assignment',
      message: `You have been assigned to ${complaint.trackingId} (${complaint.title}) at ${complaint.location.building} ${complaint.location.room}.`,
      type: 'assignment',
      relatedComplaint: complaint._id,
    });

    // Notify student
    await Notification.create({
      recipient: complaint.student,
      title: `Technician Assigned to ${complaint.trackingId}`,
      message: `Technician ${staff.name} (${staff.department}) has been dispatched to inspect your issue.`,
      type: 'status_update',
      relatedComplaint: complaint._id,
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('category', 'name icon defaultSlaHours')
      .populate('student', 'name email department phoneNumber')
      .populate('assignedStaff', 'name email department phoneNumber');

    res.status(200).json({
      success: true,
      message: 'Technician assigned successfully',
      complaint: populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update complaint priority
 * @route   PATCH /api/admin/complaints/:id/priority
 * @access  Private (Admin only)
 */
export const updatePriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority level' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true, runValidators: true }
    )
      .populate('category', 'name icon')
      .populate('student', 'name email department')
      .populate('assignedStaff', 'name email department');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({
      success: true,
      message: `Priority updated to ${priority}`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reassign a complaint to another technician
 * @route   PATCH /api/admin/complaints/:id/reassign
 * @access  Private (Admin only)
 */
export const reassignStaff = async (req, res, next) => {
  try {
    const { staffId, reason } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const newStaff = await User.findById(staffId);
    if (!newStaff || newStaff.role !== 'staff') {
      return res.status(400).json({ success: false, message: 'Invalid technician selected' });
    }

    const oldStaffId = complaint.assignedStaff;
    complaint.assignedStaff = newStaff._id;
    complaint.status = 'assigned';
    await complaint.save();

    // Create Assignment audit log
    await Assignment.create({
      complaint: complaint._id,
      assignedBy: req.user._id,
      assignedTo: newStaff._id,
      action: 'reassigned',
      notes: reason || `Reassigned from previous technician to ${newStaff.name}`,
    });

    // Notify new staff member
    await Notification.create({
      recipient: newStaff._id,
      title: 'Reassigned Maintenance Task',
      message: `You have been reassigned to ${complaint.trackingId} (${complaint.title}).`,
      type: 'assignment',
      relatedComplaint: complaint._id,
    });

    // If there was an old staff member, notify them they are unassigned
    if (oldStaffId) {
      await Notification.create({
        recipient: oldStaffId,
        title: 'Task Reassigned',
        message: `Task ${complaint.trackingId} has been reassigned to another technician.`,
        type: 'status_update',
        relatedComplaint: complaint._id,
      });
    }

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('category', 'name icon')
      .populate('student', 'name email department')
      .populate('assignedStaff', 'name email department');

    res.status(200).json({
      success: true,
      message: `Complaint reassigned to ${newStaff.name}`,
      complaint: populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a complaint with reason
 * @route   PATCH /api/admin/complaints/:id/reject
 * @access  Private (Admin only)
 */
export const rejectComplaint = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = 'rejected';
    complaint.rejectionReason = rejectionReason.trim();
    await complaint.save();

    // Create Assignment audit record
    await Assignment.create({
      complaint: complaint._id,
      assignedBy: req.user._id,
      action: 'rejected',
      notes: `Rejected: ${rejectionReason.trim()}`,
    });

    // Notify student
    await Notification.create({
      recipient: complaint.student,
      title: `Issue Rejected: ${complaint.trackingId}`,
      message: `Your issue was rejected. Reason: ${rejectionReason.trim()}`,
      type: 'status_update',
      relatedComplaint: complaint._id,
    });

    res.status(200).json({
      success: true,
      message: 'Complaint marked as rejected',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all maintenance staff with workload counters and student review scores
 * @route   GET /api/admin/staff
 * @access  Private (Admin only)
 */
export const getStaffList = async (req, res, next) => {
  try {
    const staffMembers = await User.find({ role: 'staff', isActive: true })
      .select('name email department phoneNumber avatar isPresent shift specialty rating createdAt')
      .lean();

    // Compute active tasks, completed tasks, and review count for each technician
    const staffWithWorkloads = await Promise.all(
      staffMembers.map(async (staff) => {
        const activeTasks = await Complaint.countDocuments({
          assignedStaff: staff._id,
          status: { $in: ['assigned', 'in_progress'] },
        });

        const completedTasks = await Complaint.countDocuments({
          assignedStaff: staff._id,
          status: 'resolved',
        });

        const feedbackComplaints = await Complaint.find({
          assignedStaff: staff._id,
          'feedback.rating': { $ne: null },
        }).select('feedback.rating');

        const reviewCount = feedbackComplaints.length;
        let computedRating = staff.rating || 4.9;
        if (reviewCount > 0) {
          const sum = feedbackComplaints.reduce((acc, c) => acc + (c.feedback?.rating || 0), 0);
          computedRating = parseFloat((sum / reviewCount).toFixed(1));
        }

        const isPresent = staff.isPresent !== false;
        let availabilityStatus = 'available';
        if (!isPresent) {
          availabilityStatus = 'off_duty';
        } else if (activeTasks > 2) {
          availabilityStatus = 'busy';
        }

        return {
          ...staff,
          isPresent,
          shift: staff.shift || 'Morning Shift (08:00 - 16:30)',
          specialty: staff.specialty || staff.department || 'General Maintenance',
          rating: computedRating,
          reviewCount,
          activeTasks,
          completedTasks,
          status: availabilityStatus,
        };
      })
    );

    const totalStaff = staffWithWorkloads.length;
    const presentCount = staffWithWorkloads.filter((s) => s.isPresent).length;
    const availableCount = staffWithWorkloads.filter((s) => s.status === 'available').length;
    const busyCount = staffWithWorkloads.filter((s) => s.status === 'busy').length;
    const offDutyCount = staffWithWorkloads.filter((s) => !s.isPresent || s.status === 'off_duty').length;

    res.status(200).json({
      success: true,
      count: staffWithWorkloads.length,
      summary: {
        totalStaff,
        presentCount,
        availableCount,
        busyCount,
        offDutyCount,
      },
      staff: staffWithWorkloads,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle technician attendance / presence status
 * @route   PATCH /api/admin/staff/:id/presence
 * @access  Private (Admin only)
 */
export const toggleStaffPresence = async (req, res, next) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Technician not found' });
    }

    if (req.body.isPresent !== undefined) {
      staff.isPresent = Boolean(req.body.isPresent);
    } else {
      staff.isPresent = !staff.isPresent;
    }

    if (req.body.shift) {
      staff.shift = req.body.shift;
    }

    await staff.save();

    res.status(200).json({
      success: true,
      message: `${staff.name} is now marked ${staff.isPresent ? 'Present (On-Duty)' : 'Off-Duty'}`,
      isPresent: staff.isPresent,
      staff: {
        _id: staff._id,
        name: staff.name,
        isPresent: staff.isPresent,
        shift: staff.shift,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed student feedback and ratings for a technician (FOR ADMIN: FULL STUDENT IDENTITY VISIBLE)
 * @route   GET /api/admin/staff/:id/feedback
 * @access  Private (Admin only)
 */
export const getStaffFeedbackDetails = async (req, res, next) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' })
      .select('name email department phoneNumber avatar isPresent shift specialty rating createdAt');

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Technician not found' });
    }

    const complaintsWithFeedback = await Complaint.find({
      assignedStaff: staff._id,
      'feedback.rating': { $ne: null },
    })
      .populate('student', 'name email department phoneNumber registrationNumber avatar')
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
      // Full student identity visible to administrator
      student: c.student
        ? {
            _id: c.student._id,
            name: c.student.name,
            email: c.student.email,
            department: c.student.department,
            registrationNumber: c.student.registrationNumber || 'N/A',
            phoneNumber: c.student.phoneNumber || '',
            avatar: c.student.avatar || '',
          }
        : {
            name: 'Anonymous Student',
            department: 'General',
          },
    }));

    const totalReviews = feedbacks.length;
    const avgRating = totalReviews > 0
      ? parseFloat((feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0) / totalReviews).toFixed(1))
      : (staff.rating || 4.9);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach((f) => {
      const r = Math.min(5, Math.max(1, Math.round(f.rating || 5)));
      if (distribution[r] !== undefined) distribution[r] += 1;
    });

    const satisfaction = {
      satisfied: feedbacks.filter((f) => f.isSatisfied === 'satisfied').length,
      partially_satisfied: feedbacks.filter((f) => f.isSatisfied === 'partially_satisfied').length,
      unsatisfied: feedbacks.filter((f) => f.isSatisfied === 'unsatisfied').length,
    };

    res.status(200).json({
      success: true,
      technician: staff,
      metrics: {
        totalReviews,
        averageRating: avgRating,
        distribution,
        satisfaction,
      },
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated administrative analytics & SLA metrics
 * @route   GET /api/admin/analytics
 * @access  Private (Admin only)
 */
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const submitted = await Complaint.countDocuments({ status: 'submitted' });
    const assigned = await Complaint.countDocuments({ status: 'assigned' });
    const inProgress = await Complaint.countDocuments({ status: 'in_progress' });
    const resolved = await Complaint.countDocuments({ status: 'resolved' });
    const rejected = await Complaint.countDocuments({ status: 'rejected' });

    // Category breakdown
    const categories = await Category.find({ isActive: true }).lean();
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const total = await Complaint.countDocuments({ category: cat._id });
        const resCount = await Complaint.countDocuments({ category: cat._id, status: 'resolved' });
        return {
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          total,
          resolved: resCount,
          slaHours: cat.defaultSlaHours,
        };
      })
    );

    // Calculate resolution rate
    const resolutionRate = totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0;

    res.status(200).json({
      success: true,
      kpi: {
        totalComplaints,
        submitted,
        assigned,
        inProgress,
        resolved,
        rejected,
        resolutionRate,
        avgSlaHours: 14.2, // SLA benchmark
      },
      categoryStats,
      statusDistribution: [
        { name: 'Resolved', value: resolved, color: '#10b981' },
        { name: 'In Progress', value: inProgress, color: '#f59e0b' },
        { name: 'Assigned', value: assigned, color: '#8b5cf6' },
        { name: 'Submitted', value: submitted, color: '#0ea5e9' },
        { name: 'Rejected', value: rejected, color: '#f43f5e' },
      ],
    });
  } catch (error) {
    next(error);
  }
};
