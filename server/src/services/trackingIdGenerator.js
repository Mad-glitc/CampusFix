import Complaint from '../models/Complaint.js';

/**
 * Generates an institutional tracking ID: CF-YYYY-[0-9]{4}
 * Example: CF-2026-1042
 */
export const generateTrackingId = async () => {
  const currentYear = new Date().getFullYear();
  let trackingId = '';
  let exists = true;

  // Guarantee uniqueness
  while (exists) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    trackingId = `CF-${currentYear}-${randomSuffix}`;
    const duplicate = await Complaint.findOne({ trackingId }).lean();
    if (!duplicate) {
      exists = false;
    }
  }

  return trackingId;
};

export default generateTrackingId;
