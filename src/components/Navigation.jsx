import React from 'react';
import { Dumbbell, LayoutDashboard, Play, ListPlus, BookOpen, BarChart3, Download, RotateCcw } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, activeWorkout, onExport, onReset }) {
  return (
    <>
      {/* Top Navbar */}
      <header className="navbar">
        <div className="nav-brand" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <Dumbbell size={20} color="#fff" />
          </div>
          <div>
            <span>OVERLOAD</span>
            <span style={{ color: 'var(--accent-emerald)', marginLeft: '4px', fontSize: '0.75rem', letterSpacing: '0.05em' }}>TRACK</span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="nav-links-desktop">
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

        {/* Right Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="badge badge-indigo">
            kg
          </span>
          <button className="btn btn-secondary btn-sm" onClick={onExport} title="Backup Data JSON">
            <Download size={14} />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onReset} title="Reset Data">
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* Sleek Mobile Bottom Navigation Dock */}
      <div className="mobile-bottom-dock">
        <div className="mobile-dock-items">
          <button
            className={`mobile-dock-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Home</span>
          </button>

          <button
            className={`mobile-dock-btn ${activeTab === 'logger' ? 'active' : ''}`}
            onClick={() => setActiveTab('logger')}
          >
            <Play size={20} />
            <span>Workout</span>
          </button>

          <button
            className={`mobile-dock-btn ${activeTab === 'routines' ? 'active' : ''}`}
            onClick={() => setActiveTab('routines')}
          >
            <ListPlus size={20} />
            <span>Routines</span>
          </button>

          <button
            className={`mobile-dock-btn ${activeTab === 'exercises' ? 'active' : ''}`}
            onClick={() => setActiveTab('exercises')}
          >
            <BookOpen size={20} />
            <span>Exercises</span>
          </button>

          <button
            className={`mobile-dock-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={20} />
            <span>Stats</span>
          </button>
        </div>
      </div>
    </>
  );
}
