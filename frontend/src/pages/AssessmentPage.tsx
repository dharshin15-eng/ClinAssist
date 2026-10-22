import React, { useState, useEffect } from 'react';
import type { 
  Patient, 
  Assessment, 
  Symptom, 
  MedicalHistory, 
  Allergy, 
  Medication, 
  DiagnosticReport 
} from '../types';
import { patientService } from '../services/patientService';
import { assessmentService } from '../services/assessmentService';
import { 
  symptomService, 
  medicalHistoryService, 
  allergyService, 
  medicationService 
} from '../services/clinicalService';
import { diagnosticReportService } from '../services/diagnosticReportService';
import { ApiClientError } from '../services/apiClient';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { SectionCard } from '../components/SectionCard';
import { GeminiSummaryViewer } from '../components/GeminiSummaryViewer';
import { 
  ArrowLeft, 
  BrainCircuit, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  RotateCcw,
  Stethoscope,
  Activity,
  Pill,
  FileText,
  Paperclip,
  Eye,
  Download,
  PlusCircle,
  X,
  Phone,
  Mail,
  Calendar,
  RefreshCw,
  Users
} from 'lucide-react';

interface AssessmentPageProps {
  patientId: string;
  assessmentId: string;
  onBack: () => void;
  onNavigateToPatients?: () => void;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({
  patientId: initialPatientId,
  assessmentId: initialAssessmentId,
  onBack,
  onNavigateToPatients
}) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Patient Clinical Context Records
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [diagnosticReports, setDiagnosticReports] = useState<DiagnosticReport[]>([]);

