import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { SectionCard } from '../components/SectionCard';
import { MOCK_PATIENTS, MOCK_ASSESSMENTS } from '../data/mockData';
import { 
  Users, 
  BrainCircuit, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert,
  ChevronRight,
  UserCheck,
  Stethoscope
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateToPatients: () => void;
  onSelectPatient: (patientId: string) => void;
  onSelectAssessment: (patientId: string, assessmentId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToPatients,
  onSelectPatient,
  onSelectAssessment
}) => {
  const { user } = useAuth();

  const totalPatients = MOCK_PATIENTS.length;
  const recentAssessmentList = MOCK_ASSESSMENTS['6aaecb6773a3c416fa03cf9a'] || [];
  const primaryPatient = MOCK_PATIENTS[0];

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
          <span>View All Patients ({totalPatients})</span>
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
          value={totalPatients}
          subtitle="Managed in clinical database"
          icon={Users}
          color="var(--emerald)"
          bgColor="var(--emerald-light)"
        />
        <StatCard
          title="Clinical Assessments"
          value="1 Active"
          subtitle="Evaluated by 5 Decision Rules"
          icon={BrainCircuit}
          color="var(--amber)"
          bgColor="var(--amber-light)"
        />
        <StatCard
          title="Diagnostic Reports"
          value="2 Completed"
          subtitle="CBC & Chest X-Ray reviewed"
          icon={FileText}
          color="var(--primary)"
          bgColor="var(--primary-light)"
        />
        <StatCard
          title="AI Summaries Generated"
          value="1 Ready"
          subtitle="Gemini AI assistance layer"
          icon={Sparkles}
          color="var(--cyan)"
          bgColor="var(--cyan-light)"
        />
      </div>

      {/* Main Grid: Recent Patients & Recent Assessments */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {MOCK_PATIENTS.map((p) => (
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
                      {p.patientId} • DOB: {p.dateOfBirth} ({p.gender})
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  <ChevronRight size={18} color="var(--text-subtle)" />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Recent Assessments Section */}
        <SectionCard
          title="Recent Decision-Support Assessments"
          subtitle="Evaluated using deterministic rules & Gemini AI"
          icon={Stethoscope}
          iconColor="var(--amber)"
        >
          {recentAssessmentList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentAssessmentList.map((assess) => (
                <div
                  key={assess.id}
                  onClick={() => onSelectAssessment(primaryPatient.id, assess.id)}
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(11, 15, 25, 0.6)',
                    border: '1px solid var(--border-accent)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BrainCircuit size={18} color="var(--amber)" />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                        Assessment #{assess.id}
                      </span>
                    </div>
                    <StatusBadge status={assess.status} />
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Patient: <strong>{primaryPatient.fullName}</strong> ({primaryPatient.patientId}) • Created by: {assess.createdBy}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'var(--amber-light)',
                      color: 'var(--amber)',
                      border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                      5 Rule Engine Findings
                    </span>

                    {assess.aiSummary && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'var(--cyan-light)',
                        color: 'var(--cyan)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Sparkles size={12} />
                        AI Summary Generated
                      </span>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    marginTop: '4px'
                  }}>
                    <span>Review Assessment Findings</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              No recent assessments available.
            </div>
          )}
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
