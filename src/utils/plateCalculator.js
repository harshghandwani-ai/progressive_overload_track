/**
 * Utility to calculate barbell plate breakdowns.
 */
export const calculatePlates = (targetWeight, barWeight = 20) => {
  if (targetWeight <= barWeight) {
    return { perSideWeight: 0, plates: [], remainingWeight: 0 };
  }

  const weightPerSide = (targetWeight - barWeight) / 2;
  let remaining = weightPerSide;

  const availablePlates = [
    { weight: 25, color: '#ef4444', label: '25kg' },
    { weight: 20, color: '#3b82f6', label: '20kg' },
    { weight: 15, color: '#eab308', label: '15kg' },
    { weight: 10, color: '#22c55e', label: '10kg' },
    { weight: 5, color: '#f8fafc', label: '5kg' },
    { weight: 2.5, color: '#64748b', label: '2.5kg' },
    { weight: 1.25, color: '#94a3b8', label: '1.25kg' }
  ];

  const resultPlates = [];

  for (const plate of availablePlates) {
    while (remaining >= plate.weight) {
      resultPlates.push(plate);
      remaining = Math.round((remaining - plate.weight) * 100) / 100;
    }
  }

  return {
    perSideWeight: weightPerSide,
    plates: resultPlates,
    remainingWeight: remaining
  };
};
