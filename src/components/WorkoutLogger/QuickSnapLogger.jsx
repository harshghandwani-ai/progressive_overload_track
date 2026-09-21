import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, Loader2, X, Check, Flame, Mic, MicOff, Calculator } from 'lucide-react';
import confetti from 'canvas-confetti';
import { convertFileToBase64 } from '../../utils/storage';
import { analyzeWorkoutInputWithAI } from '../../utils/aiLoggerService';

export default function QuickSnapLogger({ 
  onLogExercise, 
  onStartRestTimer, 
  prefilledText,
  onOpenPlateCalculator 
}) {
  const [photo, setPhoto] = useState(null);
  const [textNote, setTextNote] = useState(prefilledText || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastLoggedMessage, setLastLoggedMessage] = useState('');

  useEffect(() => {
    if (prefilledText) {
      setTextNote(prefilledText);
    }
  }, [prefilledText]);

  // Web Speech API Voice Recognition
  const toggleVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge!');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTextNote(prev => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

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

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // fallback if canvas-confetti unavailable
    }
  };

  const handleAnalyzeAndLog = async (e) => {
    e.preventDefault();
    if (!photo && !textNote.trim()) {
      alert('Please upload a photo, record speech, or type exercise details.');
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

      triggerConfetti();

      setLastLoggedMessage(`🔥 Overload Logged! ${result.exerciseName} (${result.sets.length} sets)`);
      
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
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Quick AI Photo & Voice Logger</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Snap photo or tap mic to speak your set (e.g. "Bench press 80kg 8 reps").
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onOpenPlateCalculator && (
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={onOpenPlateCalculator}
              title="Barbell Plate Calculator"
            >
              <Calculator size={15} /> Plate Calc
            </button>
          )}
          <span className="badge badge-emerald">
            <Flame size={12} /> Fast Log
          </span>
        </div>
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

          {/* Text Area + Voice Mic Button Overlay */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <textarea
              className="input-field"
              rows={3}
              placeholder='Type or tap microphone to speak: "Bench press 80kg 8 reps"'
              value={textNote}
              onChange={(e) => setTextNote(e.target.value)}
              style={{ resize: 'none', width: '100%', height: '90px', fontSize: '0.95rem', paddingRight: '45px' }}
            />

            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              style={{
                position: 'absolute',
                right: '10px',
                bottom: '12px',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: isListening ? 'var(--accent-rose)' : 'rgba(99, 102, 241, 0.2)',
                border: `1px solid ${isListening ? 'var(--accent-rose)' : 'var(--accent-primary)'}`,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isListening ? '0 0 12px var(--accent-rose)' : 'none'
              }}
              title={isListening ? 'Stop Listening' : 'Speak Workout Input'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {lastLoggedMessage ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={16} /> {lastLoggedMessage}
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isListening ? '🎙️ Listening... Speak your exercise, weight, and reps now!' : 'Tap mic icon to dictate workout hands-free.'}
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
