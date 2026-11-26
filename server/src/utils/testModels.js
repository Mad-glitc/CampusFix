import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Complaint } from '../models/Complaint.js';
import { Assignment } from '../models/Assignment.js';
import { Comment } from '../models/Comment.js';
import { Notification } from '../models/Notification.js';
import { generateTrackingId } from '../services/trackingIdGenerator.js';

console.log('✅ User model loaded successfully');
console.log('✅ Category model loaded successfully');
console.log('✅ Complaint model loaded successfully');
console.log('✅ Assignment model loaded successfully');
console.log('✅ Comment model loaded successfully');
console.log('✅ Notification model loaded successfully');
console.log('✅ Tracking ID generator loaded successfully');
console.log('All Phase 2 models and services verified without syntax errors!');
process.exit(0);
