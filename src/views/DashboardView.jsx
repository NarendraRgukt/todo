import React from 'react';
import { usePrep, getTodayStr } from '../context/PrepContext';
import { Flame, PlayCircle, CalendarCheck, CheckCircle, Layers } from 'lucide-react';

export default function DashboardView({ onStartTimer, onSwitchPlan }) {
  const { settings, currentStreak, schedule, subjects, history, completedDays, resetData, activePlan } = usePrep();

  // Calculate days remaining
  const start = new Date(settings.startDate);
  const now = new Date();
  const diffDays = Math.floor(Math.abs(now - start) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, settings.totalDays - diffDays);
  const progressPercent = Math.min(100, (diffDays / settings.totalDays) * 100);

  // Today's schedule
  const todayTasks = schedule[diffDays] || [];
  
  // Find topics details
  const getTopicDetails = (topicId) => {
    for (const sub of subjects) {
      const topic = sub.topics.find(t => t.id === topicId);
      if (topic) return { ...topic, subjectName: sub.name };
    }
    return null;
  };

  const isTodayCompleted = completedDays[getTodayStr()];

  return (
    <div className="view-header animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="heading-1">{activePlan.name}</h1>
          <p className="body-text">Day {Math.min(diffDays + 1, settings.totalDays)} of {settings.totalDays}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={onSwitchPlan}
            className="btn-secondary"
            style={{ padding: '0.6rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-secondary)' }}
          >
            <Layers size={20} />
          </button>
          <div className="glass-panel" style={{ 
          padding: '0.5rem 1rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          borderRadius: 'var(--radius-full)',
          background: currentStreak > 0 ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-glass)'
        }}>
          <Flame size={24} color={currentStreak > 0 ? 'var(--warning)' : 'var(--text-secondary)'} />
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: currentStreak > 0 ? 'var(--warning)' : 'var(--text-secondary)' }}>
            {currentStreak}
          </span>
        </div>
        </div>
      </div>

      {/* Progress Ring Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ 
          position: 'relative', 
          width: '180px', 
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          {/* Background circle */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            <circle cx="90" cy="90" r="80" fill="none" stroke="url(#gradient)" strokeWidth="12" 
              strokeDasharray="502" 
              strokeDashoffset={502 - (502 * progressPercent) / 100}
              strokeLinecap="round" 
              style={{ transition: 'stroke-dashoffset 1s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="var(--accent-secondary)" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{daysLeft}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Days Left</p>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="heading-2">Today's Focus</h2>
          {isTodayCompleted && (
            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: 600 }}>
              <CheckCircle size={16} /> All completed
            </span>
          )}
        </div>

        {todayTasks.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <CalendarCheck size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Nothing scheduled for today.<br/>Go to Schedule to plan your day!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {todayTasks.map(task => {
              const details = getTopicDetails(task.topicId);
              if (!details) return null;
              
              const isCompleted = !!history[task.topicId];

              return (
                <div key={task.topicId} className="glass-panel" style={{ 
                  padding: '1rem', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: isCompleted ? 0.6 : 1,
                  borderLeft: isCompleted ? '4px solid var(--success)' : '4px solid var(--accent-primary)'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontWeight: 600, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      {details.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {details.subjectName} • {task.allocatedMinutes} mins
                    </p>
                  </div>
                  
                  {!isCompleted ? (
                    <button 
                      onClick={() => onStartTimer({ ...task, ...details })}
                      className="btn" 
                      style={{ 
                        background: 'rgba(139, 92, 246, 0.1)', 
                        color: 'var(--accent-secondary)', 
                        padding: '0.75rem', 
                        borderRadius: 'var(--radius-full)' 
                      }}
                    >
                      <PlayCircle size={28} />
                    </button>
                  ) : (
                    <div style={{ color: 'var(--success)' }}>
                      <CheckCircle size={28} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <button 
          onClick={() => {
            if (window.confirm("This will clear all your progress and subjects. Are you sure?")) {
              resetData();
            }
          }}
          className="btn-secondary" 
          style={{ fontSize: '0.875rem', color: 'var(--error)', opacity: 0.6 }}
        >
          Reset Application Data
        </button>
      </div>
    </div>
  );
}
