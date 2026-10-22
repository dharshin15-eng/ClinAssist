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

  const navItems: Array<{
    id: string;
    label: string;
    icon: any;
    badge?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient Directory', icon: Users },
    { id: 'assessment', label: 'Decision Engine', icon: BrainCircuit }
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
      background: '#ffffff',
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
                background: isActive ? '#E0F2FE' : 'transparent',
                color: isActive ? '#0284C7' : '#475569',
                border: isActive ? '1px solid #bae6fd' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? '#0284C7' : '#64748b'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#E0F2FE',
                  color: '#0284C7',
                  border: '1px solid #bae6fd'
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
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
          <Settings size={14} color="#64748b" />
          <span>Dev Engine: Active</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
          <HelpCircle size={14} color="#64748b" />
          <span>ClinAssist v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
