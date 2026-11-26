import Complaint from '../models/Complaint.js';
import SlaConfig from '../models/SlaConfig.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Comment from '../models/Comment.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Service Level Agreement (SLA) Engine & Automatic Escalation Handler
 * Uses reliable server-side calculations and idempotent event logging.
 */

// Default SLA thresholds in hours by priority
const DEFAULT_SLA_HOURS = {
  urgent: 4,   // Critical facility failures
  high: 12,   // High disruption
  medium: 24, // Standard repairs
  low: 72,    // Non-urgent cosmetic / routine
};

/**
 * Calculate SLA deadline from server clock
 */
export const calculateSlaDeadline = async (priority = 'medium') => {
  try {
    const config = await SlaConfig.findOne();
    const hours = (config?.priorityHours && config.priorityHours[priority]) || DEFAULT_SLA_HOURS[priority] || 24;
    const slaDeadline = new Date(Date.now() + hours * 3600 * 1000);
    return { slaHours: hours, slaDeadline };
  } catch (err) {
    console.error('[SLA Calculation Error]:', err);
    const hours = DEFAULT_SLA_HOURS[priority] || 24;
    return { slaHours: hours, slaDeadline: new Date(Date.now() + hours * 3600 * 1000) };
  }
};

/**
 * Idempotent Automatic Escalation Processor
 * Evaluates all active tickets against their deadlines and escalates levels without repeated duplicate alerts.
 */
export const processAutomaticEscalations = async () => {
  const now = new Date();

  // Find unresolved complaints past their deadline that are not paused
  const overdueTickets = await Complaint.find({
    status: { $in: ['submitted', 'assigned', 'in_progress'] },
    slaDeadline: { $ne: null, $lt: now },
    slaPaused: { $ne: true },
  }).populate('assignedStaff', 'name email department');

  const escalatedResults = [];

  for (const ticket of overdueTickets) {
    const overdueMs = now.getTime() - new Date(ticket.slaDeadline).getTime();
    const overdueHours = overdueMs / (1000 * 3600);

    let newLevel = ticket.escalationLevel || 0;
    let reason = '';
    let notifiedRoles = [];

    // Determine idempotent target level
    if (overdueHours >= 12 && ticket.escalationLevel < 3) {
      newLevel = 3;
      reason = `Critical SLA breach: Overdue by ${Math.floor(overdueHours)} hours. Requires immediate administrative intervention.`;
      notifiedRoles = ['admin', 'staff'];
    } else if (overdueHours >= 4 && ticket.escalationLevel < 2) {
      newLevel = 2;
      reason = `Second Escalation: Unresolved ${Math.floor(overdueHours)} hours past deadline. Notified campus administrators.`;
      notifiedRoles = ['admin'];
    } else if (overdueHours >= 0 && ticket.escalationLevel < 1) {
      newLevel = 1;
      reason = `First Escalation: Resolution deadline elapsed. Urgent dispatch reminder sent to maintenance technician.`;
      notifiedRoles = ['staff'];
    }

    // Only apply if an escalation step was reached
    if (newLevel > (ticket.escalationLevel || 0)) {
      ticket.isOverdue = true;
      ticket.escalationLevel = newLevel;
      ticket.escalationHistory.push({
        level: newLevel,
        escalatedAt: now,
        reason,
        notifiedRoles,
      });

      await ticket.save();

      // Send In-App Notifications
      if (notifiedRoles.includes('staff') && ticket.assignedStaff) {
        await Notification.create({
          recipient: ticket.assignedStaff._id,
          title: `⚠️ SLA Alert: ${ticket.trackingId} Overdue`,
          message: `${ticket.title} is past target SLA (${Math.floor(overdueHours)}h overdue). Please update repair status.`,
          type: 'escalation',
          relatedComplaint: ticket._id,
        });
      }

      if (notifiedRoles.includes('admin')) {
        const admins = await User.find({ role: 'admin', isActive: true });
        for (const admin of admins) {
          await Notification.create({
            recipient: admin._id,
            title: `🚨 Escalation Level ${newLevel}: ${ticket.trackingId}`,
            message: `${ticket.title} (${ticket.location?.building}) is ${Math.floor(overdueHours)}h overdue. Assigned: ${ticket.assignedStaff?.name || 'Unassigned'}.`,
            type: 'escalation',
            relatedComplaint: ticket._id,
          });
        }
      }

      // Log to Complaint Timeline
      await Comment.create({
        complaint: ticket._id,
        content: `🚨 Automated SLA Escalation (Level ${newLevel}): ${reason}`,
        isInternal: false,
      });

      // Audit Log Record
      await AuditLog.create({
        action: `COMPLAINT_ESCALATED_L${newLevel}`,
        entityType: 'Complaint',
        entityId: ticket._id,
        details: {
          trackingId: ticket.trackingId,
          overdueHours: Number(overdueHours.toFixed(2)),
          escalationLevel: newLevel,
          notifiedRoles,
        },
      });

      escalatedResults.push({
        id: ticket._id,
        trackingId: ticket.trackingId,
        level: newLevel,
        overdueHours: Number(overdueHours.toFixed(1)),
      });
    } else if (!ticket.isOverdue) {
      // Mark as overdue even if level hasn't transitioned
      ticket.isOverdue = true;
      await ticket.save();
    }
  }

  return {
    processedCount: overdueTickets.length,
    escalatedCount: escalatedResults.length,
    escalations: escalatedResults,
  };
};

export default {
  calculateSlaDeadline,
  processAutomaticEscalations,
};
