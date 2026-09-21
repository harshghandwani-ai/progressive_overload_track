import React, { useState } from 'react';
import { X, Dumbbell, Sparkles } from 'lucide-react';
import { calculatePlates } from '../../utils/plateCalculator';

export default function PlateCalculatorModal({ initialWeight = 80, onClose }) {
  const [targetWeight, setTargetWeight] = useState(initialWeight);
  const [barWeight, setBarWeight] = useState(20);

  const calc = calculatePlates(Number(targetWeight) || 20, Number(barWeight) || 20);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Dumbbell size={22} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Barbell Plate Calculator</h3>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Input Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Target Total Weight (kg)
            </label>
            <input
              type="number"
              step="2.5"
              className="input-field"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Bar Weight (kg)
            </label>
            <select className="input-field" value={barWeight} onChange={(e) => setBarWeight(Number(e.target.value))}>
              <option value={20}>20 kg (Standard Olympic Bar)</option>
              <option value={15}>15 kg (Women's Bar)</option>
              <option value={10}>10 kg (Technique Bar)</option>
            </select>
          </div>
        </div>

        {/* Per Side Breakdown Pill */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Weight Per Side: </span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)' }}>{calc.perSideWeight} kg</strong>
        </div>

        {/* Visual Barbell Graphic */}
        <div style={{ background: '#090d16', padding: '2rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '140px', overflowX: 'auto', marginBottom: '1.5rem' }}>
          {/* Bar Shaft */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '14px', background: '#94a3b8', borderRadius: '2px 0 0 2px' }}></div>
            {/* Bar Collar */}
            <div style={{ width: '12px', height: '36px', background: '#64748b', borderRadius: '2px' }}></div>

            {/* Loaded Plates */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', paddingLeft: '4px' }}>
              {calc.plates.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0 1rem' }}>No plates needed (empty bar)</div>
              ) : (
                calc.plates.map((p, idx) => {
                  const plateHeight = Math.max(40, p.weight * 3.5);
                  return (
                    <div
                      key={idx}
                      style={{
                        width: p.weight >= 10 ? '18px' : '12px',
                        height: `${plateHeight}px`,
                        backgroundColor: p.color,
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        color: p.color === '#f8fafc' ? '#000' : '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed'
                      }}
                      title={`${p.label} plate`}
                    >
                      {p.weight}
                    </div>
                  );
                })
              )}
            </div>

            {/* Sleeve end */}
            <div style={{ width: '80px', height: '18px', background: '#475569', borderRadius: '0 4px 4px 0' }}></div>
          </div>
        </div>

        {/* Plate Count Summary */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {calc.plates.length > 0 ? (
            calc.plates.map((p, i) => (
              <span key={i} className="badge" style={{ backgroundColor: `${p.color}25`, color: p.color === '#f8fafc' ? '#fff' : p.color, border: `1px solid ${p.color}` }}>
                1 × {p.label}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Just the empty bar ({barWeight}kg)</span>
          )}
        </div>
      </div>
    </div>
  );
}
