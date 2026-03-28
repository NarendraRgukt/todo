import React, { useState, useEffect } from 'react';
import { usePrep } from '../context/PrepContext';
import { X, Play, Pause, Check, Timer, Watch } from 'lucide-react';

export default function TimerView({ topic, onClose }) {
  const { markTopicComplete } = usePrep();
  
  // Modes: 'timer' (countdown) or 'stopwatch' (count up)
  const [mode, setMode] = useState('timer');
  
  // Timer state
  const totalSeconds = topic.allocatedMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (mode === 'timer') {
          if (timeLeft > 0) {
            setTimeLeft(t => t - 1);
          } else {
            setIsActive(false);
          }
        } else {
          setStopwatchSeconds(s => s + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const progressPercent = mode === 'timer' 
    ? ((totalSeconds - timeLeft) / totalSeconds) * 100 
    : (stopwatchSeconds % 60 / 60) * 100;

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    markTopicComplete(topic.topicId);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--bg-primary)',
      zIndex: 5000,
      display: 'flex',
      flexDirection: 'column',
      padding: 'env(safe-area-inset-top) 1.5rem 2rem 1.5rem'
    }} className="animate-slide-up">
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
        <div className="glass-panel" style={{ display: 'flex', borderRadius: 'var(--radius-full)', padding: '4px' }}>
          <button 
            onClick={() => { setMode('timer'); setIsActive(false); }}
            style={{
              background: mode === 'timer' ? 'var(--accent-primary)' : 'transparent',
              border: 'none', color: 'white', padding: '6px 12px', borderRadius: 'var(--radius-full)',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <Timer size={14} /> Timer
          </button>
          <button 
            onClick={() => { setMode('stopwatch'); setIsActive(false); }}
            style={{
              background: mode === 'stopwatch' ? 'var(--accent-primary)' : 'transparent',
              border: 'none', color: 'white', padding: '6px 12px', borderRadius: 'var(--radius-full)',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <Watch size={14} /> Stopwatch
          </button>
        </div>
        <button onClick={onClose} className="btn" style={{ 
          background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)'
        }}>
          <X size={24} />
        </button>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <span style={{ color: 'var(--accent-secondary)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
          {topic.subjectName}
        </span>
        <h1 className="heading-1" style={{ marginTop: '0.5rem', marginBottom: '1rem', fontSize: '1.75rem' }}>
          {topic.name}
        </h1>
      </div>

      {/* Timer Circle */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg style={{ width: '280px', height: '280px' }}>
          <circle cx="140" cy="140" r="130" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle cx="140" cy="140" r="130" fill="none" stroke="url(#timerGrad)" strokeWidth="8" 
            strokeDasharray="816" 
            strokeDashoffset={816 - (816 * progressPercent) / 100}
            strokeLinecap="round" 
            style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-secondary)" />
              <stop offset="100%" stopColor="var(--accent-primary)" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: '4.5rem', fontWeight: 800, fontFamily: 'monospace', lineHeight: 1 }}>
            {mode === 'timer' ? formatTime(timeLeft) : formatTime(stopwatchSeconds)}
          </div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
            {mode === 'timer' ? 'Remaining' : 'Elapsed'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <button onClick={toggleTimer} className="btn" style={{ 
            width: '72px', height: '72px', 
            borderRadius: '50%', 
            background: isActive ? 'var(--bg-secondary)' : 'var(--accent-gradient)',
            color: 'white',
            boxShadow: isActive ? 'none' : 'var(--shadow-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {isActive ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: '4px' }} />}
          </button>
          
          <button onClick={handleComplete} className="btn" style={{ 
            width: '72px', height: '72px', 
            borderRadius: '50%', 
            background: 'var(--success)',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
          }}>
            <Check size={32} />
          </button>
        </div>
        
        <p className="body-text" style={{ fontSize: '0.875rem', maxWidth: '80%', textAlign: 'center' }}>
          {mode === 'timer' 
            ? `Target: ${topic.allocatedMinutes} mins` 
            : 'Counting up until you complete the topic.'}
        </p>
      </div>

    </div>
  );
}
