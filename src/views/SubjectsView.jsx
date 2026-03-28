import React, { useState } from 'react';
import { usePrep } from '../context/PrepContext';
import { Plus, BookOpen, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

export default function SubjectsView() {
  const { subjects, addSubject, addTopic, deleteSubject, deleteTopic } = usePrep();
  
  const [newSubject, setNewSubject] = useState('');
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  
  // Topic Form State
  const [newTopic, setNewTopic] = useState('');
  const [topicMins, setTopicMins] = useState('60');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (newSubject.trim()) {
      addSubject(newSubject.trim());
      setNewSubject('');
    }
  };

  const handleAddTopic = (e, subjectId) => {
    e.preventDefault();
    if (newTopic.trim()) {
      addTopic(subjectId, newTopic.trim(), parseInt(topicMins, 10));
      setNewTopic('');
      setTopicMins('60');
    }
  };

  const handleDeleteSubject = (e, subjectId) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Delete Subject',
      message: 'Are you sure you want to delete this subject and all its topics? This action cannot be undone.',
      type: 'danger',
      onConfirm: () => {
        deleteSubject(subjectId);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteTopic = (subjectId, topicId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Topic',
      message: 'Are you sure you want to delete this topic from your study plan?',
      type: 'danger',
      onConfirm: () => {
        deleteTopic(subjectId, topicId);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="view-header animate-slide-up">
      <h1 className="heading-1" style={{ marginBottom: '1.5rem' }}>Subjects & Topics</h1>

      {/* Add Subject Form */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem' }}>
        <form onSubmit={handleAddSubject} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="input-base"
            placeholder="New Subject Name..."
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            style={{ flex: 1, padding: '0.75rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <Plus size={24} />
          </button>
        </form>
      </div>

      {/* Subjects List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
        {subjects.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
            <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No subjects added yet.<br/>Add one to started structuring your prep!</p>
          </div>
        ) : (
          subjects.map(subject => {
            const isExpanded = activeSubjectId === subject.id;
            
            return (
              <div key={subject.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                <div 
                  onClick={() => setActiveSubjectId(isExpanded ? null : subject.id)}
                  style={{ 
                    padding: '1.25rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen size={20} color="var(--accent-secondary)" />
                    <h3 style={{ margin: 0, fontWeight: 600 }}>{subject.name}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                      onClick={(e) => handleDeleteSubject(e, subject.id)}
                      className="btn"
                      style={{ color: 'var(--danger)', padding: '0.25rem', opacity: 0.6 }}
                    >
                      <Trash2 size={18} />
                    </button>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {subject.topics.length}
                    </span>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    
                    {/* Topic List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {subject.topics.map(topic => (
                        <div key={topic.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem',
                          background: 'rgba(0,0,0,0.2)',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{topic.name}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                              <Clock size={12} /> {topic.estimatedMinutes}m
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDeleteTopic(subject.id, topic.id)}
                            className="btn"
                            style={{ color: 'var(--danger)', opacity: 0.5, padding: '0.25rem' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {subject.topics.length === 0 && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', margin: '1rem 0' }}>
                          No topics added to this subject yet.
                        </p>
                      )}
                    </div>

                    {/* Add Topic Form */}
                    <form onSubmit={(e) => handleAddTopic(e, subject.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <input
                        type="text"
                        className="input-base"
                        placeholder="New Topic Name..."
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        style={{ padding: '0.75rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <input
                            type="number"
                            className="input-base"
                            placeholder="Mins"
                            value={topicMins}
                            onChange={(e) => setTopicMins(e.target.value)}
                            style={{ padding: '0.75rem', paddingRight: '2.5rem' }}
                          />
                          <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            m
                          </span>
                        </div>
                        <button type="submit" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
                          Add
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
