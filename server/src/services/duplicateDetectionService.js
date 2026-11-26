import Complaint from '../models/Complaint.js';

/**
 * Duplicate Complaint Detection Engine
 * Matches potential duplicates across category, building, room, and semantic text overlap.
 */

// Simple tokenizer for semantic overlap
const tokenize = (text = '') => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
};

export const findDuplicateComplaints = async ({
  category,
  building = '',
  room = '',
  title = '',
  description = '',
  excludeId = null,
}) => {
  // Query only active, unresolved complaints
  const query = {
    status: { $in: ['submitted', 'assigned', 'in_progress'] },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  // Pre-filter by building if provided, or broadly by category
  if (building && building.trim()) {
    query['location.building'] = new RegExp(building.trim(), 'i');
  }

  const activeCandidates = await Complaint.find(query)
    .populate('category', 'name slug')
    .populate('student', 'name department')
    .limit(25);

  const inputTokens = new Set([...tokenize(title), ...tokenize(description)]);

  const results = [];

  for (const candidate of activeCandidates) {
    let score = 0;
    const matchReasons = [];

    // 1. Building match (35%)
    if (building && candidate.location?.building) {
      if (candidate.location.building.toLowerCase().includes(building.toLowerCase().trim())) {
        score += 35;
        matchReasons.push('Same Facility Building');
      }
    }

    // 2. Room match (25%)
    if (room && candidate.location?.room) {
      if (candidate.location.room.toLowerCase().includes(room.toLowerCase().trim())) {
        score += 25;
        matchReasons.push(`Same Location (${candidate.location.room})`);
      }
    }

    // 3. Category match (20%)
    if (category && candidate.category) {
      const catIdStr = String(candidate.category._id || candidate.category);
      if (catIdStr === String(category)) {
        score += 20;
        matchReasons.push('Identical Defect Category');
      }
    }

    // 4. Keyword token overlap (up to 20%)
    const candidateTokens = tokenize(`${candidate.title} ${candidate.description}`);
    let overlapCount = 0;
    candidateTokens.forEach((token) => {
      if (inputTokens.has(token)) overlapCount++;
    });

    if (candidateTokens.length > 0 && overlapCount > 0) {
      const overlapRatio = Math.min(1, overlapCount / Math.max(1, inputTokens.size));
      const textScore = Math.round(overlapRatio * 20);
      score += textScore;
      if (textScore >= 8) matchReasons.push('High Description Overlap');
    }

    // If similarity reaches 40% threshold, include as potential duplicate
    if (score >= 40) {
      results.push({
        _id: candidate._id,
        trackingId: candidate.trackingId,
        title: candidate.title,
        description: candidate.description,
        location: candidate.location,
        priority: candidate.priority,
        status: candidate.status,
        upvoteCount: candidate.upvoteCount || 0,
        createdAt: candidate.createdAt,
        images: candidate.images || [],
        similarityScore: Math.min(99, score),
        matchReasons,
      });
    }
  }

  // Sort by highest similarity first, then by upvotes
  results.sort((a, b) => b.similarityScore - a.similarityScore || b.upvoteCount - a.upvoteCount);

  return results.slice(0, 5); // Return top 5 most relevant potential duplicates
};

export default {
  findDuplicateComplaints,
};
