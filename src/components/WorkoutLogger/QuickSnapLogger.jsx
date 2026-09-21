import React, { useState } from 'react';
import { Camera, Sparkles, Send, Loader2, Image as ImageIcon, X, Check, Flame } from 'lucide-react';
import { convertFileToBase64 } from '../../utils/storage';
import { analyzeWorkoutInputWithAI } from '../../utils/aiLoggerService';

export default function QuickSnapLogger({ onLogExercise, onStartRestTimer, prefilledText }) {
  const [photo, setPhoto] = useState(null);
  const [textNote, setTextNote] = useState(prefilledText || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastLoggedMessage, setLastLoggedMessage] = useState('');

  // Update text input when prefilled text changes
  React.useEffect(() => {
    if (prefilledText) {
      setTextNote(prefilledText);
    }
  }, [prefilledText]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await convertFileToBase64(file);
        setPhoto(base64);
      } catch (err) {
        console.error('Photo upload error:', err);
      }
    }
  };

  const handleAnalyzeAndLog = async (e) => {
    e.preventDefault();
    if (!photo && !textNote.trim()) {
      alert('Please upload a photo or type exercise details in the text box.');
      return;
    }

    setIsAnalyzing(true);
    setLastLoggedMessage('');

    try {
      const result = await analyzeWorkoutInputWithAI(photo, textNote);
      
      onLogExercise({
        exerciseName: result.exerciseName,
        muscleGroup: result.muscleGroup,
        equipment: result.equipment,
        sets: result.sets,
        image: photo
      });

      setLastLoggedMessage(`Logged ${result.exerciseName} (${result.sets.length} sets)!`);
      
      if (onStartRestTimer) {
        onStartRestTimer();
      }

      setPhoto(null);
      setTextNote('');
    } catch (err) {
      console.error('Error logging exercise:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.35)', boxShadow: 'var(--shadow-glow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-emerald))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Quick AI Photo Logger</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Snap equipment/exercise photo + type reps (e.g. "80kg 8 reps"). AI handles the rest!
            </p>
          </div>
        </div>

        <span className="badge badge-emerald">
          <Flame size={12} /> Fast Log
        </span>
      </div>

      <form onSubmit={handleAnalyzeAndLog}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {/* Photo Thumbnail or Upload Button */}
          {photo ? (
            <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
              <img src={photo} alt="Exercise photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'rgba(0,0,0,0.75)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center'
                }}
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <label 
              style={{ 
                width: '90px', 
                height: '90px', 
                borderRadius: 'var(--radius-sm)', 
                border: '2px dashed var(--border-color)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justify: 'center', 
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <Camera size={24} color="var(--accent-primary)" style={{ marginBottom: '4px' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Snap Photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          )}

          {/* Single Text Box */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <textarea
              className="input-field"
              rows={3}
              placeholder='e.g., "Bench press 80kg 8 reps, 80kg 8 reps, 85kg 6 reps"'
              value={textNote}
              onChange={(e) => setTextNote(e.target.value)}
              style={{ resize: 'none', width: '100%', height: '90px', fontSize: '0.95rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {lastLoggedMessage ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={16} /> {lastLoggedMessage}
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Tip: Select an exercise from the Target HUD below to auto-fill today's target!
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-emerald" 
            disabled={isAnalyzing}
            style={{ minWidth: '160px' }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={16} className="spin" /> Analyzing AI...
              </>
            ) : (
              <>
                <Sparkles size={16} /> AI Log & Start Timer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
