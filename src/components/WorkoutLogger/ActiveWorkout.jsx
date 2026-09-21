import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Flame, Sparkles, Image as ImageIcon, X, Camera } from 'lucide-react';
import { calculateVolume, getOverloadRecommendation } from '../../utils/formulas';
import { convertFileToBase64 } from '../../utils/storage';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '../../data/defaultExercises';
import RestTimer from './RestTimer';

export default function ActiveWorkout({ 
  workout, 
  availableExercises, 
  workoutHistory, 
  onSaveWorkout, 
  onCancelWorkout,
  onAddExercise 
}) {
  const [workoutName, setWorkoutName] = useState(workout?.name || 'My Workout Session');
  const [workoutImage, setWorkoutImage] = useState(workout?.image || null);
  const [exercises, setExercises] = useState(workout?.exercises || []);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [timerDuration] = useState(90);

  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState(MUSCLE_GROUPS[0]);
  const [newExEquipment, setNewExEquipment] = useState(EQUIPMENT_TYPES[0]);
  const [newExImage, setNewExImage] = useState(null);

  const handleWorkoutImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await convertFileToBase64(file);
        setWorkoutImage(base64);
      } catch (err) {
        console.error('Failed to convert image:', err);
      }
    }
  };

  const handleExerciseImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await convertFileToBase64(file);
        setNewExImage(base64);
      } catch (err) {
        console.error('Failed to convert image:', err);
      }
    }
  };

  const handleSelectExistingExercise = (exercise) => {
    const pastWorkout = workoutHistory.find(w => 
      w.exercises.some(e => e.exerciseId === exercise.id)
    );
    const pastEx = pastWorkout?.exercises.find(e => e.exerciseId === exercise.id);

    const defaultWeight = pastEx?.sets[0]?.weight || '';
    const defaultReps = pastEx?.sets[0]?.reps || '';

    const newEntry = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      image: exercise.image || null,
      sets: [
        { setNumber: 1, weight: defaultWeight, reps: defaultReps, completed: false },
        { setNumber: 2, weight: defaultWeight, reps: defaultReps, completed: false },
        { setNumber: 3, weight: defaultWeight, reps: defaultReps, completed: false }
      ]
    };

    setExercises([...exercises, newEntry]);
    setShowAddModal(false);
  };

  const handleCreateAndAddExercise = (e) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const createdExercise = {
      id: `ex-${Date.now()}`,
      name: newExName.trim(),
      muscleGroup: newExMuscle,
      equipment: newExEquipment,
      image: newExImage,
      isCustom: true
    };

    onAddExercise(createdExercise);

    const newEntry = {
      exerciseId: createdExercise.id,
      exerciseName: createdExercise.name,
      image: createdExercise.image,
      sets: [
        { setNumber: 1, weight: '', reps: '', completed: false },
        { setNumber: 2, weight: '', reps: '', completed: false },
        { setNumber: 3, weight: '', reps: '', completed: false }
      ]
    };

    setExercises([...exercises, newEntry]);
    setShowCreateModal(false);
    setNewExName('');
    setNewExImage(null);
  };

  const handleRemoveExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleAddSet = (exerciseIndex) => {
    const updated = [...exercises];
    const targetEx = updated[exerciseIndex];
    const lastSet = targetEx.sets[targetEx.sets.length - 1] || { weight: '', reps: '' };

    targetEx.sets.push({
      setNumber: targetEx.sets.length + 1,
      weight: lastSet.weight,
      reps: lastSet.reps,
      completed: false
    });
    setExercises(updated);
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    updated[exerciseIndex].sets.forEach((s, idx) => s.setNumber = idx + 1);
    setExercises(updated);
  };

  const handleUpdateSet = (exerciseIndex, setIndex, field, value) => {
    const updated = [...exercises];
    const setItem = updated[exerciseIndex].sets[setIndex];
    setItem[field] = value;
    
    if (field === 'completed' && value === true) {
      setShowRestTimer(true);
    }

    setExercises(updated);
  };

  const handleFinish = () => {
    if (exercises.length === 0) {
      alert('Please add at least one exercise before completing the workout.');
      return;
    }

    const completedWorkout = {
      id: workout?.id || `workout-${Date.now()}`,
      name: workoutName,
      image: workoutImage,
      date: new Date().toISOString(),
      durationMinutes: Math.max(15, Math.round((Date.now() - (workout?.startTime || Date.now())) / 60000)),
      exercises
    };

    onSaveWorkout(completedWorkout);
  };

  const getExercisePastHistory = (exerciseId) => {
    const matches = [];
    workoutHistory.forEach(w => {
      const match = w.exercises.find(e => e.exerciseId === exerciseId);
      if (match) {
        matches.push({ date: w.date, sets: match.sets });
      }
    });
    return matches;
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', animation: 'fadeIn 0.2s ease' }}>
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>
              <Flame size={13} /> Active Session
            </span>
            <input
              type="text"
              className="input-field"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Workout Title..."
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                fontWeight: 700,
                background: 'transparent',
                border: 'none',
                padding: '0.2rem 0',
                boxShadow: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={onCancelWorkout}>Cancel</button>
            <button className="btn btn-emerald" onClick={handleFinish}>
              <CheckCircle2 size={18} /> Finish Workout
            </button>
          </div>
        </div>

        {/* Workout Photo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
          {workoutImage ? (
            <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <img src={workoutImage} alt="Workout photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => setWorkoutImage(null)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'rgba(0,0,0,0.7)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center'
                }}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              <Camera size={16} /> Attach Workout Photo
              <input type="file" accept="image/*" onChange={handleWorkoutImageUpload} style={{ display: 'none' }} />
            </label>
          )}
        </div>
      </div>

      {/* Exercises List */}
      {exercises.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
          <ImageIcon size={42} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Exercises Added Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Add your exercise to start logging sets.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-emerald" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> Create New Exercise
            </button>
            {availableExercises.length > 0 && (
              <button className="btn btn-secondary" onClick={() => setShowAddModal(true)}>
                Select Existing ({availableExercises.length})
              </button>
            )}
          </div>
        </div>
      ) : (
        exercises.map((ex, exIndex) => {
          const history = getExercisePastHistory(ex.exerciseId);
          const completedSets = ex.sets.filter(s => s.completed);
          const latestSet = completedSets[completedSets.length - 1] || ex.sets[0] || { weight: 0, reps: 0 };
          const rec = getOverloadRecommendation(history, latestSet.weight, latestSet.reps);

          return (
            <div key={exIndex} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {ex.image && (
                    <img 
                      src={ex.image} 
                      alt={ex.exerciseName} 
                      style={{ width: '54px', height: '54px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                    />
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{ex.exerciseName}</h3>
                    {history.length > 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Last Session: {history[0].sets.map(s => `${s.weight || 0}kg × ${s.reps || 0}`).join(' | ')}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        First time logging this exercise. Build your baseline!
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => handleRemoveExercise(exIndex)}
                  style={{ color: 'var(--accent-rose)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Overload Box */}
              {history.length > 0 && (
                <div className={`overload-box ${rec.attainedThreshold ? '' : 'maintain'}`}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                      <Sparkles size={18} color={rec.attainedThreshold ? 'var(--accent-emerald)' : 'var(--accent-primary)'} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: rec.attainedThreshold ? 'var(--accent-emerald)' : '#fff' }}>
                          {rec.attainedThreshold ? '25% REP OVERLOAD UNLOCKED!' : 'OVERLOAD TARGET (25% Rep Rule)'}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {rec.message}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${rec.progressPercentage}%` }}></div>
                  </div>
                </div>
              )}

              {/* Standard Sets Table (Weight & Reps Only) */}
              <div style={{ overflowX: 'auto' }}>
                <table className="sets-table">
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>Set</th>
                      <th style={{ width: '35%' }}>Weight (kg)</th>
                      <th style={{ width: '35%' }}>Reps</th>
                      <th style={{ width: '15%', textAlign: 'center' }}>Done</th>
                      <th style={{ width: '10%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.sets.map((set, setIdx) => (
                      <tr key={setIdx} style={{ opacity: set.completed ? 0.75 : 1 }}>
                        <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                          #{set.setNumber}
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.5"
                            className="input-field"
                            placeholder="Weight (kg)"
                            value={set.weight}
                            onChange={(e) => handleUpdateSet(exIndex, setIdx, 'weight', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="input-field"
                            placeholder="Reps"
                            value={set.reps}
                            onChange={(e) => handleUpdateSet(exIndex, setIdx, 'reps', e.target.value)}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: set.completed ? 'var(--accent-emerald)' : 'var(--text-muted)'
                            }}
                            onClick={() => handleUpdateSet(exIndex, setIdx, 'completed', !set.completed)}
                          >
                            {set.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                          </button>
                        </td>
                        <td>
                          <button
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            onClick={() => handleRemoveSet(exIndex, setIdx)}
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleAddSet(exIndex)}
                style={{ marginTop: '1rem', width: '100%' }}
              >
                <Plus size={16} /> Add Set
              </button>
            </div>
          );
        })
      )}

      {/* Floating Add Exercise Options */}
      {exercises.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', marginBottom: '3rem' }}>
          <button className="btn btn-emerald" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> Create & Add Exercise
          </button>
          {availableExercises.length > 0 && (
            <button className="btn btn-secondary" onClick={() => setShowAddModal(true)}>
              Choose Existing
            </button>
          )}
        </div>
      )}

      {/* Select Existing Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Select Exercise</h3>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {availableExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="glass-panel"
                  style={{
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between'
                  }}
                  onClick={() => handleSelectExistingExercise(exercise)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {exercise.image && (
                      <img src={exercise.image} alt={exercise.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{exercise.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {exercise.muscleGroup} • {exercise.equipment}
                      </div>
                    </div>
                  </div>
                  <Plus size={18} color="var(--accent-primary)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create New Exercise Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Log New Exercise</h3>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAndAddExercise}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Exercise Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Incline Dumbbell Press"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  required
                />
              </div>

              <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Target Muscle
                  </label>
                  <select className="input-field" value={newExMuscle} onChange={(e) => setNewExMuscle(e.target.value)}>
                    {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Equipment
                  </label>
                  <select className="input-field" value={newExEquipment} onChange={(e) => setNewExEquipment(e.target.value)}>
                    {EQUIPMENT_TYPES.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Exercise Photo (Optional)
                </label>
                {newExImage ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={newExImage} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setNewExImage(null)}>Remove Image</button>
                  </div>
                ) : (
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    <Camera size={16} /> Choose Photo
                    <input type="file" accept="image/*" onChange={handleExerciseImageUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-emerald">Create & Add to Session</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Rest Timer */}
      {showRestTimer && (
        <RestTimer initialSeconds={timerDuration} onClose={() => setShowRestTimer(false)} />
      )}
    </div>
  );
}
