import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

interface MainLayoutProps {
  activeView: string;
  onNavigate: (view: 'dashboard' | 'patients' | 'assessment' | 'admin-users') => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ activeView, onNavigate, children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-gradient-mesh" />
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeView={activeView} onNavigate={onNavigate} />
        <main style={{
          flex: 1,
          padding: '32px 36px',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};
