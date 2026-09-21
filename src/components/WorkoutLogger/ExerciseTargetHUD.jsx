import React, { useState } from 'react';
import { Sparkles, Trophy, History, Zap, Target } from 'lucide-react';
import { getMaxWeight, getMaxReps, getOverloadRecommendation, formatDate } from '../../utils/formulas';

export default function ExerciseTargetHUD({ 
  exercises, 
  workoutHistory, 
  onSelectTargetForLogging 
}) {
  const [selectedExId, setSelectedExId] = useState(exercises[0]?.id || null);

  if (exercises.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Target size={16} color="var(--accent-primary)" />
          <span>Quick Target HUD active. Log your first set above to unlock performance targets!</span>
        </div>
      </div>
    );
  }

  const activeEx = exercises.find(e => e.id === selectedExId) || exercises[0];

  const pastSessions = [];
  workoutHistory.forEach(w => {
    const exMatch = w.exercises.find(e => e.exerciseId === activeEx.id);
    if (exMatch) {
      pastSessions.push({
        date: w.date,
        sets: exMatch.sets
      });
    }
  });

  // Calculate Heaviest Weight & Best Reps
  let heaviestWeight = 0;
  let maxRepsHit = 0;
  const weightTrendData = [];

  pastSessions.forEach(s => {
    const sessionMaxW = getMaxWeight(s.sets);
    const sessionMaxR = getMaxReps(s.sets);

    if (sessionMaxW > heaviestWeight) heaviestWeight = sessionMaxW;
    if (sessionMaxR > maxRepsHit) maxRepsHit = sessionMaxR;
    if (sessionMaxW > 0) weightTrendData.push(sessionMaxW);
  });

  const lastSession = pastSessions[0];
  const lastWeight = lastSession?.sets[0]?.weight || 0;
  const lastReps = lastSession?.sets[0]?.reps || 0;
  
  const overloadRec = getOverloadRecommendation(pastSessions, lastWeight, lastReps);

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '1.25rem 1.5rem', 
        marginBottom: '1.75rem', 
        border: '1px solid rgba(16, 185, 129, 0.3)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(16, 185, 129, 0.05))',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={20} color="var(--accent-amber)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Quick Target & Past Performance HUD</h3>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', maxWidth: '100%', paddingBottom: '0.25rem' }}>
          {exercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelectedExId(ex.id)}
              className={`badge ${selectedExId === ex.id || (!selectedExId && ex.id === activeEx.id) ? 'badge-emerald' : 'badge-indigo'}`}
              style={{
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'stretch' }}>
        {/* Last Session */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <History size={14} color="var(--accent-primary)" /> Last Session Performance
          </div>

          {lastSession ? (
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                {lastSession.sets.map(s => `${s.weight}kg × ${s.reps}`).join(', ')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Recorded on {formatDate(lastSession.date)}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No previous logs for this exercise yet.</div>
          )}
        </div>

        {/* Target Overload Box */}
        <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <Target size={14} /> Recommended Overload Target (+25% Rep Rule)
            </div>
            <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, lineHeight: '1.3' }}>
              {overloadRec.message}
            </div>
          </div>

          <button
            className="btn btn-emerald btn-sm"
            style={{ marginTop: '0.75rem', alignSelf: 'flex-start', fontSize: '0.775rem' }}
            onClick={() => onSelectTargetForLogging && onSelectTargetForLogging(activeEx.name, overloadRec.recommendedWeight, overloadRec.recommendedReps)}
          >
            <Sparkles size={13} /> Auto-Fill Prompt with Target
          </button>
        </div>

        {/* Heaviest Weight Record */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <Trophy size={14} color="var(--accent-amber)" /> Heaviest Weight Lifted
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
              {heaviestWeight > 0 ? `${heaviestWeight} kg` : '-'}
            </div>
          </div>

          {weightTrendData.length > 1 && (
            <div style={{ height: '32px', width: '100%', marginTop: '0.5rem' }}>
              <svg width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="none">
                <path
                  d={generateSparklinePath(weightTrendData, 100, 32)}
                  fill="none"
                  stroke="var(--accent-emerald)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateSparklinePath(data, width, height) {
  if (data.length < 2) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
}
