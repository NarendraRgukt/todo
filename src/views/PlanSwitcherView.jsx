import React, { useState } from 'react';
import { usePrep } from '../context/PrepContext';
import { Layers, Plus, Trash2, ArrowRight, User, ArrowLeft } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

export default function PlanSwitcherView({ onBack }) {
  const { plans, activePlanId, switchPlan, createPlan, deletePlan, renameActivePlan } = usePrep();
  const [showCreate, setShowCreate] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDays, setNewPlanDays] = useState('100');
  const [deletePlanId, setDeletePlanId] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();
    if (newPlanName.trim()) {
      createPlan(newPlanName, parseInt(newPlanDays, 10));
      setShowCreate(false);
      setNewPlanName('');
    }
  };

  return (
    <div className="animate-slide-up" style={{ padding: '2rem 1.5rem', minHeight: '100vh' }}>
      <button 
        onClick={onBack}
        className="btn-secondary"
        style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: 'var(--radius-full)' }}
      >
        <ArrowLeft size={20} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem' }}>
        <div style={{ 
          background: 'var(--accent-gradient)', 
          padding: '0.75rem', 
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Layers color="white" size={24} />
        </div>
        <h1 className="heading-1">My Plans</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {plans.map(plan => (
          <div 
            key={plan.id} 
            onClick={() => switchPlan(plan.id)}
            className="glass-panel" 
            style={{ 
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderLeft: plan.id === activePlanId ? '4px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              background: plan.id === activePlanId ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-glass)'
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>{plan.name}</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {plan.settings.totalDays} Days • {plan.subjects.length} Subjects
              </p>
            </div>
            
            {plan.id !== activePlanId && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletePlanId(plan.id);
                }}
                className="btn-secondary"
                style={{ padding: '0.5rem', color: 'var(--error)' }}
              >
                <Trash2 size={20} />
              </button>
            )}
            
            {plan.id === activePlanId && (
              <div style={{ color: 'var(--accent-secondary)' }}>
                <ArrowRight size={20} />
              </div>
            )}
          </div>
        ))}

        {!showCreate ? (
          <button 
            onClick={() => setShowCreate(true)}
            className="btn btn-primary"
            style={{ marginTop: '1rem', justifyContent: 'center' }}
          >
            <Plus size={20} /> Add New Plan
          </button>
        ) : (
          <form onSubmit={handleCreate} className="glass-panel animate-scale-in" style={{ padding: '1.5rem', marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Create New Plan</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="body-text" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>
                  Exam / Plan Name
                </label>
                <input 
                  autoFocus
                  className="input-base"
                  placeholder="e.g. UPSC Prelims"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="body-text" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>
                  Preparation Days
                </label>
                <input 
                  type="number"
                  className="input-base"
                  value={newPlanDays}
                  onChange={(e) => setNewPlanDays(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCreate(false)} 
                  className="btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  Create Plan
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <ConfirmationModal 
        isOpen={!!deletePlanId}
        title="Delete Plan?"
        message="This will remove all subjects and history for this plan. This action cannot be undone."
        onConfirm={() => {
          deletePlan(deletePlanId);
          setDeletePlanId(null);
        }}
        onCancel={() => setDeletePlanId(null)}
        confirmText="Remove Plan"
      />
    </div>
  );
}
