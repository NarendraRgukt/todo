import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', type = 'danger' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onCancel}>
      <div 
        className="glass-panel animate-zoom-in" 
        style={{ 
          width: '100%', 
          maxWidth: '400px', 
          padding: '1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center' 
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            backgroundColor: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <AlertTriangle size={24} color={type === 'danger' ? 'var(--danger)' : 'var(--warning)'} />
          </div>
          
          <h2 className="heading-2" style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{title}</h2>
          <p className="body-text" style={{ fontSize: '0.925rem', marginBottom: '1.5rem' }}>{message}</p>
          
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
            <button 
              onClick={onCancel} 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '0.75rem' }}
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              className="btn" 
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
                backgroundColor: type === 'danger' ? 'var(--danger)' : 'var(--warning)',
                color: 'white',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