  // Workflow Action States
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isCreatingNewAssessment, setIsCreatingNewAssessment] = useState<boolean>(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // File Preview Modal State
  const [viewingFileReportId, setViewingFileReportId] = useState<string | null>(null);
  const [previewModalFile, setPreviewModalFile] = useState<{ url: string; name: string; type: string } | null>(null);

  // Tab View Control: 'ASSESSMENT' | 'CLINICAL_CONTEXT' | 'DIAGNOSTIC_FILES'
  const [activeTab, setActiveTab] = useState<'ASSESSMENT' | 'CLINICAL_CONTEXT' | 'DIAGNOSTIC_FILES'>('ASSESSMENT');

  const fetchAssessmentData = async () => {
    setLoading(true);
    setError(null);
    try {
      let targetPatientId = initialPatientId;

      // 1. If no initial patient ID provided, fallback to fetching first available patient from backend
      if (!targetPatientId || targetPatientId.trim().length === 0) {
        const patients = await patientService.getPatients();
        if (patients.length === 0) {
          setError('No patients registered in system. Please register a patient from the Patient Directory first.');
          setLoading(false);
          return;
        }
        targetPatientId = patients[0].id;
      }

      // 2. Fetch patient details
      const patientData = await patientService.getPatient(targetPatientId);
      setPatient(patientData);

      // 3. Resolve assessment
      let assessmentData: Assessment | null = null;
      if (initialAssessmentId && initialAssessmentId.trim().length > 0) {
        try {
          assessmentData = await assessmentService.getAssessment(targetPatientId, initialAssessmentId);
        } catch {
          assessmentData = null;
        }
      }

      // Fallback: If specified assessment not found or not provided, get latest assessment or create a new one
      if (!assessmentData) {
        const existingList = await assessmentService.getAssessments(targetPatientId);
        if (existingList.length > 0) {
          assessmentData = existingList.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          })[0];
        } else {
          assessmentData = await assessmentService.createAssessment(targetPatientId);
        }
      }

      setAssessment(assessmentData);
      
      // 4. Fetch clinical context records for resolved patient
      fetchClinicalContextData(targetPatientId);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load clinical assessment details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClinicalContextData = async (targetPatientId: string) => {
    try {
      const [syms, hist, alls, meds, reps] = await Promise.all([
        symptomService.getSymptoms(targetPatientId).catch(() => []),
        medicalHistoryService.getMedicalHistories(targetPatientId).catch(() => []),
        allergyService.getAllergies(targetPatientId).catch(() => []),
        medicationService.getMedications(targetPatientId).catch(() => []),
        diagnosticReportService.getReports(targetPatientId).catch(() => [])
      ]);
      setSymptoms(syms);
      setMedicalHistories(hist);
      setAllergies(alls);
      setMedications(meds);
      setDiagnosticReports(reps);
    } catch (err) {
      console.error('Error fetching clinical context:', err);
    }
  };

  useEffect(() => {
    fetchAssessmentData();
  }, [initialPatientId, initialAssessmentId]);

  // Generate Gemini AI Summary
  const handleGenerateAiSummary = async () => {
    if (!patient || !assessment) return;
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const res = await assessmentService.generateAiSummary(patient.id, assessment.id);
      setAssessment(prev => prev ? { ...prev, aiSummary: res.aiSummary } : null);
      setActionSuccessToast('Gemini AI summary generated successfully.');
      setTimeout(() => setActionSuccessToast(null), 4000);
    } catch (err) {
      setAiError(
        err instanceof ApiClientError && err.message 
          ? err.message 
          : 'AI summary generation is currently unavailable. Deterministic rule findings remain active.'
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Run fresh decision engine assessment
  const handleRunNewAssessment = async () => {
    if (!patient) return;
    setIsCreatingNewAssessment(true);
    setAiError(null);
    try {
      const newAssessment = await assessmentService.createAssessment(patient.id);
      setAssessment(newAssessment);
      setActionSuccessToast('Fresh decision engine assessment created.');
      setTimeout(() => setActionSuccessToast(null), 4000);
    } catch (err) {
      setAiError(err instanceof ApiClientError ? err.message : 'Failed to generate new assessment.');
    } finally {
      setIsCreatingNewAssessment(false);
    }
  };

  // Authenticated file viewing
  const handleViewReportFile = async (report: DiagnosticReport) => {
    if (!patient || !report.fileId) return;
    setViewingFileReportId(report.id);
    try {
      const blob = await diagnosticReportService.fetchReportFileBlob(patient.id, report.id);
      const objectUrl = URL.createObjectURL(blob);
      setPreviewModalFile({
        url: objectUrl,
        name: report.fileName || report.reportName,
        type: report.fileContentType || blob.type || 'application/pdf'
      });
    } catch {
      alert('Failed to load report file via authenticated endpoint.');
    } finally {
      setViewingFileReportId(null);
    }
  };

  // Authenticated file download
  const handleDownloadReportFile = async (report: DiagnosticReport) => {
    if (!patient || !report.fileId) return;
    try {
      const blob = await diagnosticReportService.fetchReportFileBlob(patient.id, report.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = report.fileName || `Report_${report.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download report file via authenticated endpoint.');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button type="button" onClick={onBack} style={btnBackStyle}>
          <ArrowLeft size={16} />
          <span>Back to Patient Profile</span>
        </button>
        <div className="glass-panel" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
          <Loader2 size={36} className="animate-spin" color="var(--amber)" />
          <span>Loading doctor assessment workspace & clinical decision Findings...</span>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" onClick={onBack} style={btnBackStyle}>
            <ArrowLeft size={16} />
            <span>Back to Patient Profile</span>
          </button>
          {onNavigateToPatients && (
            <button type="button" onClick={onNavigateToPatients} style={btnBackStyle}>
              <Users size={16} />
              <span>Patient Directory</span>
            </button>
          )}
        </div>
        <div className="glass-panel" style={{ padding: '32px', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'var(--rose-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', color: 'var(--rose)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={24} />
            <span>{error || 'Assessment record not found.'}</span>
          </div>
          <button type="button" onClick={fetchAssessmentData} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--rose)', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RotateCcw size={14} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const highSeverityCount = assessment.findings?.filter(f => f.severity === 'HIGH').length || 0;
  const mediumSeverityCount = assessment.findings?.filter(f => f.severity === 'MEDIUM').length || 0;
  const lowSeverityCount = assessment.findings?.filter(f => f.severity === 'LOW' || f.severity === 'INFORMATIONAL').length || 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Toast Notification */}
      {actionSuccessToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '12px 20px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--emerald)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '13px',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* Navigation & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <button type="button" onClick={onBack} style={btnBackStyle}>
          <ArrowLeft size={16} />
          <span>Back to Patient Clinical Profile</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handleRunNewAssessment}
            disabled={isCreatingNewAssessment}
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--amber)',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
            }}
          >
            {isCreatingNewAssessment ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
            <span>Run Fresh Assessment</span>
          </button>

          {!assessment.aiSummary && (
            <button
              type="button"
              onClick={handleGenerateAiSummary}
              disabled={isGeneratingAi}
              style={{
                padding: '9px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)'
              }}
            >
              {isGeneratingAi ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>Generate AI Summary</span>
            </button>
          )}
        </div>
      </div>

      {/* Patient Clinical Overview Header Card */}
      {patient && (
        <div className="glass-panel" style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderColor: '#bae6fd',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: '#e0f2fe',
                border: '1px solid #bae6fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
                fontSize: '22px',
                fontWeight: 700
              }}>
                {patient.fullName.charAt(0)}
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {patient.fullName}
                  </h2>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--primary-light)', color: '#a5b4fc', border: '1px solid var(--border-accent)' }}>
                    {patient.patientId || 'PAT-RECORD'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} color="var(--text-subtle)" /> DOB: {patient.dateOfBirth} ({patient.gender})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} color="var(--text-subtle)" /> {patient.phone}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={13} color="var(--text-subtle)" /> {patient.email}
                  </span>
                  {patient.bloodGroup && (
                    <span style={{ padding: '1px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 600 }}>
                      Blood Group: {patient.bloodGroup}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>ASSESSMENT STATUS</div>
                <StatusBadge status={assessment.status} />
              </div>
            </div>
          </div>

          {/* Decision-Support Provenance Layer Banner */}
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--amber)', fontWeight: 600 }}>
                <BrainCircuit size={15} /> Layer 1: Rule Engine ({assessment.findings?.length || 0} Findings)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)', fontWeight: 600 }}>
                <Sparkles size={15} /> Layer 2: Gemini AI ({assessment.aiSummary ? 'Active' : 'Not Generated'})
              </span>
            </div>
            <span style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>
              Evaluated: {assessment.createdAt ? new Date(assessment.createdAt).toLocaleString() : 'N/A'}
            </span>
          </div>

          {/* Workflow View Mode Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('ASSESSMENT')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                background: activeTab === 'ASSESSMENT' ? 'var(--amber-light)' : 'transparent',
                color: activeTab === 'ASSESSMENT' ? 'var(--amber)' : 'var(--text-muted)',
                border: activeTab === 'ASSESSMENT' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <BrainCircuit size={16} />
              <span>Decision Support Presentation ({assessment.findings?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CLINICAL_CONTEXT')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                background: activeTab === 'CLINICAL_CONTEXT' ? 'var(--primary-light)' : 'transparent',
                color: activeTab === 'CLINICAL_CONTEXT' ? 'var(--primary)' : 'var(--text-muted)',
                border: activeTab === 'CLINICAL_CONTEXT' ? '1px solid var(--border-accent)' : '1px solid transparent',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Stethoscope size={16} />
              <span>Patient Clinical Records</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('DIAGNOSTIC_FILES')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                background: activeTab === 'DIAGNOSTIC_FILES' ? 'var(--emerald-light)' : 'transparent',
                color: activeTab === 'DIAGNOSTIC_FILES' ? 'var(--emerald)' : 'var(--text-muted)',
                border: activeTab === 'DIAGNOSTIC_FILES' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={16} />
              <span>Diagnostic Reports & Files ({diagnosticReports.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Workflow View Content */}
      {activeTab === 'ASSESSMENT' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px' }}>
          
          {/* Rule Findings Presentation Section */}
          <SectionCard
            title="Deterministic Rule Engine Findings"
            subtitle="Rule-based clinical evaluation generated from patient records (Layer 1)"
            icon={BrainCircuit}
            iconColor="var(--amber)"
            action={
              assessment.findings && assessment.findings.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {highSeverityCount > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--rose-light)', color: 'var(--rose)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                      {highSeverityCount} High Risk
                    </span>
                  )}
                  {mediumSeverityCount > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--amber-light)', color: 'var(--amber)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      {mediumSeverityCount} Medium Risk
                    </span>
                  )}
                  {lowSeverityCount > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--emerald-light)', color: 'var(--emerald)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      {lowSeverityCount} Low/Info
                    </span>
                  )}
                </div>
              ) : undefined
            }
          >
            {assessment.findings && assessment.findings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {assessment.findings.map((finding) => {
                  const isHigh = finding.severity === 'HIGH';

                  return (
                    <div
                      key={finding.id}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-sm)',
                        background: isHigh ? '#fee2e2' : '#ffffff',
                        border: isHigh ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                        borderLeft: isHigh ? '4px solid #ef4444' : '1px solid #e2e8f0',
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
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-color)',
                            letterSpacing: '0.5px'
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

                      <div style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>Source:</span>
                          <strong style={{ color: '#a5b4fc', fontFamily: 'monospace' }}>{finding.source || 'RULE_ENGINE'}</strong>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>
                          Deterministic Evaluation
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={32} color="var(--emerald)" style={{ opacity: 0.8 }} />
                <span style={{ fontSize: '13px' }}>
                  No deterministic rule engine findings triggered for this patient record.
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                  All 5 clinical evaluation rules evaluated cleanly without risk flags.
                </span>
              </div>
            )}
          </SectionCard>

          {/* Gemini AI Summary Presentation Section */}
          <SectionCard
            title="Gemini AI Assistance Layer"
            subtitle="AI summary derived strictly from patient records & rule findings (Layer 2)"
            icon={Sparkles}
            iconColor="var(--cyan)"
            action={
              assessment.aiSummary && (
                <button
                  type="button"
                  onClick={handleGenerateAiSummary}
                  disabled={isGeneratingAi}
                  title="Regenerate AI Summary"
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(6, 182, 212, 0.12)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: 'var(--cyan)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isGeneratingAi ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  <span>Regenerate AI</span>
                </button>
              )
            }
          >
            {aiError && (
              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--amber-light)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--amber)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{aiError}</span>
              </div>
            )}

            {isGeneratingAi ? (
              <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--cyan)' }}>
                <Loader2 size={32} className="animate-spin" />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Synthesizing clinical findings via Gemini AI...</span>
              </div>
            ) : assessment.aiSummary ? (
              <GeminiSummaryViewer summary={assessment.aiSummary} />
            ) : (
              <div style={{ padding: '36px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', color: 'var(--text-muted)' }}>
                <Sparkles size={32} color="var(--cyan)" style={{ opacity: 0.6 }} />
                <span style={{ fontSize: '13px' }}>No AI summary generated for this assessment yet.</span>
                <span style={{ fontSize: '12px', color: 'var(--text-subtle)', maxWidth: '400px', lineHeight: '1.4' }}>
                  Click below to request structured Gemini AI decision-support synthesis based on recorded patient facts.
                </span>
                <button
                  type="button"
                  onClick={handleGenerateAiSummary}
                  disabled={isGeneratingAi}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '4px'
                  }}
                >
                  <Sparkles size={14} />
                  <span>Generate Gemini AI Summary</span>
                </button>
              </div>
            )}
          </SectionCard>

        </div>
      )}

      {/* Patient Clinical Records View */}
      {activeTab === 'CLINICAL_CONTEXT' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Symptoms */}
          <SectionCard title="Symptoms" subtitle="Current reported symptoms" icon={Stethoscope} iconColor="var(--rose)">
            {symptoms.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {symptoms.map(s => (
                  <div key={s.id} style={itemBoxStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{s.name}</strong>
                      <SeverityBadge severity={s.severity} />
                    </div>
                    {s.duration && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Duration: {s.duration}</span>}
                    {s.notes && <p style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '4px' }}>{s.notes}</p>}
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No symptoms recorded.</div>}
          </SectionCard>

          {/* Medical History */}
          <SectionCard title="Medical History" subtitle="Diagnosed conditions" icon={Activity} iconColor="var(--amber)">
            {medicalHistories.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {medicalHistories.map(h => (
                  <div key={h.id} style={itemBoxStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{h.condition}</strong>
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: h.status === 'ACTIVE' ? 'var(--rose-light)' : 'rgba(255,255,255,0.06)', color: h.status === 'ACTIVE' ? 'var(--rose)' : 'var(--text-muted)' }}>
                        {h.status}
                      </span>
                    </div>
                    {h.diagnosedDate && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Diagnosed: {h.diagnosedDate}</span>}
                    {h.description && <p style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '4px' }}>{h.description}</p>}
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No medical history recorded.</div>}
          </SectionCard>

          {/* Allergies */}
          <SectionCard title="Allergies" subtitle="Sensitivities & allergens" icon={ShieldAlert} iconColor="var(--rose)">
            {allergies.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allergies.map(a => (
                  <div key={a.id} style={itemBoxStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{a.allergen}</strong>
                      <SeverityBadge severity={a.severity} />
                    </div>
                    {a.reaction && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reaction: {a.reaction}</span>}
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No allergies recorded.</div>}
          </SectionCard>

          {/* Medications */}
          <SectionCard title="Current Medications" subtitle="Prescribed drugs" icon={Pill} iconColor="var(--emerald)">
            {medications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {medications.map(m => (
                  <div key={m.id} style={itemBoxStyle}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{m.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Dosage: {m.dosage} • Frequency: {m.frequency}</span>
                    {m.notes && <p style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '4px' }}>{m.notes}</p>}
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No medications recorded.</div>}
          </SectionCard>

        </div>
      )}

      {/* Diagnostic Reports & Uploaded Files View */}
      {activeTab === 'DIAGNOSTIC_FILES' && (
        <SectionCard
          title="Diagnostic Lab Reports & File Attachments"
          subtitle="Lab tests, imaging records, and GridFS stored PDF/image files"
          icon={FileText}
          iconColor="var(--emerald)"
        >
          {diagnosticReports.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
              {diagnosticReports.map(r => (
                <div key={r.id} style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{r.reportName}</strong>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                      {r.reportType}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                    <span>Date: {r.testDate}</span>
                    {r.labName && <span>Lab: {r.labName}</span>}
                  </div>

                  {r.summary && (
                    <p style={{ fontSize: '12px', color: 'var(--text-subtle)', lineHeight: '1.4' }}>
                      {r.summary}
                    </p>
                  )}

                  {/* Uploaded File Attachment Card */}
                  {r.fileId ? (
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Paperclip size={14} color="var(--emerald)" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--emerald)' }}>
                            {r.fileName || 'Report_File'}
                          </span>
                          {r.fileSize && (
                            <span style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>
                              {(r.fileSize / 1024).toFixed(1)} KB • GridFS Storage
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleViewReportFile(r)}
                          disabled={viewingFileReportId === r.id}
                          title="Authenticated View"
                          style={fileBtnStyle}
                        >
                          {viewingFileReportId === r.id ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadReportFile(r)}
                          title="Authenticated Download"
                          style={fileBtnStyle}
                        >
                          <Download size={13} />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                      No file uploaded for this report.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No diagnostic lab reports uploaded for this patient.
            </div>
          )}
        </SectionCard>
      )}

      {/* Authenticated File Preview Modal */}
      {previewModalFile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '900px',
            height: '85vh',
            background: 'var(--bg-card, #0b0f19)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--primary-very-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Paperclip size={18} color="var(--emerald)" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {previewModalFile.name} (Authenticated View)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(previewModalFile.url);
                  setPreviewModalFile(null);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, padding: '12px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {previewModalFile.type.includes('image') ? (
                <img src={previewModalFile.url} alt={previewModalFile.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <iframe src={previewModalFile.url} title={previewModalFile.name} style={{ width: '100%', height: '100%', border: 'none' }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Safety Disclaimer Footer */}
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

const btnBackStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' };
const itemBoxStyle: React.CSSProperties = { padding: '12px', borderRadius: 'var(--radius-sm)', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' };
const fileBtnStyle: React.CSSProperties = { padding: '4px 8px', borderRadius: '4px', background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0284c7', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' };
