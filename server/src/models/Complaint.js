import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide issue title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed issue description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify issue category'],
    },
    location: {
      building: {
        type: String,
        required: [true, 'Please provide building name'],
        trim: true,
      },
      floor: {
        type: String,
        required: [true, 'Please provide floor'],
        trim: true,
      },
      room: {
        type: String,
        required: [true, 'Please provide room or lab designation'],
        trim: true,
      },
      landmark: {
        type: String,
        trim: true,
        default: '',
      },
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['submitted', 'assigned', 'in_progress', 'resolved', 'rejected'],
        message: '{VALUE} is not a valid status',
      },
      default: 'submitted',
      index: true,
    },
    images: [
      {
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    resolvedImages: [
      {
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    resolutionRemarks: {
      type: String,
      trim: true,
      default: '',
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    upvoteCount: {
      type: Number,
      default: 0,
      index: true,
    },
    // SLA Management Fields
    slaHours: {
      type: Number,
      default: 24,
    },
    slaDeadline: {
      type: Date,
      default: null,
      index: true,
    },
    isOverdue: {
      type: Boolean,
      default: false,
      index: true,
    },
    escalationLevel: {
      type: Number,
      default: 0,
      index: true,
    },
    escalationHistory: [
      {
        level: { type: Number, required: true },
        escalatedAt: { type: Date, default: Date.now },
        reason: { type: String, default: '' },
        notifiedRoles: [{ type: String }],
      },
    ],
    deadlineAdjustments: [
      {
        adjustedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        oldDeadline: { type: Date },
        newDeadline: { type: Date },
        reason: { type: String, required: true },
        adjustedAt: { type: Date, default: Date.now },
      },
    ],
    slaPaused: {
      type: Boolean,
      default: false,
    },
    slaPausedAt: {
      type: Date,
      default: null,
    },
    // AI Computer Vision & Neural Image Tagging
    aiAnalysis: {
      detectedIssue: { type: String, default: '' },
      confidence: { type: Number, default: 0 },
      suggestedCategory: { type: String, default: '' },
      suggestedPriority: { type: String, default: '' },
      tags: [{ type: String }],
      recommendedActions: [{ type: String }],
      analyzedAt: { type: Date, default: null },
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      isSatisfied: {
        type: String,
        enum: ['satisfied', 'partially_satisfied', 'unsatisfied', ''],
        default: '',
      },
      desiredChanges: {
        type: String,
        trim: true,
        default: '',
      },
      comments: {
        type: String,
        trim: true,
        default: '',
      },
      submittedAt: {
        type: Date,
        default: null,
      },
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast filtering and pagination
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ student: 1, createdAt: -1 });
complaintSchema.index({ assignedStaff: 1, status: 1 });
complaintSchema.index({ upvoteCount: -1, status: 1 });
complaintSchema.index({ isOverdue: 1, slaDeadline: 1 });
complaintSchema.index({ 'location.building': 1, category: 1, status: 1 });

export const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
