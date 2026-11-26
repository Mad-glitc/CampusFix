import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide comment text'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isInternal: {
      type: Boolean,
      default: false, // Internal notes between Admin and Staff
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
