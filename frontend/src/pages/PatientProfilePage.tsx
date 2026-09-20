import React, { useState } from 'react';
import { 
  MOCK_PATIENTS, 
  MOCK_SYMPTOMS, 
  MOCK_MEDICAL_HISTORIES, 
  MOCK_ALLERGIES, 
  MOCK_MEDICATIONS, 
  MOCK_DIAGNOSTIC_REPORTS,
  MOCK_ASSESSMENTS
} from '../data/mockData';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { EmptyState } from '../components/EmptyState';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Stethoscope, 
  FileText, 
  BrainCircuit, 
  Sparkles,
  Pill,
  ShieldAlert,
  ChevronRight,
  Activity
} from 'lucide-react';

interface PatientProfilePageProps {
  patientId: string;
  onBack: () => void;
  onSelectAssessment: (patientId: string, assessmentId: string) => void;
}

export const PatientProfilePage: React.FC<PatientProfilePageProps> = ({
  patientId,
  onBack,
  onSelectAssessment
}) => {
  const patient = MOCK_PATIENTS.find((p) => p.id === patientId) || MOCK_PATIENTS[0];

  const symptoms = MOCK_SYMPTOMS[patient.id] || [];
  const medicalHistories = MOCK_MEDICAL_HISTORIES[patient.id] || [];
  const allergies = MOCK_ALLERGIES[patient.id] || [];
  const medications = MOCK_MEDICATIONS[patient.id] || [];
  const reports = MOCK_DIAGNOSTIC_REPORTS[patient.id] || [];
  const assessments = MOCK_ASSESSMENTS[patient.id] || [];

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CLINICAL' | 'REPORTS' | 'ASSESSMENTS'>('OVERVIEW');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Back Button & Patient Header */}
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
          <span>Back to Patients Directory</span>
        </button>

        {/* Patient Demographics Hero Card */}
        <div className="glass-panel" style={{
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(18, 26, 43, 0.9) 0%, rgba(11, 15, 25, 0.9) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '24px',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
            }}>
              {patient.fullName.charAt(0)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                  {patient.fullName}
                </h2>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: 'var(--emerald-light)',
                  color: 'var(--emerald)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontFamily: 'monospace'
                }}>
                  {patient.patientId}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--text-subtle)" />
                  <span>DOB: {patient.dateOfBirth} ({patient.gender})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="var(--text-subtle)" />
                  <span>Blood Group: <strong>{patient.bloodGroup}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="var(--text-subtle)" />
                  <span>{patient.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="var(--text-subtle)" />
                  <span>{patient.email}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-subtle)' }}>
                <MapPin size={14} />
                <span>Address: {patient.address}</span>
              </div>
            </div>
          </div>

          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontSize: '11px',
            color: 'var(--text-subtle)',
            fontFamily: 'monospace'
          }}>
            <span>Internal Mongo ID:</span>
            <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{patient.id}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px'
      }}>
        {[
          { id: 'OVERVIEW', label: 'Overview & Summary', icon: Activity },
          { id: 'CLINICAL', label: `Clinical Records (${symptoms.length + medicalHistories.length + allergies.length + medications.length})`, icon: Stethoscope },
          { id: 'REPORTS', label: `Diagnostic Reports (${reports.length})`, icon: FileText },
          { id: 'ASSESSMENTS', label: `Assessments (${assessments.length})`, icon: BrainCircuit }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <TabIcon size={16} color={isActive ? 'var(--primary)' : 'var(--text-subtle)'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* OVERVIEW / CLINICAL SUMMARY TAB */}
      {(activeTab === 'OVERVIEW' || activeTab === 'CLINICAL') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
          
          {/* Symptoms Section */}
          <SectionCard title="Reported Symptoms" icon={Stethoscope} iconColor="var(--rose)">
            {symptoms.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {symptoms.map((s) => (
                  <div key={s.id} style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(11, 15, 25, 0.6)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</span>
                      <SeverityBadge severity={s.severity} />
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Duration: <strong>{s.duration}</strong>
                    </div>
                    {s.notes && <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{s.notes}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No symptoms recorded for this patient." />
            )}
          </SectionCard>

          {/* Medical History Section */}
          <SectionCard title="Active Medical History" icon={Activity} iconColor="var(--amber)">
            {medicalHistories.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {medicalHistories.map((h) => (
                  <div key={h.id} style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(11, 15, 25, 0.6)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{h.condition}</span>
                      <StatusBadge status={h.status} />
                    </div>
                    {h.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{h.description}</div>}
                    {h.diagnosedDate && <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Diagnosed: {h.diagnosedDate}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No medical history conditions recorded." />
            )}
          </SectionCard>

          {/* Allergies Section */}
          <SectionCard title="Documented Allergies" icon={ShieldAlert} iconColor="var(--rose)">
            {allergies.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allergies.map((a) => (
                  <div key={a.id} style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--rose-light)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--rose)' }}>{a.allergen}</span>
                      <SeverityBadge severity={a.severity} />
                    </div>
                    {a.reaction && <div style={{ fontSize: '12px', color: 'var(--text-main)' }}>Reaction: {a.reaction}</div>}
                    {a.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.notes}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No allergies documented for this patient." />
            )}
          </SectionCard>

          {/* Current Medications Section */}
          <SectionCard title="Current Medications" icon={Pill} iconColor="var(--cyan)">
            {medications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {medications.map((m) => (
                  <div key={m.id} style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(11, 15, 25, 0.6)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cyan)' }}>{m.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-main)' }}>
                      Dosage: <strong>{m.dosage}</strong> • Frequency: {m.frequency}
                    </div>
                    {m.notes && <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{m.notes}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No current medications prescribed." />
            )}
          </SectionCard>

        </div>
      )}

      {/* DIAGNOSTIC REPORTS TAB */}
      {(activeTab === 'OVERVIEW' || activeTab === 'REPORTS') && (
        <SectionCard title="Diagnostic & Laboratory Reports" icon={FileText} iconColor="var(--primary)">
          {reports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reports.map((r) => (
                <div key={r.id} style={{
                  padding: '18px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(11, 15, 25, 0.6)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>{r.reportName}</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-muted)'
                      }}>
                        {r.reportType}
                      </span>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Test Date: {r.testDate} • Laboratory: {r.labName} • Ref: <span style={{ fontFamily: 'monospace' }}>{r.reportReference}</span>
                  </div>

                  {r.summary && (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      fontSize: '13px',
                      color: 'var(--text-main)',
                      lineHeight: '1.4'
                    }}>
                      <strong>Summary:</strong> {r.summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No diagnostic reports uploaded for this patient." />
          )}
        </SectionCard>
      )}

      {/* ASSESSMENTS TAB */}
      {(activeTab === 'OVERVIEW' || activeTab === 'ASSESSMENTS') && (
        <SectionCard title="Clinical Decision-Support Assessments" icon={BrainCircuit} iconColor="var(--amber)">
          {assessments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {assessments.map((a) => (
                <div key={a.id} style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(11, 15, 25, 0.7)',
                  border: '1px solid var(--border-accent)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <BrainCircuit size={20} color="var(--amber)" />
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                        Assessment #{a.id}
                      </span>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Created by: {a.createdBy} • Evaluated findings: <strong>{a.findings.length} Rule Findings</strong>
                  </div>

                  {a.aiSummary && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: 'var(--cyan-light)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      fontSize: '12px',
                      color: 'var(--cyan)',
                      width: 'fit-content'
                    }}>
                      <Sparkles size={14} />
                      <span>Gemini AI Decision-Support Summary Ready</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => onSelectAssessment(patient.id, a.id)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--primary)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Review Decision Support Findings</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No decision-support assessments generated for this patient yet." />
          )}
        </SectionCard>
      )}

    </div>
  );
};
