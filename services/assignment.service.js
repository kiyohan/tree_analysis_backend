const User = require('../models/User.model');
const Case = require('../models/Case.model');

/**
 * Finds the next available assessor based on the lowest number of active cases.
 * This function implements a round-robin strategy by load balancing.
 * @returns {Promise<string|null>} The ID of the assigned assessor, or null if no active assessors are found.
 */
exports.getNextAssessor = async () => {
  try {
    // 1. Find all active assessors.
    const activeAssessors = await User.find({ role: 'Assessor', status: 'Active' }).select('_id username');

    // 2. Handle edge cases: No assessors or only one assessor.
    if (!activeAssessors || activeAssessors.length === 0) {
      console.warn('No active assessors found. Case will remain unassigned.');
      return null;
    }

    if (activeAssessors.length === 1) {
      console.log(`Only one active assessor found. Assigning case to: ${activeAssessors[0].username}`);
      return activeAssessors[0]._id;
    }

    // 3. For multiple assessors, find the one with the fewest "Flagged for Review" cases.
    // We use a MongoDB aggregation pipeline for efficiency. This is much faster
    // than fetching all cases and counting in JavaScript.
    const workloadCounts = await Case.aggregate([
      // Stage 1: Filter for only the cases that are currently active (Flagged for Review)
      { $match: { status: 'Flagged for Review', assessor: { $in: activeAssessors.map(a => a._id) } } },
      
      // Stage 2: Group by assessor and count their active cases
      { $group: { _id: '$assessor', count: { $sum: 1 } } },
      
      // Stage 3: Sort by count in ascending order
      { $sort: { count: 1 } }
    ]);

    // 4. Create a map of assessorId -> workload for easy lookup.
    const workloadMap = new Map();
    workloadCounts.forEach(item => {
      workloadMap.set(item._id.toString(), item.count);
    });
    
    // 5. Find the assessor with the minimum load.
    // This also handles assessors who have a workload of 0 (they won't appear in the aggregation result).
    let minLoadAssessor = null;
    let minLoad = Infinity;

    for (const assessor of activeAssessors) {
      const currentLoad = workloadMap.get(assessor._id.toString()) || 0;
      if (currentLoad < minLoad) {
        minLoad = currentLoad;
        minLoadAssessor = assessor;
      }
    }

    console.log(`Assigning case to '${minLoadAssessor.username}' who has ${minLoad} active case(s).`);
    return minLoadAssessor._id;

  } catch (error) {
    console.error('Error in getNextAssessor service:', error);
    return null; // Return null on error so the case remains unassigned for manual review.
  }
};