import React, { useState } from 'react';
import { Search, Plus, Dumbbell, Trophy, X, Filter } from 'lucide-react';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '../../data/defaultExercises';
import { calculate1RM, formatDate } from '../../utils/formulas';

export default function ExerciseList({ 
  exercises, 
  workoutHistory, 
  onAddExercise 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState(null);

  // Form states for new exercise
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState(MUSCLE_GROUPS[0]);
  const [equipment, setEquipment] = useState(EQUIPMENT_TYPES[0]);
  const [notes, setNotes] = useState('');

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const handleCreateExercise = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newEx = {
      id: `custom-${Date.now()}`,
      name,
      muscleGroup,
      equipment,
      notes: notes || 'Custom user created exercise.',
      isCustom: true
    };

    onAddExercise(newEx);
    setShowAddModal(false);
    setName('');
    setNotes('');
  };

  // Helper to compute max 1RM for exercise
  const getExercisePR = (exerciseId) => {
    let pr = 0;
    workoutHistory.forEach(w => {
      w.exercises.forEach(ex => {
        if (ex.exerciseId === exerciseId) {
          ex.sets.forEach(s => {
            if (s.completed && s.weight && s.reps) {
              const val = calculate1RM(s.weight, s.reps);
              if (val > pr) pr = val;
            }
          });
        }
      });
    });
    return pr;
  };

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Exercise Library</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Browse movement database or record custom exercises with target tracking.
          </p>
        </div>

        <button className="btn btn-emerald" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Custom Exercise
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Search Field */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search exercise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          {/* Muscle Filter */}
          <div>
            <select
              className="input-field"
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
            >
              <option value="All">All Muscle Groups</option>
              {MUSCLE_GROUPS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Equipment Filter */}
          <div>
            <select
              className="input-field"
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
            >
              <option value="All">All Equipment Types</option>
              {EQUIPMENT_TYPES.map(eq => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exercises Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {filtered.map((ex) => {
          const pr = getExercisePR(ex.id);
          return (
            <div 
              key={ex.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
              onClick={() => setSelectedExerciseDetail(ex)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{ex.name}</h3>
                  {ex.isCustom && <span className="badge badge-indigo">Custom</span>}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-emerald">{ex.muscleGroup}</span>
                  <span className="badge badge-amber">{ex.equipment}</span>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {ex.notes}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Est. 1RM Peak</span>
                <span style={{ fontWeight: 700, color: pr > 0 ? 'var(--accent-amber)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Trophy size={14} /> {pr > 0 ? `${pr} kg` : 'No logs yet'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Exercise Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add Custom Exercise</h3>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateExercise}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Exercise Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Incline Cable Flyes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Muscle Group
                  </label>
                  <select className="input-field" value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)}>
                    {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Equipment
                  </label>
                  <select className="input-field" value={equipment} onChange={(e) => setEquipment(e.target.value)}>
                    {EQUIPMENT_TYPES.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Technique Notes / Cues
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Squeeze chest at peak contraction"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-emerald">Save Exercise</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exercise Details & History Modal */}
      {selectedExerciseDetail && (
        <div className="modal-overlay" onClick={() => setSelectedExerciseDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{selectedExerciseDetail.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {selectedExerciseDetail.muscleGroup} • {selectedExerciseDetail.equipment}
                </div>
              </div>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setSelectedExerciseDetail(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="overload-box" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Estimated 1RM Personal Record</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                  {getExercisePR(selectedExerciseDetail.id)} kg
                </span>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Past Performance Log</h4>
            <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {workoutHistory.filter(w => w.exercises.some(e => e.exerciseId === selectedExerciseDetail.id)).length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No completed logs for this exercise yet.</div>
              ) : (
                workoutHistory.filter(w => w.exercises.some(e => e.exerciseId === selectedExerciseDetail.id)).map(w => {
                  const exData = w.exercises.find(e => e.exerciseId === selectedExerciseDetail.id);
                  return (
                    <div key={w.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        {formatDate(w.date)} — {w.name}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>
                        Sets: {exData.sets.map(s => `${s.weight}kg × ${s.reps}`).join(' | ')}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
