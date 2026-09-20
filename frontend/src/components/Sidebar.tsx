import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  FileText, 
  BrainCircuit, 
  Sparkles,
  Settings,
  HelpCircle
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true },
    { label: 'Patient Records', icon: Users, badge: 'Phase 4' },
    { label: 'Symptoms & History', icon: Stethoscope, badge: 'Phase 5' },
    { label: 'Diagnostic Reports', icon: FileText, badge: 'Phase 6' },
    { label: 'Rule Engine', icon: BrainCircuit, badge: 'Phase 7' },
    { label: 'Gemini AI Assistant', icon: Sparkles, badge: 'Phase 7' },
  ];

  return (
    <aside style={{
      width: '260px',
      borderRight: '1px solid var(--border-color)',
      background: 'rgba(11, 15, 25, 0.6)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      minHeight: 'calc(100vh - 68px)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          padding: '0 12px 12px 12px',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--text-subtle)'
        }}>
          Clinical Modules
        </div>

        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: item.active ? 'var(--primary-light)' : 'transparent',
                color: item.active ? '#ffffff' : 'var(--text-muted)',
                border: item.active ? '1px solid var(--border-accent)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: item.active ? 600 : 400,
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={item.active ? 'var(--primary)' : 'var(--text-subtle)'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)'
                }}>
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div style={{
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(18, 26, 43, 0.5)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Settings size={14} />
          <span>System Status: Online</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <HelpCircle size={14} />
          <span>ClinAssist v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
