import mongoose from 'mongoose';

/**
 * Service Level Agreement (SLA) Global Configuration Model
 */
const slaConfigSchema = new mongoose.Schema(
  {
    priorityHours: {
      urgent: { type: Number, default: 4 },   // Critical/Urgent: 4h
      high: { type: Number, default: 12 },    // High: 12h
      medium: { type: Number, default: 24 },  // Medium: 24h
      low: { type: Number, default: 72 },     // Low: 72h
    },
    autoEscalate: {
      type: Boolean,
      default: true,
    },
    escalationThresholds: {
      level1Hours: { type: Number, default: 0 },   // Overdue immediately -> notify staff
      level2Hours: { type: Number, default: 4 },   // 4h overdue -> notify admin
      level3Hours: { type: Number, default: 12 },  // 12h overdue -> require admin intervention
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const SlaConfig = mongoose.model('SlaConfig', slaConfigSchema);
export default SlaConfig;
