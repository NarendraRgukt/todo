import React, { useState } from 'react';
import { usePrep } from '../context/PrepContext';
import { Calendar, Plus, Trash2, Clock } from 'lucide-react';

export default function ScheduleView() {
  const { settings, subjects, schedule, assignTopicToDay, removeTopicFromDay } = usePrep();
  
  const [activeDay, setActiveDay] = useState(0); // 0 corresponds to Day 1
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [allocatedMins, setAllocatedMins] = useState('60');

  // Days array
  const days = Array.from({ length: settings.totalDays }, (_, i) => i);
  
  // Flat list of topics for dropdown
  const allTopics = subjects.flatMap(s => s.topics.map(t => ({ ...t, subjectName: s.name })));
  
  const daySchedule = schedule[activeDay] || [];

  const handleAssign = (e) => {
    e.preventDefault();
    if (selectedTopic) {
      assignTopicToDay(activeDay, selectedTopic, parseInt(allocatedMins, 10));
      setShowAddModal(false);
      setSelectedTopic('');
      setAllocatedMins('60');
    }
  };

  return (
    <div className="view-header animate-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 className="heading-1" style={{ marginBottom: '1.5rem' }}>Schedule Planner</h1>

      {/* Horizontal Day Selector */}
      <div style={{ 
        display: 'flex', 
        overflowX: 'auto', 
        gap: '0.75rem', 
        paddingBottom: '1rem',
        marginBottom: '1rem',
        // Hide scrollbar
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {days.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className="glass-panel"
            style={{
              padding: '0.75rem 1.5rem',
              minWidth: 'max-content',
              border: activeDay === day ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
              background: activeDay === day ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-glass)',
              color: activeDay === day ? 'var(--accent-secondary)' : 'var(--text-secondary)',
              fontWeight: activeDay === day ? 700 : 500
            }}
          >
            Day {day + 1}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="heading-2">Topics for Day {activeDay + 1}</h2>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
          <Plus size={20} /> Add
        </button>
      </div>

      {/* Scheduled Topics List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {daySchedule.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 1rem' }}>
            <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No topics scheduled for this day.</p>
          </div>
        ) : (
          daySchedule.map(task => {
            const topicDetails = allTopics.find(t => t.id === task.topicId);
            if (!topicDetails) return null;

            return (
              <div key={task.topicId} className="glass-panel" style={{ 
                padding: '1rem', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>{topicDetails.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {topicDetails.subjectName} • <Clock size={12} /> {task.allocatedMinutes}m
                  </p>
                </div>
                <button 
                  onClick={() => removeTopicFromDay(activeDay, task.topicId)}
                  className="btn" 
                  style={{ color: 'var(--danger)', padding: '0.5rem' }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for adding topic (simplified as inline overlay) */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'flex-end',
          padding: '1rem'
        }}>
          <div className="glass-panel animate-slide-up" style={{ 
            width: '100%', 
            padding: '1.5rem',
            background: 'var(--bg-primary)'
          }}>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Schedule Topic</h2>
            <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Select Topic</label>
                <select 
                  className="input-base" 
                  value={selectedTopic} 
                  onChange={(e) => {
                    setSelectedTopic(e.target.value);
                    const t = allTopics.find(x => x.id === e.target.value);
                    if (t) setAllocatedMins(t.estimatedMinutes || 60);
                  }}
                  required
                >
                  <option value="" disabled>Choose a topic...</option>
                  {allTopics.map(t => (
                    <option key={t.id} value={t.id}>{t.subjectName}: {t.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Allocated Minutes</label>
                <input 
                  type="number" 
                  className="input-base" 
                  value={allocatedMins} 
                  onChange={(e) => setAllocatedMins(e.target.value)}
                  min="5"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
