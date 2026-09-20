import React from 'react';
import { Activity, ShieldCheck, Cpu, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header style={{
      height: '68px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(12px)',
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
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--cyan) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
        }}>
          <Activity size={22} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px', color: '#ffffff' }}>
            ClinAssist
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
            AI-Powered Healthcare Decision-Support Platform
          </p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: 'var(--emerald-light)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          fontSize: '12px',
          color: 'var(--emerald)',
          fontWeight: 600
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--emerald)',
            boxShadow: '0 0 10px var(--emerald)'
          }} className="animate-pulse-slow" />
          Backend Ready (Java 21 + Spring Boot + MongoDB)
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: 'var(--primary-light)',
          border: '1px solid var(--border-accent)',
          fontSize: '12px',
          color: '#a5b4fc',
          fontWeight: 600
        }}>
          <Cpu size={14} color="#a5b4fc" />
          Frontend Foundation (Vite + React + TS)
        </div>
      </div>

      {/* User Role Badge Placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-color)',
          fontSize: '13px',
          color: 'var(--text-main)'
        }}>
          <ShieldCheck size={16} color="var(--cyan)" />
          <span style={{ fontWeight: 600 }}>DOCTOR</span>
          <span style={{ color: 'var(--text-subtle)' }}>(Dr. Alex Vance)</span>
        </div>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'var(--primary-light)',
          border: '1px solid var(--border-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          <User size={18} />
        </div>
      </div>
    </header>
  );
};
