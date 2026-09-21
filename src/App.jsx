import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import ActiveWorkout from './components/WorkoutLogger/ActiveWorkout';
import RoutineList from './components/Routines/RoutineList';
import ExerciseList from './components/ExerciseLibrary/ExerciseList';
import AnalyticsOverview from './components/Analytics/AnalyticsOverview';
import { loadData, saveData, exportDataJSON, resetDataToDefault } from './utils/storage';

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sync data to localStorage
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Start new empty workout session
  const handleStartEmptyWorkout = () => {
    const defaultEx = data.exercises[0]; // Barbell Bench Press
    const newWorkout = {
      id: `workout-${Date.now()}`,
      name: `Workout ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      startTime: Date.now(),
      exercises: [
        {
          exerciseId: defaultEx.id,
          exerciseName: defaultEx.name,
          sets: [
            { setNumber: 1, weight: 60, reps: 8, completed: false, rpe: 8 },
            { setNumber: 2, weight: 60, reps: 8, completed: false, rpe: 8 },
            { setNumber: 3, weight: 60, reps: 8, completed: false, rpe: 8 }
          ]
        }
      ]
    };

    setData(prev => ({ ...prev, activeWorkout: newWorkout }));
    setActiveTab('logger');
  };

  // Start workout from routine
  const handleStartFromRoutine = (routine) => {
    const routineExercises = routine.exerciseIds.map(id => {
      const ex = data.exercises.find(e => e.id === id);
      return {
        exerciseId: id,
        exerciseName: ex ? ex.name : id,
        sets: [
          { setNumber: 1, weight: 40, reps: 8, completed: false, rpe: 8 },
          { setNumber: 2, weight: 40, reps: 8, completed: false, rpe: 8 },
          { setNumber: 3, weight: 40, reps: 8, completed: false, rpe: 8 }
        ]
      };
    });

    const newWorkout = {
      id: `workout-${Date.now()}`,
      name: routine.name,
      startTime: Date.now(),
      exercises: routineExercises
    };

    setData(prev => ({ ...prev, activeWorkout: newWorkout }));
    setActiveTab('logger');
  };

  // Save completed workout
  const handleSaveWorkout = (completedWorkout) => {
    setData(prev => ({
      ...prev,
      workoutHistory: [...prev.workoutHistory, completedWorkout],
      activeWorkout: null
    }));
    setActiveTab('dashboard');
  };

  // Cancel current active workout
  const handleCancelWorkout = () => {
    if (window.confirm('Are you sure you want to cancel the active workout session? Unsaved set progress will be lost.')) {
      setData(prev => ({ ...prev, activeWorkout: null }));
      setActiveTab('dashboard');
    }
  };

  // Add custom exercise
  const handleAddExercise = (newExercise) => {
    setData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  // Create custom routine
  const handleCreateRoutine = (newRoutine) => {
    setData(prev => ({
      ...prev,
      routines: [...prev.routines, newRoutine]
    }));
  };

  // Delete routine
  const handleDeleteRoutine = (routineId) => {
    setData(prev => ({
      ...prev,
      routines: prev.routines.filter(r => r.id !== routineId)
    }));
  };

  // Export JSON backup
  const handleExport = () => {
    exportDataJSON(data);
  };

  // Reset to seed demo data
  const handleReset = () => {
    if (window.confirm('Reset app data to default demo state? All local modifications will be replaced with fresh sample data.')) {
      const freshState = resetDataToDefault();
      setData(freshState);
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="app-container">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeWorkout={data.activeWorkout}
        onStartWorkout={handleStartEmptyWorkout}
        onExport={handleExport}
        onReset={handleReset}
      />

      <main>
        {activeTab === 'dashboard' && (
          <Dashboard
            workoutHistory={data.workoutHistory}
            routines={data.routines}
            onStartWorkout={handleStartEmptyWorkout}
            onStartFromRoutine={handleStartFromRoutine}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'logger' && (
          data.activeWorkout ? (
            <ActiveWorkout
              workout={data.activeWorkout}
              availableExercises={data.exercises}
              workoutHistory={data.workoutHistory}
              onSaveWorkout={handleSaveWorkout}
              onCancelWorkout={handleCancelWorkout}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Active Workout Session</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Start a fresh session or launch one of your preset split routines.
              </p>
              <button className="btn btn-emerald" onClick={handleStartEmptyWorkout}>
                Start Workout Now
              </button>
            </div>
          )
        )}

        {activeTab === 'routines' && (
          <RoutineList
            routines={data.routines}
            availableExercises={data.exercises}
            onStartFromRoutine={handleStartFromRoutine}
            onCreateRoutine={handleCreateRoutine}
            onDeleteRoutine={handleDeleteRoutine}
          />
        )}

        {activeTab === 'exercises' && (
          <ExerciseList
            exercises={data.exercises}
            workoutHistory={data.workoutHistory}
            onAddExercise={handleAddExercise}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsOverview
            exercises={data.exercises}
            workoutHistory={data.workoutHistory}
          />
        )}
      </main>
    </div>
  );
}
