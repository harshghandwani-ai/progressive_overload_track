/**
 * Utility functions for fitness calculations & Progressive Overload recommendation engine.
 */

// Calculate Estimated 1-Rep Max using the Epley Formula: 1RM = weight * (1 + reps / 30)
export const calculate1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 0) return 0;
  if (reps === 1) return Math.round(weight * 10) / 10;
  const oneRM = weight * (1 + reps / 30);
  return Math.round(oneRM * 10) / 10;
};

// Calculate total volume for a set or array of sets
export const calculateVolume = (sets) => {
  if (!Array.isArray(sets)) return 0;
  return sets.reduce((acc, set) => {
    if (set.completed && set.weight && set.reps) {
      return acc + (Number(set.weight) * Number(set.reps));
    }
    return acc;
  }, 0);
};

/**
 * Custom Progressive Overload Engine:
 * Rule: Only suggest weight increase when the user attains >= 25% MORE reps 
 * than the historical average reps for that exercise!
 */
export const getOverloadRecommendation = (exerciseHistory = [], currentWeight = 0, currentReps = 0) => {
  if (!exerciseHistory || exerciseHistory.length === 0) {
    return {
      type: 'baseline',
      recommendedWeight: currentWeight || 20,
      recommendedReps: currentReps || 8,
      message: 'Baseline set. Complete session to establish historical average reps.',
      progressPercentage: 0,
      attainedThreshold: false,
    };
  }

  // Gather all past sets for this exercise
  let totalRepsAllSets = 0;
  let totalSetsCount = 0;

  exerciseHistory.forEach(workout => {
    if (Array.isArray(workout.sets)) {
      workout.sets.forEach(set => {
        if (set.completed && set.reps > 0) {
          totalRepsAllSets += Number(set.reps);
          totalSetsCount += 1;
        }
      });
    }
  });

  if (totalSetsCount === 0) {
    return {
      type: 'baseline',
      recommendedWeight: currentWeight || 20,
      recommendedReps: currentReps || 8,
      message: 'No previous completed sets found. Build your baseline!',
      progressPercentage: 0,
      attainedThreshold: false,
    };
  }

  const avgReps = totalRepsAllSets / totalSetsCount;
  const thresholdReps = Math.ceil(avgReps * 1.25); // 25% higher than average reps

  // Check if current reps achieved exceed or equal threshold reps
  const isThresholdMet = currentReps >= thresholdReps;

  if (isThresholdMet) {
    // Overload! Suggest +2.5kg increase
    const nextWeight = Math.round((Number(currentWeight) + 2.5) * 10) / 10;
    return {
      type: 'increase_weight',
      recommendedWeight: nextWeight,
      recommendedReps: Math.max(6, Math.round(avgReps)),
      avgReps: Math.round(avgReps * 10) / 10,
      thresholdReps,
      currentReps,
      message: `🔥 Overload Unlocked! You achieved ${currentReps} reps (Threshold: ${thresholdReps} reps, +25% over avg ${Math.round(avgReps * 10) / 10}). Time to bump weight to ${nextWeight} kg!`,
      progressPercentage: 100,
      attainedThreshold: true,
    };
  } else {
    // Maintain weight and push reps towards the +25% goal
    const repsNeeded = thresholdReps - currentReps;
    const progressPercentage = Math.min(99, Math.round((currentReps / thresholdReps) * 100));

    return {
      type: 'increase_reps',
      recommendedWeight: currentWeight,
      recommendedReps: thresholdReps,
      avgReps: Math.round(avgReps * 10) / 10,
      thresholdReps,
      currentReps,
      repsNeeded,
      message: `Keep pushing at ${currentWeight} kg! Average: ${Math.round(avgReps * 10) / 10} reps. Hit ${thresholdReps} reps (${repsNeeded > 0 ? `${repsNeeded} more reps` : 'target reached'}) to trigger +2.5kg weight increase!`,
      progressPercentage,
      attainedThreshold: false,
    };
  }
};

// Format date into human readable string
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
