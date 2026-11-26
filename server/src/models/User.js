import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide user full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide institutional email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid institutional email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Hidden by default from queries
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin', 'staff'],
        message: '{VALUE} is not a supported role',
      },
      default: 'student',
    },
    department: {
      type: String,
      default: 'General',
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPresent: {
      type: Boolean,
      default: true,
    },
    shift: {
      type: String,
      default: 'Morning Shift (08:00 - 16:30)',
    },
    specialty: {
      type: String,
      default: 'General Maintenance',
    },
    rating: {
      type: Number,
      default: 4.9,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save password hashing hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
