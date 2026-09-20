import React from 'react';
import { 
  Users, 
  Stethoscope, 
  FileText, 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert,
  Database
} from 'lucide-react';

export const DashboardPlaceholder: React.FC = () => {
  const systemMetrics = [
    { label: 'Patient Records API', status: 'Verified', value: '/api/patients', color: 'var(--emerald)' },
    { label: 'Clinical History API', status: 'Verified', value: '/api/patients/{id}/symptoms', color: 'var(--cyan)' },
    { label: 'Diagnostic Reports API', status: 'Verified', value: '/api/patients/{id}/reports', color: 'var(--primary)' },
    { label: 'Decision Rule Engine', status: 'Verified', value: '5 Deterministic Rules', color: 'var(--amber)' },
    { label: 'Gemini AI Integration', status: 'Verified', value: '/ai-summary (Non-destructive)', color: 'var(--rose)' },
  ];

  const modules = [
    {
      title: 'Patient Record Management',
      phase: 'Phase 4',
      description: 'Create and query patient records with unique collision-safe ID generation (PAT-YYYYMMDD-XXXX).',
      icon: Users,
      color: 'var(--emerald)',
      bgColor: 'var(--emerald-light)'
    },
    {
      title: 'Symptoms & Clinical History',
      phase: 'Phase 5',
      description: 'Manage symptoms, medical history, allergies, and current active medications with ownership verification.',
      icon: Stethoscope,
      color: 'var(--cyan)',
      bgColor: 'var(--cyan-light)'
    },
    {
      title: 'Diagnostic Reports',
      phase: 'Phase 6',
      description: 'Store and access blood tests, imaging scans, lab results, and diagnostic report references.',
      icon: FileText,
      color: 'var(--primary)',
      bgColor: 'var(--primary-light)'
    },
    {
      title: 'Decision-Support Rule Engine',
      phase: 'Phase 7',
      description: 'Evaluates fever duration, allergy alerts, active history, medication reviews, and lab findings deterministically.',
      icon: BrainCircuit,
      color: 'var(--amber)',
      bgColor: 'var(--amber-light)'
    },
    {
      title: 'Gemini AI Assistant Layer',
      phase: 'Phase 7',
      description: 'Generates structured AI summaries for doctor review without making automatic diagnoses or prescriptions.',
      icon: Sparkles,
      color: 'var(--rose)',
      bgColor: 'var(--rose-light)'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '32px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
        borderColor: 'var(--border-accent)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'var(--primary-light)',
            border: '1px solid var(--border-accent)',
            fontSize: '12px',
            fontWeight: 600,
            color: '#a5b4fc',
            width: 'fit-content'
          }}>
            <Sparkles size={14} />
            Phase 8 — Step 1: Frontend Foundation Active
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Healthcare Decision-Support Console
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Welcome to <strong>ClinAssist</strong>. The React + TypeScript + Vite frontend foundation is now running successfully.
            Phases 1 through 7 backend services (Patient CRUD, Clinical Records, Diagnostic Reports, Rule Engine, and Gemini AI) are fully operational and verified.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--emerald)',
              fontWeight: 600
            }}>
              <CheckCircle2 size={16} />
              104 Automated Tests Passing
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--cyan)',
              fontWeight: 600
            }}>
              <Database size={16} />
              MongoDB Atlas Backend Active
            </div>
          </div>
        </div>
      </div>

      {/* Backend API Verification Summary Cards */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>
          Verified Backend Infrastructure Status
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          {systemMetrics.map((metric, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{metric.label}</span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'var(--emerald-light)',
                  color: 'var(--emerald)'
                }}>
                  {metric.status}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Modules Grid */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>
          ClinAssist Platform Capabilities Overview
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {modules.map((mod, index) => {
            const IconComponent = mod.icon;
            return (
              <div key={index} className="glass-panel" style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: mod.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComponent size={22} color={mod.color} />
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)'
                    }}>
                      {mod.phase}
                    </span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      {mod.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: mod.color,
                  marginTop: '8px'
                }}>
                  <span>Backend Ready</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        borderColor: 'rgba(245, 158, 11, 0.2)',
        background: 'rgba(245, 158, 11, 0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <ShieldAlert size={24} color="var(--amber)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          <strong style={{ color: 'var(--amber)' }}>Clinical Safety Disclaimer:</strong> ClinAssist is an AI-powered healthcare decision-support platform designed to assist licensed healthcare professionals. It does not automatically diagnose diseases, prescribe medications, or replace professional clinical judgment. Final clinical decisions rest entirely with the attending doctor.
        </div>
      </div>
    </div>
  );
};
