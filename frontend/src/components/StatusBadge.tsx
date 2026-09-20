import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = (statusVal: string) => {
    switch (statusVal.toUpperCase()) {
      case 'COMPLETED':
      case 'ACTIVE':
      case 'REVIEWED':
        return {
          bg: 'var(--emerald-light)',
          color: 'var(--emerald)',
          border: 'rgba(16, 185, 129, 0.3)'
        };
      case 'PENDING':
      case 'DRAFT':
        return {
          bg: 'var(--amber-light)',
          color: 'var(--amber)',
          border: 'rgba(245, 158, 11, 0.3)'
        };
      case 'RESOLVED':
        return {
          bg: 'var(--primary-light)',
          color: '#a5b4fc',
          border: 'var(--border-accent)'
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.05)',
          color: 'var(--text-muted)',
          border: 'var(--border-color)'
        };
    }
  };

  const style = getBadgeStyle(status);

  return (
    <span style={{
      fontSize: '11px',
      fontWeight: 700,
      padding: '3px 9px',
      borderRadius: '12px',
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      letterSpacing: '0.3px',
      display: 'inline-flex',
      alignItems: 'center',
      width: 'fit-content'
    }}>
      {status}
    </span>
  );
};
