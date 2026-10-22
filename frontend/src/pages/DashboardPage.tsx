import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Patient, Assessment } from '../types';
import { patientService } from '../services/patientService';
import { assessmentService } from '../services/assessmentService';
import { StatCard } from '../components/StatCard';
import { SectionCard } from '../components/SectionCard';
import { 
  Users, 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert,
  ChevronRight,
  UserCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateToPatients: () => void;
  onSelectPatient: (patientId: string) => void;
  onSelectAssessment: (patientId: string, assessmentId: string) => void;
}

interface EnrichedAssessment extends Assessment {
  patientName: string;
  patientDisplayId: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToPatients,
  onSelectPatient,
  onSelectAssessment
}) => {
  const { user } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [assessments, setAssessments] = useState<EnrichedAssessment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'DRAFT'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Load patients accessible to the doctor
      const patientData = await patientService.getPatients();
      setPatients(patientData);

      // 2. Fetch assessments across accessible patients
      if (patientData.length > 0) {
        // Concurrently fetch assessments for all loaded patients
        const assessmentPromises = patientData.map(async (patient) => {
          try {
            const list = await assessmentService.getAssessments(patient.id);
            return list.map((a) => ({
              ...a,
              patientName: patient.fullName,
              patientDisplayId: patient.patientId || 'PAT-RECORD'
            }));
          } catch {
            return [];
          }
        });

        const results = await Promise.all(assessmentPromises);
        const allAssessments = results.flat().sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        setAssessments(allAssessments);
      } else {
        setAssessments([]);
      }
    } catch (e: any) {
      console.error('Failed to load dashboard data:', e);
      setError(e.message || 'Failed to load doctor dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute Doctor Dashboard KPIs
  const totalPatients = patients.length;
  const totalAssessments = assessments.length;
  const completedAssessmentsCount = useMemo(
    () => assessments.filter((a) => a.status === 'COMPLETED' || a.status === 'REVIEWED').length,
    [assessments]
  );
  const draftAssessmentsCount = useMemo(
    () => assessments.filter((a) => a.status === 'DRAFT').length,
    [assessments]
  );
  const aiSummariesCount = useMemo(
    () => assessments.filter((a) => a.aiSummary && a.aiSummary.trim().length > 0).length,
    [assessments]
  );

  // Filter assessments list based on status tab and search term
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'COMPLETED'
          ? a.status === 'COMPLETED' || a.status === 'REVIEWED'
          : a.status === 'DRAFT';

      const matchesSearch =
        !searchTerm.trim() ||
        a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.patientDisplayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [assessments, statusFilter, searchTerm]);

  // Recent patients list (top 5)
  const recentPatients = useMemo(() => patients.slice(0, 5), [patients]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Doctor Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        borderColor: '#bae6fd',
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
              background: '#e0f2fe',
              color: '#0284c7',
              border: '1px solid #bae6fd',
              letterSpacing: '0.5px'
            }}>
              ROLE: {user?.role || 'DOCTOR'}
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Doctor Clinical Workspace
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', color: '#0f172a' }}>
            {user?.role === 'DOCTOR' ? 'Welcome, Doctor' : `Welcome, ${user?.fullName || ''}`}
          </h2>
          <p style={{ fontSize: '13px', color: '#475569', maxWidth: '680px', lineHeight: '1.5' }}>
            Overview of accessible patient records, recent clinical decision-support assessments, rule-engine findings, and Gemini AI summaries.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={loadDashboardData}
            title="Refresh Dashboard"
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={onNavigateToPatients}
            style={{
              padding: '11px 18px',
              borderRadius: 'var(--radius-sm)',
              background: '#0ea5e9',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <Users size={16} />
            <span>Patient Directory ({totalPatients})</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px'
      }}>
        <StatCard
          title="Accessible Patients"
          value={isLoading ? '...' : totalPatients}
          subtitle="Managed in MongoDB database"
          icon={Users}
          color="#10b981"
          bgColor="#d1fae5"
        />
        <StatCard
          title="Total Clinical Assessments"
          value={isLoading ? '...' : totalAssessments}
          subtitle="Evaluated by Rule Engine"
          icon={BrainCircuit}
          color="#d97706"
          bgColor="#fef3c7"
        />
        <StatCard
          title="Completed / Reviewed"
          value={isLoading ? '...' : completedAssessmentsCount}
          subtitle={`${draftAssessmentsCount} draft assessments pending`}
          icon={CheckCircle2}
          color="#0284c7"
          bgColor="#e0f2fe"
        />
        <StatCard
          title="AI Summaries Generated"
          value={isLoading ? '...' : aiSummariesCount}
          subtitle="Gemini AI clinical decision support"
          icon={Sparkles}
          color="#0284c7"
          bgColor="#e0f2fe"
        />
      </div>

      {/* Main Grid: Recent Assessments & Recent Patient Records */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Recent Assessments Section */}
        <SectionCard
          title="Clinical Decision Assessments"
          subtitle="Rule engine evaluations & AI summaries for doctor review"
          icon={BrainCircuit}
          iconColor="#0284c7"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                background: '#f8fafc',
                padding: '3px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: statusFilter === 'ALL' ? '#0ea5e9' : 'transparent',
                    color: statusFilter === 'ALL' ? '#ffffff' : '#64748b',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  All ({totalAssessments})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('COMPLETED')}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: statusFilter === 'COMPLETED' ? '#10b981' : 'transparent',
                    color: statusFilter === 'COMPLETED' ? '#ffffff' : '#64748b',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Done ({completedAssessmentsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('DRAFT')}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: statusFilter === 'DRAFT' ? '#f59e0b' : 'transparent',
                    color: statusFilter === 'DRAFT' ? '#ffffff' : '#64748b',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Draft ({draftAssessmentsCount})
                </button>
              </div>
            </div>
          }
        >
          {/* Search Box */}
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <Search size={14} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              placeholder="Search assessment by patient name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-sm)',
                color: '#0f172a',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          {isLoading ? (
            <div style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#64748b' }}>
              <Loader2 size={20} className="animate-spin" color="#0ea5e9" />
              <span>Loading clinical assessments...</span>
            </div>
          ) : error ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#dc2626', fontSize: '13px' }}>
              <AlertCircle size={20} style={{ margin: '0 auto 8px auto' }} />
              <div>{error}</div>
            </div>
          ) : filteredAssessments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredAssessments.slice(0, 10).map((a) => {
                const hasAi = a.aiSummary && a.aiSummary.trim().length > 0;
                const findingsCount = a.findings ? a.findings.length : 0;
                const hasHighSeverity = a.findings?.some((f) => f.severity === 'HIGH');

                return (
                  <div
                    key={a.id}
                    onClick={() => onSelectAssessment(a.patientId, a.id)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#bae6fd'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: a.status === 'COMPLETED' || a.status === 'REVIEWED' ? '#d1fae5' : '#fef3c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: a.status === 'COMPLETED' || a.status === 'REVIEWED' ? '#059669' : '#d97706',
                        flexShrink: 0
                      }}>
                        <BrainCircuit size={18} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                            {a.patientName}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                            ({a.patientDisplayId})
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: a.status === 'COMPLETED' || a.status === 'REVIEWED' ? '#d1fae5' : '#fef3c7',
                            color: a.status === 'COMPLETED' || a.status === 'REVIEWED' ? '#059669' : '#d97706',
                            border: `1px solid ${a.status === 'COMPLETED' || a.status === 'REVIEWED' ? '#a7f3d0' : '#fde68a'}`
                          }}>
                            {a.status}
                          </span>

                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {findingsCount} {findingsCount === 1 ? 'Finding' : 'Findings'}
                          </span>

                          {hasHighSeverity && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fca5a5'
                            }}>
                              HIGH RISK
                            </span>
                          )}

                          {hasAi && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#e0f2fe',
                              color: '#0284c7',
                              border: '1px solid #bae6fd',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <Sparkles size={10} /> AI Summary
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}
                      </span>
                      <ChevronRight size={18} color="#94a3b8" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No assessments found matching the current filter. Select a patient to run a decision-support assessment.
            </div>
          )}
        </SectionCard>

        {/* Accessible Patients Section */}
        <SectionCard
          title="Accessible Patient Directory"
          subtitle="Select a patient to open clinical record or run assessment"
          icon={UserCheck}
          iconColor="#059669"
          action={
            <button
              type="button"
              onClick={onNavigateToPatients}
              style={{
                background: 'none',
                border: 'none',
                color: '#0ea5e9',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Full Directory ({totalPatients})</span>
              <ChevronRight size={16} />
            </button>
          }
        >
          {isLoading ? (
            <div style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#64748b' }}>
              <Loader2 size={20} className="animate-spin" color="#10b981" />
              <span>Loading patient directory...</span>
            </div>
          ) : recentPatients.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentPatients.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div 
                    onClick={() => onSelectPatient(p.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#e0f2fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284c7',
                      fontWeight: 700,
                      fontSize: '14px',
                      flexShrink: 0
                    }}>
                      {p.fullName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                        {p.fullName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {p.patientId || 'PAT-RECORD'} • DOB: {p.dateOfBirth} ({p.gender})
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => onSelectPatient(p.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectPatient(p.id)}
                      title="Run Decision Support Assessment"
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: '#e0f2fe',
                        border: '1px solid #bae6fd',
                        color: '#0284c7',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <BrainCircuit size={14} />
                      <span>Assess</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No patient records registered yet. Click &quot;Patient Directory&quot; to register a patient.
            </div>
          )}
        </SectionCard>

      </div>

      {/* Safety & Compliance Disclaimer Footer */}
      <div className="glass-panel" style={{
        padding: '18px 24px',
        borderColor: '#fde68a',
        background: '#fffbe6',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <ShieldAlert size={22} color="#d97706" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
          <strong style={{ color: '#d97706' }}>Clinical Safety Disclaimer:</strong> ClinAssist decision support provides structured clinical findings, deterministic rule-engine evaluations, and Gemini AI summaries for physician review. It does not replace independent professional medical judgment. Final clinical decisions rest entirely with the attending doctor.
        </div>
      </div>

    </div>
  );
};
