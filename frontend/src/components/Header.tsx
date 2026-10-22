import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Activity, ShieldCheck, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      height: '68px',
      borderBottom: '1px solid var(--border-color)',
      background: '#ffffff',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Logo & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
        }}>
          <Activity size={22} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px', color: '#0f172a' }}>
            ClinAssist
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
            AI-Powered Healthcare Decision-Support Platform
          </p>
        </div>
      </div>

      {/* User Role Badge & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: '#e0f2fe',
            border: '1px solid #bae6fd',
            fontSize: '13px',
            color: '#0284c7'
          }}>
            <ShieldCheck size={16} color="#0284c7" />
            <span style={{ fontWeight: 600 }}>{user.role}</span>
            <span style={{ color: '#475569' }}>({user.fullName})</span>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          title="Sign Out"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#dc2626',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
