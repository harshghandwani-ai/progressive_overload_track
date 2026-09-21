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

  useEffect(() => {
    saveData(data);
  }, [data]);

  const handleQuickLogExercise = ({ exerciseName, muscleGroup, equipment, sets, image }) => {
    setData(prev => {
      let exMatch = prev.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
      let updatedExercises = [...prev.exercises];

      if (!exMatch) {
        exMatch = {
          id: `ex-${Date.now()}`,
          name: exerciseName,
          muscleGroup: muscleGroup || 'Full Body',
          equipment: equipment || 'Machine',
          image: image || null,
          isCustom: true
        };
        updatedExercises.push(exMatch);
      } else if (image && !exMatch.image) {
        exMatch.image = image;
      }

      const newSession = {
        id: `workout-${Date.now()}`,
        name: exerciseName,
        date: new Date().toISOString(),
        image: image || null,
        durationMinutes: 20,
        exercises: [
          {
            exerciseId: exMatch.id,
            exerciseName: exMatch.name,
            image: image || exMatch.image,
            sets: sets.map((s, i) => ({
              setNumber: i + 1,
              weight: s.weight,
              reps: s.reps,
              completed: true
            }))
          }
        ]
      };

      return {
        ...prev,
        exercises: updatedExercises,
        workoutHistory: [...prev.workoutHistory, newSession]
      };
    });
  };

  const handleStartEmptyWorkout = () => {
    const newWorkout = {
      id: `workout-${Date.now()}`,
      name: `Workout ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      startTime: Date.now(),
      exercises: []
    };

    setData(prev => ({ ...prev, activeWorkout: newWorkout }));
    setActiveTab('logger');
  };

  const handleStartFromRoutine = (routine) => {
    const routineExercises = routine.exerciseIds.map(id => {
      const ex = data.exercises.find(e => e.id === id);
      return {
        exerciseId: id,
        exerciseName: ex ? ex.name : id,
        image: ex?.image || null,
        sets: [
          { setNumber: 1, weight: '', reps: '', completed: false },
          { setNumber: 2, weight: '', reps: '', completed: false },
          { setNumber: 3, weight: '', reps: '', completed: false }
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

  const handleSaveWorkout = (completedWorkout) => {
    setData(prev => ({
      ...prev,
      workoutHistory: [...prev.workoutHistory, completedWorkout],
      activeWorkout: null
    }));
    setActiveTab('dashboard');
  };

  const handleCancelWorkout = () => {
    if (window.confirm('Are you sure you want to cancel the active workout session? Unsaved set progress will be lost.')) {
      setData(prev => ({ ...prev, activeWorkout: null }));
      setActiveTab('dashboard');
    }
  };

  const handleAddExercise = (newExercise) => {
    setData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const handleCreateRoutine = (newRoutine) => {
    setData(prev => ({
      ...prev,
      routines: [...prev.routines, newRoutine]
    }));
  };

  const handleDeleteRoutine = (routineId) => {
    setData(prev => ({
      ...prev,
      routines: prev.routines.filter(r => r.id !== routineId)
    }));
  };

  const handleExport = () => {
    exportDataJSON(data);
  };

  const handleReset = () => {
    if (window.confirm('Reset app data to clean empty state? All local data will be reset.')) {
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
            exercises={data.exercises}
            workoutHistory={data.workoutHistory}
            routines={data.routines}
            onStartWorkout={handleStartEmptyWorkout}
            onStartFromRoutine={handleStartFromRoutine}
            onSelectTab={setActiveTab}
            onQuickLogExercise={handleQuickLogExercise}
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
              onAddExercise={handleAddExercise}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Active Workout Session</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Start a fresh session or use the Quick AI Photo Logger on the Dashboard!
              </p>
              <button className="btn btn-emerald" onClick={handleStartEmptyWorkout}>
                Start Logging Session
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
