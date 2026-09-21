import React, { useState } from 'react';
import { Sparkles, Trophy, History, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';
import { calculate1RM, getOverloadRecommendation, formatDate } from '../../utils/formulas';

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
          <span>Quick Stats HUD active. Log your first exercise above to unlock live target metrics & 1RM sparklines!</span>
        </div>
      </div>
    );
  }

  const activeEx = exercises.find(e => e.id === selectedExId) || exercises[0];

  // Get past history for this exercise
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

  // Calculate 1RM peak
  let peak1RM = 0;
  const sparklineData = [];
  pastSessions.forEach(s => {
    let maxSet1RM = 0;
    s.sets.forEach(set => {
      if (set.completed && set.weight && set.reps) {
        const oneRM = calculate1RM(set.weight, set.reps);
        if (oneRM > maxSet1RM) maxSet1RM = oneRM;
        if (oneRM > peak1RM) peak1RM = oneRM;
      }
    });
    if (maxSet1RM > 0) sparklineData.push(maxSet1RM);
  });

  // Latest set stats for Overload Target engine
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
      {/* Header & Quick Exercise Selector Chips */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={20} color="var(--accent-amber)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Quick Target & Past Performance HUD</h3>
        </div>

        {/* Horizontal Exercise Quick Selector Chips */}
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

      {/* Target & Last Session Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'stretch' }}>
        {/* Last Session Box */}
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

        {/* PR & Mini Sparkline Graph */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <Trophy size={14} color="var(--accent-amber)" /> Personal Record (1RM Peak)
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
              {peak1RM > 0 ? `${peak1RM} kg` : '-'}
            </div>
          </div>

          {/* SVG Micro Sparkline */}
          {sparklineData.length > 1 && (
            <div style={{ height: '32px', width: '100%', marginTop: '0.5rem' }}>
              <svg width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="none">
                <path
                  d={generateSparklinePath(sparklineData, 100, 32)}
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

// Generate smooth SVG path string for micro sparklines
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
