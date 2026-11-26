import mongoose from 'mongoose';

const lostFoundItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['lost', 'found'],
        message: '{VALUE} is not a valid item type',
      },
      required: [true, 'Please specify whether item was lost or found'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    category: {
      type: String,
      enum: [
        'Electronics',
        'Wallets & IDs',
        'Keys',
        'Bags & Luggage',
        'Books & Stationery',
        'Clothing & Accessories',
        'Bottles & Containers',
        'Other',
      ],
      default: 'Other',
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide item details and description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    location: {
      building: {
        type: String,
        required: [true, 'Campus building is required'],
        trim: true,
      },
      specificSpot: {
        type: String,
        trim: true,
        default: '',
      },
    },
    itemDate: {
      type: Date,
      default: Date.now,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    contact: {
      name: {
        type: String,
        required: [true, 'Contact person name is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Contact phone number is required'],
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        default: '',
      },
      handoverLocation: {
        type: String,
        trim: true,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['open', 'claimed', 'closed'],
      default: 'open',
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    resolutionRemarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

lostFoundItemSchema.index({ type: 1, status: 1, createdAt: -1 });
lostFoundItemSchema.index({ category: 1, status: 1 });
lostFoundItemSchema.index({ 'location.building': 1, status: 1 });

export const LostFoundItem = mongoose.model('LostFoundItem', lostFoundItemSchema);
export default LostFoundItem;
