import mongoose from 'mongoose';

/**
 * Community Upvoting System Model
 * Enforces one vote per student per complaint at the database layer
 */
const complaintVoteSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound unique index: guarantees a student can only vote once per complaint
complaintVoteSchema.index({ complaint: 1, student: 1 }, { unique: true });

export const ComplaintVote = mongoose.model('ComplaintVote', complaintVoteSchema);
export default ComplaintVote;
