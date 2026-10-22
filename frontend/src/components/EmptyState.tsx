import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  message = 'No clinical data has been recorded for this section yet.',
  icon: Icon = FolderOpen,
  action
}) => {
  return (
    <div style={{
      padding: '40px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      background: '#f8fafc',
      borderRadius: 'var(--radius-md)',
      border: '1px dashed #cbd5e1'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: '#e0f2fe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0284c7'
      }}>
        <Icon size={24} />
      </div>
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
          {title}
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px' }}>
          {message}
        </p>
      </div>
      {action && <div style={{ marginTop: '8px' }}>{action}</div>}
    </div>
  );
};
