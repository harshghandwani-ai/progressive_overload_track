import React, { useState } from 'react';
import { 
  Trophy, Dumbbell, Activity, Calendar, Play, ChevronRight, 
  TrendingUp, Sparkles, Camera, Plus
} from 'lucide-react';
import { calculateVolume, calculate1RM, formatDate } from '../../utils/formulas';
import QuickSnapLogger from '../WorkoutLogger/QuickSnapLogger';
import ExerciseTargetHUD from '../WorkoutLogger/ExerciseTargetHUD';
import RestTimer from '../WorkoutLogger/RestTimer';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard({ 
  exercises,
  workoutHistory, 
  routines, 
  onStartWorkout, 
  onStartFromRoutine, 
  onSelectTab,
  onQuickLogExercise 
}) {
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [prefilledText, setPrefilledText] = useState('');

  const totalWorkouts = workoutHistory.length;

  let grandTotalVolume = 0;
  let topEst1RM = { exercise: 'None', val: 0 };

  workoutHistory.forEach(w => {
    w.exercises.forEach(ex => {
      const vol = calculateVolume(ex.sets);
      grandTotalVolume += vol;

      ex.sets.forEach(s => {
        if (s.completed && s.weight && s.reps) {
          const oneRM = calculate1RM(s.weight, s.reps);
          if (oneRM > topEst1RM.val) {
            topEst1RM = { exercise: ex.exerciseName, val: oneRM };
          }
        }
      });
    });
  });

  const sortedHistory = [...workoutHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chartLabels = sortedHistory.map(w => formatDate(w.date));
  const chartVolumes = sortedHistory.map(w => {
    let vol = 0;
    w.exercises.forEach(e => { vol += calculateVolume(e.sets); });
    return vol;
  });

  const chartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['Start Your Journey'],
    datasets: [
      {
        fill: true,
        label: 'Workout Volume (kg)',
        data: chartVolumes.length > 0 ? chartVolumes : [0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointRadius: 5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  const handleSelectTargetForLogging = (name, weight, reps) => {
    setPrefilledText(`${name} ${weight || 20}kg ${reps || 8} reps`);
  };

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Quick Snap AI Logger Card */}
      <QuickSnapLogger
        onLogExercise={onQuickLogExercise}
        onStartRestTimer={() => setShowRestTimer(true)}
        prefilledText={prefilledText}
      />

      {/* Target & Past Performance HUD */}
      <ExerciseTargetHUD
        exercises={exercises}
        workoutHistory={workoutHistory}
        onSelectTargetForLogging={handleSelectTargetForLogging}
      />

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.75rem 2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-30px', top: '-30px', opacity: 0.08 }}>
          <Dumbbell size={220} color="#fff" />
        </div>

        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 2 }}>
          <span className="badge badge-emerald" style={{ marginBottom: '0.6rem' }}>
            <Sparkles size={13} /> Progressive Overload Tracker • Image & AI Vision
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Instant Photo Logging & <span style={{ color: 'var(--accent-emerald)' }}>Live Target HUD.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
            Tap any exercise chip above to immediately view past session reps, 1RM sparkline curves, and your 25% overload target for today!
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-emerald" onClick={onStartWorkout}>
              <Play size={18} /> Full Workout Session
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div className="stat-value">{totalWorkouts}</div>
            <div className="stat-label">Workouts Logged</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value">{grandTotalVolume.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>kg</span></div>
            <div className="stat-label">Total Volume Lifted</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <Trophy size={24} />
          </div>
          <div>
            <div className="stat-value">{topEst1RM.val > 0 ? `${topEst1RM.val} kg` : '-'}</div>
            <div className="stat-label">Peak Est 1RM ({topEst1RM.val > 0 ? topEst1RM.exercise : 'Log to reveal'})</div>
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', height: '340px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--accent-emerald)" /> Volume Progression Curve
          </h3>
          <span className="badge badge-emerald">Evolving Metrics</span>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Workout History */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--accent-primary)" /> Workout History & Photos
          </h3>
        </div>

        {workoutHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
            <Camera size={36} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
            <p style={{ fontWeight: 600, fontSize: '1rem', color: '#fff', marginBottom: '0.25rem' }}>Your workout feed is empty</p>
            <p style={{ fontSize: '0.85rem' }}>Use the quick photo box above to log your first exercise set!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedHistory.reverse().map((w) => {
              const workoutVol = calculateVolume(w.exercises.flatMap(e => e.sets));
              return (
                <div key={w.id} className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.4)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {w.image && (
                        <img 
                          src={w.image} 
                          alt="Workout session" 
                          style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                        />
                      )}
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{w.name}</h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {formatDate(w.date)} • {w.durationMinutes || 45} mins • Volume: <strong style={{ color: 'var(--accent-emerald)' }}>{workoutVol} kg</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
                    {w.exercises.map((ex, idx) => (
                      <span key={idx} className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        {ex.image && <img src={ex.image} alt="" style={{ width: '16px', height: '16px', borderRadius: '2px', objectFit: 'cover' }} />}
                        {ex.exerciseName}: {ex.sets.filter(s => s.completed).map(s => `${s.weight || 0}k×${s.reps || 0}`).join(', ')}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Rest Timer */}
      {showRestTimer && (
        <RestTimer initialSeconds={90} onClose={() => setShowRestTimer(false)} />
      )}
    </div>
  );
}
