import React, { useState } from 'react';
import { usePrep } from '../context/PrepContext';
import { Flag, ArrowRight } from 'lucide-react';

export default function SetupView() {
  const { saveSettings } = usePrep();
  const [days, setDays] = useState('30');

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedDays = parseInt(days, 10);
    if (!isNaN(parsedDays) && parsedDays > 0) {
      saveSettings(parsedDays);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div className="glass-panel animate-slide-up" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Flag size={32} color="white" />
        </div>
        
        <h1 className="heading-1 text-gradient" style={{ marginBottom: '0.5rem' }}>Exam Prep</h1>
        <p className="body-text" style={{ marginBottom: '2rem' }}>
          Welcome to your focused study journey. How many days until your exam?
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{
              display: 'block',
              textAlign: 'left',
              marginBottom: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem'
            }}>
              Days of Preparation
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="input-base"
              style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Get Started
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
