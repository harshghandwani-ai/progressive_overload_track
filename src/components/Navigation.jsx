import React from 'react';
import { Dumbbell, LayoutDashboard, Play, ListPlus, BookOpen, BarChart3, RotateCcw, Download } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, activeWorkout, onStartWorkout, onExport, onReset }) {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
        <div className="brand-icon">
          <Dumbbell size={22} color="#fff" />
        </div>
        <div>
          <span>OVERLOAD</span>
          <span style={{ color: 'var(--accent-emerald)', marginLeft: '4px', fontSize: '0.8rem', letterSpacing: '0.05em' }}>TRACK</span>
        </div>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-link ${activeTab === 'logger' ? 'active' : ''}`}
          onClick={() => setActiveTab('logger')}
        >
          <Play size={18} />
          <span>Workout</span>
          {activeWorkout && (
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-emerald)',
              boxShadow: '0 0 8px var(--accent-emerald)'
            }}></span>
          )}
        </button>

        <button
          className={`nav-link ${activeTab === 'routines' ? 'active' : ''}`}
          onClick={() => setActiveTab('routines')}
        >
          <ListPlus size={18} />
          <span>Routines</span>
        </button>

        <button
          className={`nav-link ${activeTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercises')}
        >
          <BookOpen size={18} />
          <span>Exercises</span>
        </button>

        <button
          className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={18} />
          <span>Analytics</span>
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="badge badge-indigo">
          Unit: <strong>kg</strong>
        </span>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onExport} 
          title="Backup Data JSON"
        >
          <Download size={15} />
        </button>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onReset} 
          title="Reset to Demo Seed Data"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </header>
  );
}
