import { DEFAULT_EXERCISES } from '../data/defaultExercises';
import { DEFAULT_ROUTINES } from '../data/defaultRoutines';

const STORAGE_KEY = 'progressive_overload_track_v1';

export const getInitialState = () => {
  return {
    exercises: [],
    routines: [],
    workoutHistory: [],
    activeWorkout: null,
    settings: {
      unit: 'kg',
      restTimerDuration: 90,
      overloadRepThresholdPercent: 25
    }
  };
};

export const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialState = getInitialState();
      saveData(initialState);
      return initialState;
    }
    const parsed = JSON.parse(raw);
    return {
      exercises: parsed.exercises || [],
      routines: parsed.routines || [],
      workoutHistory: parsed.workoutHistory || [],
      activeWorkout: parsed.activeWorkout || null,
      settings: {
        unit: 'kg',
        restTimerDuration: 90,
        overloadRepThresholdPercent: 25,
        ...(parsed.settings || {})
      }
    };
  } catch (err) {
    console.error('Failed to load storage data:', err);
    return getInitialState();
  }
};

export const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save storage data:', err);
  }
};

export const exportDataJSON = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `progressive-overload-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const resetDataToDefault = () => {
  const defaultState = getInitialState();
  saveData(defaultState);
  return defaultState;
};

// Convert image file to base64 data URL for local persistent storage
export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
