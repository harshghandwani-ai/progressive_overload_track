import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, Plus, X, BellRing } from 'lucide-react';

export default function RestTimer({ initialSeconds = 90, onClose }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Optional audio beep
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (e) {
        // audio context fallback
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const percent = Math.max(0, Math.min(100, (timeLeft / initialSeconds) * 100));

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 150,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(16px)',
      border: `1px solid ${timeLeft === 0 ? 'var(--accent-emerald)' : 'var(--accent-primary)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '0.85rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: timeLeft === 0 ? '0 0 25px rgba(16, 185, 129, 0.5)' : '0 10px 30px rgba(0, 0, 0, 0.5)',
      animation: 'fadeIn 0.25s ease'
    }}>
      <div style={{ position: 'relative', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {timeLeft === 0 ? (
          <BellRing size={24} color="var(--accent-emerald)" className="pulse" />
        ) : (
          <Timer size={22} color="var(--accent-primary)" />
        )}
      </div>

      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {timeLeft === 0 ? 'REST COMPLETED!' : 'REST TIMER'}
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: timeLeft === 0 ? 'var(--accent-emerald)' : '#fff' }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => setIsRunning(!isRunning)}
          style={{ width: '32px', height: '32px', padding: 0 }}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => setTimeLeft(prev => prev + 30)}
          title="+30 Seconds"
          style={{ width: '32px', height: '32px', padding: 0 }}
        >
          <Plus size={14} />
        </button>

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onClose}
          style={{ width: '32px', height: '32px', padding: 0, opacity: 0.7 }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
