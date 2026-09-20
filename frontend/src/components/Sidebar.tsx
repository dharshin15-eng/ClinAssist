import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BrainCircuit, 
  Settings,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: 'dashboard' | 'patients' | 'assessment' | 'admin-users') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient Directory', icon: Users, badge: 'Phase 4-6' },
    { id: 'assessment', label: 'Decision Engine', icon: BrainCircuit, badge: 'Phase 7' }
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({
      id: 'admin-users',
      label: 'User Management',
      icon: ShieldCheck,
      badge: 'Admin'
    });
  }

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
          Clinical Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id || (activeView === 'patient-profile' && item.id === 'patients');

          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 400,
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-subtle)'} />
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

      {/* Footer Info */}
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
          <span>Dev Engine: Active</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <HelpCircle size={14} />
          <span>ClinAssist v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
