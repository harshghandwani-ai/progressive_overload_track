/**
 * Utility functions for fitness calculations & Progressive Overload recommendation engine.
 * Focused strictly on standard sets (Weight & Reps).
 */

// Calculate total volume for a set or array of sets (Weight * Reps)
export const calculateVolume = (sets) => {
  if (!Array.isArray(sets)) return 0;
  return sets.reduce((acc, set) => {
    if (set.completed && set.weight && set.reps) {
      return acc + (Number(set.weight) * Number(set.reps));
    }
    return acc;
  }, 0);
};

// Get heaviest weight lifted from an array of sets
export const getMaxWeight = (sets) => {
  if (!Array.isArray(sets) || sets.length === 0) return 0;
  let maxW = 0;
  sets.forEach(s => {
    if (s.completed && Number(s.weight) > maxW) {
      maxW = Number(s.weight);
    }
  });
  return maxW;
};

// Get max reps hit at a given weight
export const getMaxReps = (sets) => {
  if (!Array.isArray(sets) || sets.length === 0) return 0;
  let maxR = 0;
  sets.forEach(s => {
    if (s.completed && Number(s.reps) > maxR) {
      maxR = Number(s.reps);
    }
  });
  return maxR;
};

/**
 * Progressive Overload Engine (25% Rep Rule):
 * Overload suggestion triggers when reps attained in exercise >= 25% higher than average reps.
 */
export const getOverloadRecommendation = (exerciseHistory = [], currentWeight = 0, currentReps = 0) => {
  if (!exerciseHistory || exerciseHistory.length === 0) {
    return {
      type: 'baseline',
      recommendedWeight: currentWeight || 20,
      recommendedReps: currentReps || 8,
      message: 'Baseline set. Complete session to establish average reps.',
      progressPercentage: 0,
      attainedThreshold: false,
    };
  }

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

  const isThresholdMet = currentReps >= thresholdReps;

  if (isThresholdMet) {
    const nextWeight = Math.round((Number(currentWeight) + 2.5) * 10) / 10;
    return {
      type: 'increase_weight',
      recommendedWeight: nextWeight,
      recommendedReps: Math.max(6, Math.round(avgReps)),
      avgReps: Math.round(avgReps * 10) / 10,
      thresholdReps,
      currentReps,
      message: `🔥 25% Rep Overload Hit! You achieved ${currentReps} reps (Threshold: ${thresholdReps} reps). Increase weight to ${nextWeight} kg!`,
      progressPercentage: 100,
      attainedThreshold: true,
    };
  } else {
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
      message: `Keep pushing at ${currentWeight} kg! Avg: ${Math.round(avgReps * 10) / 10} reps. Hit ${thresholdReps} reps (${repsNeeded > 0 ? `${repsNeeded} more reps` : 'target reached'}) for a +2.5kg weight bump!`,
      progressPercentage,
      attainedThreshold: false,
    };
  }
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
