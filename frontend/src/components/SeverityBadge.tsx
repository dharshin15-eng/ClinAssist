import React from 'react';

interface SeverityBadgeProps {
  severity: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const getSeverityStyle = (sevVal: string) => {
    switch (sevVal.toUpperCase()) {
      case 'HIGH':
      case 'SEVERE':
        return {
          bg: 'var(--rose-light)',
          color: 'var(--rose)',
          border: 'rgba(244, 63, 94, 0.3)'
        };
      case 'MEDIUM':
      case 'MODERATE':
        return {
          bg: 'var(--amber-light)',
          color: 'var(--amber)',
          border: 'rgba(245, 158, 11, 0.3)'
        };
      case 'LOW':
      case 'MILD':
        return {
          bg: 'var(--emerald-light)',
          color: 'var(--emerald)',
          border: 'rgba(16, 185, 129, 0.3)'
        };
      case 'INFORMATIONAL':
      default:
        return {
          bg: 'var(--cyan-light)',
          color: 'var(--cyan)',
          border: 'rgba(6, 182, 212, 0.3)'
        };
    }
  };

  const style = getSeverityStyle(severity);

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
      {severity}
    </span>
  );
};
