import mongoose from 'mongoose';

/**
 * Campus Announcement Center Model
 * Supports categorized, prioritized, location-targeted, and scheduled campus notices
 */
const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide announcement title'],
      trim: true,
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide announcement content'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Electricity Maintenance',
        'Water Supply Disruption',
        'Wi-Fi Outage',
        'Building Maintenance',
        'Cleaning Schedule',
        'Emergency Notice',
        'General Announcement',
      ],
      default: 'General Announcement',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'emergency'],
      default: 'normal',
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetAudience: {
      type: [String],
      enum: ['all', 'student', 'staff', 'admin'],
      default: ['all'],
    },
    targetLocations: {
      type: [String],
      default: [], // Empty array represents all campus facilities
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['published', 'scheduled', 'resolved', 'archived'],
      default: 'published',
      index: true,
    },
    isEmergency: {
      type: Boolean,
      default: false,
      index: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionNote: {
      type: String,
      default: '',
      trim: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    scheduledFor: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ status: 1, publishedAt: -1 });
announcementSchema.index({ isEmergency: 1, status: 1 });
announcementSchema.index({ isResolved: 1, publishedAt: -1 });

export const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
