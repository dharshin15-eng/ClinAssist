import React from 'react';
import { MOCK_ASSESSMENTS, MOCK_PATIENTS } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { SectionCard } from '../components/SectionCard';
import { 
  ArrowLeft, 
  BrainCircuit, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  Clock,
  UserCheck
} from 'lucide-react';

interface AssessmentPageProps {
  patientId: string;
  assessmentId: string;
  onBack: () => void;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({
  patientId,
  assessmentId,
  onBack
}) => {
  const patient = MOCK_PATIENTS.find((p) => p.id === patientId) || MOCK_PATIENTS[0];
  const assessments = MOCK_ASSESSMENTS[patient.id] || [];
  const assessment = assessments.find((a) => a.id === assessmentId) || assessments[0];

  if (!assessment) {
    return (
      <div style={{ padding: '32px' }}>
        <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
          &larr; Back
        </button>
        <div style={{ marginTop: '20px' }}>Assessment not found.</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Back Button & Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            width: 'fit-content'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Patient Clinical Profile</span>
        </button>

        {/* Assessment Hero Card */}
        <div className="glass-panel" style={{
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(18, 26, 43, 0.9) 0%, rgba(11, 15, 25, 0.9) 100%)',
          borderColor: 'var(--border-accent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--amber) 0%, var(--rose) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
            }}>
              <BrainCircuit size={28} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                  Clinical Assessment #{assessment.id}
                </h2>
                <StatusBadge status={assessment.status} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={14} color="var(--emerald)" />
                  <span>Patient: <strong>{patient.fullName}</strong> ({patient.patientId})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="var(--text-subtle)" />
                  <span>Evaluated: {assessment.createdAt}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={14} color="var(--text-subtle)" />
                  <span>Evaluator: {assessment.createdBy}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--amber-light)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'var(--amber)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle2 size={16} />
            <span>5 Deterministic Rules Evaluated</span>
          </div>
        </div>
      </div>

      {/* Grid: Findings List & AI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px' }}>
        
        {/* Deterministic Rule Findings Section */}
        <SectionCard
          title="Deterministic Rule Engine Findings"
          subtitle="Findings generated independently by rule evaluation"
          icon={BrainCircuit}
          iconColor="var(--amber)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {assessment.findings.map((finding) => (
              <div
                key={finding.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(11, 15, 25, 0.6)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)'
                    }}>
                      {finding.category}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {finding.title}
                    </span>
                  </div>
                  <SeverityBadge severity={finding.severity} />
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {finding.description}
                </p>

                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>Source:</span>
                  <strong style={{ color: '#a5b4fc' }}>{finding.source}</strong>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Gemini AI Summary Section */}
        <SectionCard
          title="Gemini AI Assistance Layer Summary"
          subtitle="Structured summary based strictly on recorded facts & rule findings"
          icon={Sparkles}
          iconColor="var(--cyan)"
        >
          {assessment.aiSummary ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '20px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(6, 182, 212, 0.05)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                color: 'var(--text-main)',
                lineHeight: '1.6'
              }}>
                {assessment.aiSummary}
              </div>

              {/* Safety Disclaimer Banner */}
              <div style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <ShieldAlert size={18} color="var(--amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  <strong style={{ color: 'var(--amber)' }}>Doctor Responsibility Note:</strong> This summary is an AI decision-support output. It does not prescribe, diagnose, or override physician judgment. Final clinical decisions rest entirely with the attending doctor.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No AI summary generated for this assessment.
            </div>
          )}
        </SectionCard>

      </div>

    </div>
  );
};
