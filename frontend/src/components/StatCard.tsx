import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor
}) => {
  return (
    <div className="glass-panel" style={{
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          {title}
        </span>
        <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          {value}
        </span>
        {subtitle && (
          <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
            {subtitle}
          </span>
        )}
      </div>

      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-md)',
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={24} color={color} />
      </div>
    </div>
  );
};
