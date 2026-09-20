import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Patient } from '../types';
import { patientService } from '../services/patientService';
import { StatCard } from '../components/StatCard';
import { SectionCard } from '../components/SectionCard';
import { 
  Users, 
  BrainCircuit, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert,
  ChevronRight,
  UserCheck,
  Stethoscope,
  Loader2
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateToPatients: () => void;
  onSelectPatient: (patientId: string) => void;
  onSelectAssessment: (patientId: string, assessmentId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToPatients,
  onSelectPatient
}) => {
  const { user } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoadingPatients(true);
      try {
        const patientData = await patientService.getPatients();
        setPatients(patientData);
      } catch (e) {
        // Fallback gracefully on dashboard if backend error
        setPatients([]);
      } finally {
        setIsLoadingPatients(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalPatients = patients.length;
  const recentPatients = patients.slice(0, 5);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
        borderColor: 'var(--border-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '12px',
              background: 'var(--primary-light)',
              color: '#a5b4fc',
              border: '1px solid var(--border-accent)',
              letterSpacing: '0.5px'
            }}>
              ROLE: {user?.role || 'DOCTOR'}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              ClinAssist Decision Support Dashboard
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Welcome back, {user?.fullName || 'Doctor'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '650px' }}>
            Overview of clinical decision-support assessments, recent patient records, and lab findings for review.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToPatients}
          style={{
            padding: '12px 20px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--primary)',
            border: 'none',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            transition: 'all 0.2s ease'
          }}
        >
          <Users size={16} />
          <span>View Patients ({totalPatients})</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        <StatCard
          title="Total Registered Patients"
          value={isLoadingPatients ? '...' : totalPatients}
          subtitle="Managed in MongoDB database"
          icon={Users}
          color="var(--emerald)"
          bgColor="var(--emerald-light)"
        />
        <StatCard
          title="Clinical Assessments"
          value="Decision Engine"
          subtitle="Evaluates 5 Deterministic Rules"
          icon={BrainCircuit}
          color="var(--amber)"
          bgColor="var(--amber-light)"
        />
        <StatCard
          title="Diagnostic Reports"
          value="Laboratory Data"
          subtitle="Reports & Diagnostic Records"
          icon={FileText}
          color="var(--primary)"
          bgColor="var(--primary-light)"
        />
        <StatCard
          title="AI Summaries Generated"
          value="Gemini Layer"
          subtitle="Clinical AI decision support"
          icon={Sparkles}
          color="var(--cyan)"
          bgColor="var(--cyan-light)"
        />
      </div>

      {/* Main Grid: Recent Patients & System Information */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Recent Patients Section */}
        <SectionCard
          title="Recent Patient Records"
          subtitle="Click to view detailed clinical profile"
          icon={UserCheck}
          iconColor="var(--emerald)"
          action={
            <button
              type="button"
              onClick={onNavigateToPatients}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>View List</span>
              <ChevronRight size={16} />
            </button>
          }
        >
          {isLoadingPatients ? (
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-muted)' }}>
              <Loader2 size={20} className="animate-pulse-slow" />
              <span>Loading recent patients...</span>
            </div>
          ) : recentPatients.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentPatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectPatient(p.id)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(11, 15, 25, 0.6)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      fontWeight: 700,
                      fontSize: '14px'
                    }}>
                      {p.fullName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {p.fullName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {p.patientId || 'PAT-RECORD'} • DOB: {p.dateOfBirth} ({p.gender})
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {p.bloodGroup && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)'
                      }}>
                        Blood: {p.bloodGroup}
                      </span>
                    )}
                    <ChevronRight size={18} color="var(--text-subtle)" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No patient records registered yet. Click &quot;View Patients&quot; to register a patient.
            </div>
          )}
        </SectionCard>

        {/* System Capabilities Section */}
        <SectionCard
          title="ClinAssist Decision Support Engine"
          subtitle="Architecture and clinical workflow"
          icon={Stethoscope}
          iconColor="var(--amber)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(11, 15, 25, 0.6)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)', fontWeight: 600, fontSize: '14px' }}>
                <Users size={16} />
                <span>Patient Record Management</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Full CRUD management for patient demographics with auto-generated collision-safe PAT-XXXX business identifiers stored in MongoDB Atlas.
              </p>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(11, 15, 25, 0.6)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber)', fontWeight: 600, fontSize: '14px' }}>
                <BrainCircuit size={16} />
                <span>Deterministic Rule Evaluation</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Evaluates fever duration, medical history risk factors, drug allergy cross-reactivity, and medication contraindications safely.
              </p>
            </div>
          </div>
        </SectionCard>

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
          <strong style={{ color: 'var(--amber)' }}>Clinical Safety Disclaimer:</strong> ClinAssist decision support provides structured clinical findings and AI summaries for doctor review. It does not automatically diagnose diseases, prescribe medications, or replace professional clinical judgment. Final clinical decisions rest entirely with the attending physician.
        </div>
      </div>

    </div>
  );
};
