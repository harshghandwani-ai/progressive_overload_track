import React, { useState } from 'react';
import { Trophy, TrendingUp, PieChart, Sparkles, Award, Dumbbell } from 'lucide-react';
import { calculate1RM, calculateVolume, formatDate } from '../../utils/formulas';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsOverview({ exercises, workoutHistory }) {
  const [selectedExerciseId, setSelectedExerciseId] = useState('bench-press');

  // Compute 1RM trend for selected exercise over time
  const sortedHistory = [...workoutHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const labels1RM = [];
  const values1RM = [];

  sortedHistory.forEach(w => {
    const exMatch = w.exercises.find(e => e.exerciseId === selectedExerciseId);
    if (exMatch) {
      let maxSet1RM = 0;
      exMatch.sets.forEach(s => {
        if (s.completed && s.weight && s.reps) {
          const val = calculate1RM(s.weight, s.reps);
          if (val > maxSet1RM) maxSet1RM = val;
        }
      });
      if (maxSet1RM > 0) {
        labels1RM.push(formatDate(w.date));
        values1RM.push(maxSet1RM);
      }
    }
  });

  const lineData = {
    labels: labels1RM.length > 0 ? labels1RM : ['No Data'],
    datasets: [
      {
        label: 'Est. 1RM (kg)',
        data: values1RM.length > 0 ? values1RM : [0],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.3,
        pointBackgroundColor: '#6366f1',
        pointRadius: 6
      }
    ]
  };

  // Compute Volume by Muscle Group
  const muscleVolumeMap = {};
  workoutHistory.forEach(w => {
    w.exercises.forEach(ex => {
      const parentEx = exercises.find(e => e.id === ex.exerciseId);
      const mg = parentEx?.muscleGroup || 'Other';
      const vol = calculateVolume(ex.sets);
      muscleVolumeMap[mg] = (muscleVolumeMap[mg] || 0) + vol;
    });
  });

  const doughnutData = {
    labels: Object.keys(muscleVolumeMap).length > 0 ? Object.keys(muscleVolumeMap) : ['None'],
    datasets: [
      {
        data: Object.values(muscleVolumeMap).length > 0 ? Object.values(muscleVolumeMap) : [1],
        backgroundColor: [
          '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6'
        ],
        borderWidth: 0
      }
    ]
  };

  // PR Leaderboard
  const prLeaderboard = exercises.map(ex => {
    let top1RM = 0;
    workoutHistory.forEach(w => {
      w.exercises.forEach(logged => {
        if (logged.exerciseId === ex.id) {
          logged.sets.forEach(s => {
            if (s.completed) {
              const val = calculate1RM(s.weight, s.reps);
              if (val > top1RM) top1RM = val;
            }
          });
        }
      });
    });
    return { exercise: ex.name, muscle: ex.muscleGroup, pr: top1RM };
  }).filter(item => item.pr > 0).sort((a, b) => b.pr - a.pr);

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Analytics & Strength Metrics</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Analyze One-Rep Max growth curves, volume distributions, and personal records.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* 1RM Trend Line Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--accent-primary)" /> 1RM Progression Curve
            </h3>

            <select
              className="input-field"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.825rem' }}
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
            >
              {exercises.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            <Line 
              data={lineData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
              }} 
            />
          </div>
        </div>

        {/* Muscle Volume Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '360px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={18} color="var(--accent-emerald)" /> Volume Share by Muscle Group
            </h3>
          </div>

          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut 
              data={doughnutData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* PR Leaderboard */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={20} color="var(--accent-amber)" /> Personal Record (PR) Hall of Fame
          </h3>
          <span className="badge badge-amber">
            <Award size={13} /> Peak 1RMs
          </span>
        </div>

        {prLeaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
            Complete workouts to populate your PR leaderboard.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {prLeaderboard.map((item, idx) => (
              <div 
                key={idx} 
                className="glass-panel" 
                style={{ 
                  padding: '1rem 1.25rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify: 'space-between',
                  background: 'rgba(255,255,255,0.02)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{item.exercise}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.muscle}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                    {item.pr} kg
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est 1RM</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
