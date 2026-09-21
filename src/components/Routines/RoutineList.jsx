import React, { useState } from 'react';
import { Plus, Play, Dumbbell, Trash2, X, Sparkles } from 'lucide-react';

export default function RoutineList({ 
  routines, 
  availableExercises, 
  onStartFromRoutine, 
  onCreateRoutine, 
  onDeleteRoutine 
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [routineDesc, setRoutineDesc] = useState('');
  const [selectedExIds, setSelectedExIds] = useState([]);

  const toggleExerciseSelection = (id) => {
    if (selectedExIds.includes(id)) {
      setSelectedExIds(selectedExIds.filter(i => i !== id));
    } else {
      setSelectedExIds([...selectedExIds, id]);
    }
  };

  const handleSaveRoutine = (e) => {
    e.preventDefault();
    if (!routineName.trim()) {
      alert('Please enter a routine name.');
      return;
    }
    if (selectedExIds.length === 0) {
      alert('Please select at least one exercise for the routine.');
      return;
    }

    const newRoutine = {
      id: `routine-${Date.now()}`,
      name: routineName,
      description: routineDesc || 'Custom routine split',
      muscleGroups: [...new Set(availableExercises.filter(e => selectedExIds.includes(e.id)).map(e => e.muscleGroup))],
      exerciseIds: selectedExIds,
      targetSets: selectedExIds.map(() => 3)
    };

    onCreateRoutine(newRoutine);
    setShowCreateModal(false);
    setRoutineName('');
    setRoutineDesc('');
    setSelectedExIds([]);
  };

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Workout Routines</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Structured splits designed for linear & double progressive overload progression.
          </p>
        </div>

        <button className="btn btn-emerald" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Create Custom Routine
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {routines.map((r) => {
          const routineExercises = availableExercises.filter(e => r.exerciseIds.includes(e.id));
          return (
            <div key={r.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{r.name}</h3>
                  {r.id.startsWith('routine-') && !['routine-push', 'routine-pull', 'routine-legs'].includes(r.id) && (
                    <button 
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
                      onClick={() => onDeleteRoutine(r.id)}
                      title="Delete routine"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', minHeight: '38px' }}>
                  {r.description}
                </p>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {r.muscleGroups.map((mg, i) => (
                    <span key={i} className="badge badge-indigo">{mg}</span>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Exercises Included ({routineExercises.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {routineExercises.map((ex) => (
                      <div key={ex.id} style={{ fontSize: '0.85rem', color: varTextColor(ex.id), display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Dumbbell size={14} color="var(--accent-primary)" />
                        <span>{ex.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button className="btn btn-primary" onClick={() => onStartFromRoutine(r)} style={{ width: '100%' }}>
                <Play size={16} /> Start Routine Workout
              </button>
            </div>
          );
        })}
      </div>

      {/* Create Routine Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create New Routine</h3>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRoutine}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Routine Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Upper Body Power"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Description
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Heavy compound lifts focusing on strength"
                  value={routineDesc}
                  onChange={(e) => setRoutineDesc(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Select Exercises
                </label>
                <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
                  {availableExercises.map((ex) => {
                    const isSelected = selectedExIds.includes(ex.id);
                    return (
                      <div
                        key={ex.id}
                        onClick={() => toggleExerciseSelection(ex.id)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                          border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'transparent'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'space-between',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div>
                          <strong>{ex.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({ex.muscleGroup})</span>
                        </div>
                        {isSelected && <Sparkles size={14} color="var(--accent-primary)" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-emerald">Save Routine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function varTextColor(id) {
  return '#f8fafc';
}
