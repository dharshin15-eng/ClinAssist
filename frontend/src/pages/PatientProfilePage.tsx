import React, { useState, useEffect } from 'react';
import type { 
  Patient, 
  Symptom, 
  MedicalHistory, 
  Allergy, 
  Medication, 
  DiagnosticReport, 
  Assessment,
  SymptomSeverity, 
  HistoryStatus,
  ReportType,
  ReportStatus 
} from '../types';
import { patientService } from '../services/patientService';
import type { PatientRequestDto } from '../services/patientService';
import { 
  symptomService, 
  medicalHistoryService, 
  allergyService, 
  medicationService 
} from '../services/clinicalService';
import type { 
  SymptomRequestDto, 
  MedicalHistoryRequestDto, 
  AllergyRequestDto, 
  MedicationRequestDto 
} from '../services/clinicalService';
import { diagnosticReportService } from '../services/diagnosticReportService';
import type { DiagnosticReportRequestDto } from '../services/diagnosticReportService';
import { assessmentService } from '../services/assessmentService';
import { ApiClientError } from '../services/apiClient';
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
  Pill,
  ShieldAlert,
  Activity,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  Plus,
  RotateCcw,
  FileCheck,
  Sparkles
} from 'lucide-react';

interface PatientProfilePageProps {
  patientId: string; // MongoDB internal ID (e.g. 673f...)
  onBack: () => void;
  onSelectAssessment: (patientId: string, assessmentId: string) => void;
}

interface SectionState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export const PatientProfilePage: React.FC<PatientProfilePageProps> = ({
  patientId,
  onBack,
  onSelectAssessment
}) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState<boolean>(true);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CLINICAL' | 'REPORTS' | 'ASSESSMENTS'>('OVERVIEW');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Independent Fault-Tolerant Section States
  const [symptomsState, setSymptomsState] = useState<SectionState<Symptom>>({ data: [], loading: true, error: null });
  const [historyState, setHistoryState] = useState<SectionState<MedicalHistory>>({ data: [], loading: true, error: null });
  const [allergiesState, setAllergiesState] = useState<SectionState<Allergy>>({ data: [], loading: true, error: null });
  const [medicationsState, setMedicationsState] = useState<SectionState<Medication>>({ data: [], loading: true, error: null });
  const [reportsState, setReportsState] = useState<SectionState<DiagnosticReport>>({ data: [], loading: true, error: null });
  const [assessmentsState, setAssessmentsState] = useState<SectionState<Assessment>>({ data: [], loading: true, error: null });

  const [isCreatingAssessment, setIsCreatingAssessment] = useState<boolean>(false);

  // Patient Edit & Delete Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editDateOfBirth, setEditDateOfBirth] = useState<string>('');
  const [editGender, setEditGender] = useState<string>('MALE');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editBloodGroup, setEditBloodGroup] = useState<string>('O+');

  const [isDeletePatientModalOpen, setIsDeletePatientModalOpen] = useState<boolean>(false);
  const [isDeletingPatient, setIsDeletingPatient] = useState<boolean>(false);

  // Record Modals State
  const [activeModal, setActiveModal] = useState<'NONE' | 'SYMPTOM' | 'HISTORY' | 'ALLERGY' | 'MEDICATION' | 'REPORT'>('NONE');
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isSubmittingRecord, setIsSubmittingRecord] = useState<boolean>(false);
  const [recordModalError, setRecordModalError] = useState<string | null>(null);

  // Delete Record Confirmation State
  const [deleteRecordTarget, setDeleteRecordTarget] = useState<{ type: 'SYMPTOM' | 'HISTORY' | 'ALLERGY' | 'MEDICATION' | 'REPORT'; id: string; name: string } | null>(null);
  const [isDeletingRecord, setIsDeletingRecord] = useState<boolean>(false);

  // Clinical Form Fields
  const [symName, setSymName] = useState<string>('');
  const [symSeverity, setSymSeverity] = useState<SymptomSeverity>('MODERATE');
  const [symDuration, setSymDuration] = useState<string>('');
  const [symNotes, setSymNotes] = useState<string>('');

  const [histCondition, setHistCondition] = useState<string>('');
  const [histStatus, setHistStatus] = useState<HistoryStatus>('ACTIVE');
  const [histDiagnosedDate, setHistDiagnosedDate] = useState<string>('');
  const [histDescription, setHistDescription] = useState<string>('');

  const [allAllergen, setAllAllergen] = useState<string>('');
  const [allReaction, setAllReaction] = useState<string>('');
  const [allSeverity, setAllSeverity] = useState<SymptomSeverity>('MODERATE');
  const [allNotes, setAllNotes] = useState<string>('');

  const [medName, setMedName] = useState<string>('');
  const [medDosage, setMedDosage] = useState<string>('');
  const [medFrequency, setMedFrequency] = useState<string>('');
  const [medNotes, setMedNotes] = useState<string>('');

  // Diagnostic Report Form Fields
  const [repName, setRepName] = useState<string>('');
  const [repType, setRepType] = useState<ReportType>('BLOOD_TEST');
  const [repTestDate, setRepTestDate] = useState<string>('');
  const [repLabName, setRepLabName] = useState<string>('');
  const [repStatus, setRepStatus] = useState<ReportStatus>('COMPLETED');
  const [repSummary, setRepSummary] = useState<string>('');
  const [repReference, setRepReference] = useState<string>('');

  // Independent Section Fetchers
  const fetchSymptoms = async () => {
    setSymptomsState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await symptomService.getSymptoms(patientId);
      setSymptomsState({ data, loading: false, error: null });
    } catch (err) {
      setSymptomsState({ data: [], loading: false, error: err instanceof ApiClientError ? err.message : 'Failed to load symptoms.' });
    }
  };

  const fetchHistory = async () => {
    setHistoryState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await medicalHistoryService.getMedicalHistories(patientId);
      setHistoryState({ data, loading: false, error: null });
    } catch (err) {
      setHistoryState({ data: [], loading: false, error: err instanceof ApiClientError ? err.message : 'Failed to load medical history.' });
    }
  };

  const fetchAllergies = async () => {
    setAllergiesState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await allergyService.getAllergies(patientId);
      setAllergiesState({ data, loading: false, error: null });
    } catch (err) {
      setAllergiesState({ data: [], loading: false, error: err instanceof ApiClientError ? err.message : 'Failed to load allergies.' });
    }
  };

  const fetchMedications = async () => {
    setMedicationsState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await medicationService.getMedications(patientId);
      setMedicationsState({ data, loading: false, error: null });
    } catch (err) {
      setMedicationsState({ data: [], loading: false, error: err instanceof ApiClientError ? err.message : 'Failed to load medications.' });
    }
  };

  const fetchReports = async () => {
    setReportsState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await diagnosticReportService.getReports(patientId);
      setReportsState({ data, loading: false, error: null });
    } catch (err) {
      setReportsState({ data: [], loading: false, error: err instanceof ApiClientError ? err.message : 'Failed to load diagnostic reports.' });
    }
  };

  const fetchAssessments = async () => {
    setAssessmentsState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await assessmentService.getAssessments(patientId);
      setAssessmentsState({ data, loading: false, error: null });
    } catch (err) {
      setAssessmentsState({ data: [], loading: false, error: err instanceof ApiClientError ? err.message : 'Failed to load decision support assessments.' });
    }
  };

  const handleCreateAssessment = async () => {
    setIsCreatingAssessment(true);
    try {
      const newAssessment = await assessmentService.createAssessment(patientId);
      setSuccessToast(`New Decision Support Assessment created.`);
      setTimeout(() => setSuccessToast(null), 4000);
      await fetchAssessments();
      if (onSelectAssessment) {
        onSelectAssessment(patientId, newAssessment.id);
      }
    } catch (err) {
      setSuccessToast(null);
      setAssessmentsState(prev => ({
        ...prev,
        error: err instanceof ApiClientError ? err.message : 'Failed to generate assessment.'
      }));
    } finally {
      setIsCreatingAssessment(false);
    }
  };

  const fetchPatientDetail = async () => {
    setIsLoadingPatient(true);
    setPatientError(null);
    setIsNotFound(false);
    try {
      const data = await patientService.getPatient(patientId);
      setPatient(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setIsNotFound(true);
      } else {
        setPatientError(err instanceof ApiClientError ? err.message : 'Failed to load patient record.');
      }
    } finally {
      setIsLoadingPatient(false);
    }
  };

  useEffect(() => {
    fetchPatientDetail();
    fetchSymptoms();
    fetchHistory();
    fetchAllergies();
    fetchMedications();
    fetchReports();
    fetchAssessments();
  }, [patientId]);

  // Patient Edit Handlers
  const handleOpenEditModal = () => {
    if (!patient) return;
    setEditFullName(patient.fullName || '');
    setEditDateOfBirth(patient.dateOfBirth || '');
    setEditGender(patient.gender || 'MALE');
    setEditPhone(patient.phone || '');
    setEditEmail(patient.email || '');
    setEditAddress(patient.address || '');
    setEditBloodGroup(patient.bloodGroup || 'O+');
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleEditPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setEditError(null);
    if (!editFullName.trim() || !editDateOfBirth || !editPhone.trim()) {
      setEditError('Please fill required fields (Name, Date of Birth, Phone).');
      return;
    }
    setIsSavingEdit(true);
    try {
      const payload: PatientRequestDto = {
        fullName: editFullName.trim(),
        dateOfBirth: editDateOfBirth,
        gender: editGender,
        phone: editPhone.trim(),
        email: editEmail.trim() || undefined,
        address: editAddress.trim() || undefined,
        bloodGroup: editBloodGroup || undefined
      };
      const updated = await patientService.updatePatient(patient.id, payload);
      setPatient(updated);
      setSuccessToast(`Patient ${updated.fullName} updated.`);
      setTimeout(() => setSuccessToast(null), 4000);
      setIsEditModalOpen(false);
    } catch (err) {
      setEditError(err instanceof ApiClientError ? err.message : 'Failed to update patient.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeletePatientConfirm = async () => {
    if (!patient) return;
    setIsDeletingPatient(true);
    try {
      await patientService.deletePatient(patient.id);
      setIsDeletePatientModalOpen(false);
      onBack();
    } catch (err) {
      setPatientError(err instanceof ApiClientError ? err.message : 'Failed to delete patient.');
    } finally {
      setIsDeletingPatient(false);
    }
  };

  // Open Modals
  const openSymptomModal = (symptom?: Symptom) => {
    setRecordModalError(null);
    if (symptom) {
      setModalMode('EDIT');
      setSelectedRecordId(symptom.id);
      setSymName(symptom.name);
      setSymSeverity(symptom.severity);
      setSymDuration(symptom.duration);
      setSymNotes(symptom.notes || '');
    } else {
      setModalMode('CREATE');
      setSelectedRecordId(null);
      setSymName('');
      setSymSeverity('MODERATE');
      setSymDuration('');
      setSymNotes('');
    }
    setActiveModal('SYMPTOM');
  };

  const openHistoryModal = (history?: MedicalHistory) => {
    setRecordModalError(null);
    if (history) {
      setModalMode('EDIT');
      setSelectedRecordId(history.id);
      setHistCondition(history.condition);
      setHistStatus(history.status);
      setHistDiagnosedDate(history.diagnosedDate || '');
      setHistDescription(history.description || '');
    } else {
      setModalMode('CREATE');
      setSelectedRecordId(null);
      setHistCondition('');
      setHistStatus('ACTIVE');
      setHistDiagnosedDate('');
      setHistDescription('');
    }
    setActiveModal('HISTORY');
  };

  const openAllergyModal = (allergy?: Allergy) => {
    setRecordModalError(null);
    if (allergy) {
      setModalMode('EDIT');
      setSelectedRecordId(allergy.id);
      setAllAllergen(allergy.allergen);
      setAllReaction(allergy.reaction || '');
      setAllSeverity(allergy.severity);
      setAllNotes(allergy.notes || '');
    } else {
      setModalMode('CREATE');
      setSelectedRecordId(null);
      setAllAllergen('');
      setAllReaction('');
      setAllSeverity('MODERATE');
      setAllNotes('');
    }
    setActiveModal('ALLERGY');
  };

  const openMedicationModal = (medication?: Medication) => {
    setRecordModalError(null);
    if (medication) {
      setModalMode('EDIT');
      setSelectedRecordId(medication.id);
      setMedName(medication.name);
      setMedDosage(medication.dosage);
      setMedFrequency(medication.frequency);
      setMedNotes(medication.notes || '');
    } else {
      setModalMode('CREATE');
      setSelectedRecordId(null);
      setMedName('');
      setMedDosage('');
      setMedFrequency('');
      setMedNotes('');
    }
    setActiveModal('MEDICATION');
  };

  const openReportModal = (report?: DiagnosticReport) => {
    setRecordModalError(null);
    if (report) {
      setModalMode('EDIT');
      setSelectedRecordId(report.id);
      setRepName(report.reportName);
      setRepType(report.reportType);
      setRepTestDate(report.testDate || '');
      setRepLabName(report.labName || '');
      setRepStatus(report.status);
      setRepSummary(report.summary || '');
      setRepReference(report.reportReference || '');
    } else {
      setModalMode('CREATE');
      setSelectedRecordId(null);
      setRepName('');
      setRepType('BLOOD_TEST');
      setRepTestDate(new Date().toISOString().split('T')[0]);
      setRepLabName('');
      setRepStatus('COMPLETED');
      setRepSummary('');
      setRepReference('');
    }
    setActiveModal('REPORT');
  };

  const closeModal = () => {
    setActiveModal('NONE');
    setRecordModalError(null);
  };

  // Submit Handlers
  const handleSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symName.trim() || !symDuration.trim()) {
      setRecordModalError('Symptom name and duration are required.');
      return;
    }
    setIsSubmittingRecord(true);
    setRecordModalError(null);
    try {
      const payload: SymptomRequestDto = { name: symName.trim(), severity: symSeverity, duration: symDuration.trim(), notes: symNotes.trim() || undefined };
      if (modalMode === 'CREATE') {
        await symptomService.createSymptom(patientId, payload);
        setSuccessToast(`Symptom "${payload.name}" recorded.`);
      } else if (selectedRecordId) {
        await symptomService.updateSymptom(patientId, selectedRecordId, payload);
        setSuccessToast(`Symptom "${payload.name}" updated.`);
      }
      setTimeout(() => setSuccessToast(null), 4000);
      closeModal();
      await fetchSymptoms();
    } catch (err) {
      setRecordModalError(err instanceof ApiClientError ? err.message : 'Failed to save symptom.');
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  const handleHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!histCondition.trim()) {
      setRecordModalError('Medical condition is required.');
      return;
    }
    setIsSubmittingRecord(true);
    setRecordModalError(null);
    try {
      const payload: MedicalHistoryRequestDto = { condition: histCondition.trim(), status: histStatus, diagnosedDate: histDiagnosedDate || undefined, description: histDescription.trim() || undefined };
      if (modalMode === 'CREATE') {
        await medicalHistoryService.createMedicalHistory(patientId, payload);
        setSuccessToast(`Medical condition "${payload.condition}" recorded.`);
      } else if (selectedRecordId) {
        await medicalHistoryService.updateMedicalHistory(patientId, selectedRecordId, payload);
        setSuccessToast(`Medical condition "${payload.condition}" updated.`);
      }
      setTimeout(() => setSuccessToast(null), 4000);
      closeModal();
      await fetchHistory();
    } catch (err) {
      setRecordModalError(err instanceof ApiClientError ? err.message : 'Failed to save condition.');
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  const handleAllergySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAllergen.trim() || !allReaction.trim()) {
      setRecordModalError('Allergen and reaction are required.');
      return;
    }
    setIsSubmittingRecord(true);
    setRecordModalError(null);
    try {
      const payload: AllergyRequestDto = { allergen: allAllergen.trim(), reaction: allReaction.trim(), severity: allSeverity, notes: allNotes.trim() || undefined };
      if (modalMode === 'CREATE') {
        await allergyService.createAllergy(patientId, payload);
        setSuccessToast(`Allergy "${payload.allergen}" recorded.`);
      } else if (selectedRecordId) {
        await allergyService.updateAllergy(patientId, selectedRecordId, payload);
        setSuccessToast(`Allergy "${payload.allergen}" updated.`);
      }
      setTimeout(() => setSuccessToast(null), 4000);
      closeModal();
      await fetchAllergies();
    } catch (err) {
      setRecordModalError(err instanceof ApiClientError ? err.message : 'Failed to save allergy.');
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  const handleMedicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !medDosage.trim() || !medFrequency.trim()) {
      setRecordModalError('Medication name, dosage, and frequency are required.');
      return;
    }
    setIsSubmittingRecord(true);
    setRecordModalError(null);
    try {
      const payload: MedicationRequestDto = { name: medName.trim(), dosage: medDosage.trim(), frequency: medFrequency.trim(), notes: medNotes.trim() || undefined };
      if (modalMode === 'CREATE') {
        await medicationService.createMedication(patientId, payload);
        setSuccessToast(`Medication "${payload.name}" prescribed.`);
      } else if (selectedRecordId) {
        await medicationService.updateMedication(patientId, selectedRecordId, payload);
        setSuccessToast(`Medication "${payload.name}" updated.`);
      }
      setTimeout(() => setSuccessToast(null), 4000);
      closeModal();
      await fetchMedications();
    } catch (err) {
      setRecordModalError(err instanceof ApiClientError ? err.message : 'Failed to save medication.');
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName.trim() || !repTestDate) {
      setRecordModalError('Report name and test date are required.');
      return;
    }
    setIsSubmittingRecord(true);
    setRecordModalError(null);
    try {
      const payload: DiagnosticReportRequestDto = {
        reportName: repName.trim(),
        reportType: repType,
        testDate: repTestDate,
        labName: repLabName.trim() || undefined,
        status: repStatus,
        summary: repSummary.trim() || undefined,
        reportReference: repReference.trim() || undefined
      };
      if (modalMode === 'CREATE') {
        await diagnosticReportService.createReport(patientId, payload);
        setSuccessToast(`Diagnostic report "${payload.reportName}" uploaded.`);
      } else if (selectedRecordId) {
        await diagnosticReportService.updateReport(patientId, selectedRecordId, payload);
        setSuccessToast(`Diagnostic report "${payload.reportName}" updated.`);
      }
      setTimeout(() => setSuccessToast(null), 4000);
      closeModal();
      await fetchReports();
    } catch (err) {
      setRecordModalError(err instanceof ApiClientError ? err.message : 'Failed to save diagnostic report.');
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  // Delete Record Execution
  const handleDeleteRecordConfirm = async () => {
    if (!deleteRecordTarget) return;
    setIsDeletingRecord(true);
    try {
      const { type, id, name } = deleteRecordTarget;
      if (type === 'SYMPTOM') {
        await symptomService.deleteSymptom(patientId, id);
        await fetchSymptoms();
      } else if (type === 'HISTORY') {
        await medicalHistoryService.deleteMedicalHistory(patientId, id);
        await fetchHistory();
      } else if (type === 'ALLERGY') {
        await allergyService.deleteAllergy(patientId, id);
        await fetchAllergies();
      } else if (type === 'MEDICATION') {
        await medicationService.deleteMedication(patientId, id);
        await fetchMedications();
      } else if (type === 'REPORT') {
        await diagnosticReportService.deleteReport(patientId, id);
        await fetchReports();
      }
      setSuccessToast(`Deleted record "${name}".`);
      setTimeout(() => setSuccessToast(null), 4000);
      setDeleteRecordTarget(null);
    } catch (err) {
      setSuccessToast(null);
    } finally {
      setIsDeletingRecord(false);
    }
  };

  // Total Item Counts
  const totalClinicalCount = symptomsState.data.length + historyState.data.length + allergiesState.data.length + medicationsState.data.length;

  if (isLoadingPatient) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button type="button" onClick={onBack} style={btnBackStyle}>
          <ArrowLeft size={16} />
          <span>Back to Patients Directory</span>
        </button>
        <div className="glass-panel" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
          <Loader2 size={36} className="animate-pulse-slow" color="var(--primary)" />
          <span>Loading patient profile...</span>
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button type="button" onClick={onBack} style={btnBackStyle}>
          <ArrowLeft size={16} />
          <span>Back to Patients Directory</span>
        </button>
        <div className="glass-panel" style={{ padding: '40px', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'var(--rose-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', color: 'var(--rose)' }}>
          <AlertCircle size={40} />
          <h3>Patient Record Not Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>No patient record exists with MongoDB ID: <code style={{ color: '#a5b4fc' }}>{patientId}</code></p>
          <button type="button" onClick={onBack} style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Return to Directory</button>
        </div>
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button type="button" onClick={onBack} style={btnBackStyle}>
          <ArrowLeft size={16} />
          <span>Back to Patients Directory</span>
        </button>
        <div className="glass-panel" style={{ padding: '32px', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'var(--rose-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', color: 'var(--rose)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={24} />
            <span>{patientError || 'Failed to load patient.'}</span>
          </div>
          <button type="button" onClick={fetchPatientDetail} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--rose)', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Toast Notification */}
      {successToast && (
        <div style={{ padding: '14px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--emerald-light)', border: '1px solid rgba(16, 185, 129, 0.4)', color: 'var(--emerald)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }} className="animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button type="button" onClick={onBack} style={btnBackStyle}>
          <ArrowLeft size={16} />
          <span>Back to Patients Directory</span>
        </button>

        <div className="glass-panel" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(18, 26, 43, 0.9) 0%, rgba(11, 15, 25, 0.9) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--cyan) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '24px', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)' }}>
              {patient.fullName.charAt(0)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>{patient.fullName}</h2>
                <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', background: 'var(--emerald-light)', color: 'var(--emerald)', border: '1px solid rgba(16, 185, 129, 0.3)', fontFamily: 'monospace' }}>
                  {patient.patientId || 'PAT-RECORD'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /><span>DOB: {patient.dateOfBirth} ({patient.gender})</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /><span>Blood: <strong>{patient.bloodGroup || 'Unspecified'}</strong></span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /><span>{patient.phone}</span></div>
                {patient.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /><span>{patient.email}</span></div>}
              </div>

              {patient.address && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-subtle)' }}><MapPin size={14} /><span>Address: {patient.address}</span></div>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button type="button" onClick={handleOpenEditModal} style={btnEditStyle}><Edit size={14} /><span>Edit Profile</span></button>
              <button type="button" onClick={() => setIsDeletePatientModalOpen(true)} style={btnDeleteStyle}><Trash2 size={14} /><span>Delete Patient</span></button>
            </div>
            <div style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
              Mongo ID: <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{patient.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {[
          { id: 'OVERVIEW', label: 'Overview & Summary', icon: Activity },
          { id: 'CLINICAL', label: `Clinical Records (${totalClinicalCount})`, icon: Stethoscope },
          { id: 'REPORTS', label: `Diagnostic Reports (${reportsState.data.length})`, icon: FileText },
          { id: 'ASSESSMENTS', label: `Assessments (${assessmentsState.data.length})`, icon: BrainCircuit }
        ].map(t => (
          <button key={t.id} type="button" onClick={() => setActiveTab(t.id as any)} style={{ padding: '10px 18px', borderRadius: 'var(--radius-sm)', background: activeTab === t.id ? 'var(--primary-light)' : 'transparent', border: activeTab === t.id ? '1px solid var(--border-accent)' : '1px solid transparent', color: activeTab === t.id ? '#fff' : 'var(--text-muted)', fontSize: '13px', fontWeight: activeTab === t.id ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <t.icon size={16} color={activeTab === t.id ? 'var(--primary)' : 'var(--text-subtle)'} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* 4 CLINICAL SECTIONS GRID (Fault Tolerant Independent Render) */}
      {(activeTab === 'OVERVIEW' || activeTab === 'CLINICAL') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
          
          {/* 1. SYMPTOMS SECTION */}
          <SectionCard
            title="Reported Symptoms"
            icon={Stethoscope}
            iconColor="var(--rose)"
            action={
              <button type="button" onClick={() => openSymptomModal()} style={btnAddStyle}>
                <Plus size={14} />
                <span>Add Symptom</span>
              </button>
            }
          >
            {symptomsState.loading ? (
              <div style={sectionLoadingStyle}><Loader2 size={20} className="animate-pulse-slow" /><span>Loading symptoms...</span></div>
            ) : symptomsState.error ? (
              <div style={sectionErrorStyle}>
                <span>{symptomsState.error}</span>
                <button type="button" onClick={fetchSymptoms} style={btnRetryStyle}><RotateCcw size={12} /><span>Retry</span></button>
              </div>
            ) : symptomsState.data.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {symptomsState.data.map((s) => (
                  <div key={s.id} style={recordCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SeverityBadge severity={s.severity} />
                        <button type="button" onClick={() => openSymptomModal(s)} style={btnIconStyle} title="Edit"><Edit size={14} /></button>
                        <button type="button" onClick={() => setDeleteRecordTarget({ type: 'SYMPTOM', id: s.id, name: s.name })} style={btnDangerIconStyle} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Duration: <strong>{s.duration}</strong></div>
                    {s.notes && <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>Notes: {s.notes}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No symptoms recorded for this patient yet." />
            )}
          </SectionCard>

          {/* 2. MEDICAL HISTORY SECTION */}
          <SectionCard
            title="Active Medical History"
            icon={Activity}
            iconColor="var(--amber)"
            action={
              <button type="button" onClick={() => openHistoryModal()} style={btnAddStyle}>
                <Plus size={14} />
                <span>Add Condition</span>
              </button>
            }
          >
            {historyState.loading ? (
              <div style={sectionLoadingStyle}><Loader2 size={20} className="animate-pulse-slow" /><span>Loading medical history...</span></div>
            ) : historyState.error ? (
              <div style={sectionErrorStyle}>
                <span>{historyState.error}</span>
                <button type="button" onClick={fetchHistory} style={btnRetryStyle}><RotateCcw size={12} /><span>Retry</span></button>
              </div>
            ) : historyState.data.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {historyState.data.map((h) => (
                  <div key={h.id} style={recordCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{h.condition}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StatusBadge status={h.status} />
                        <button type="button" onClick={() => openHistoryModal(h)} style={btnIconStyle} title="Edit"><Edit size={14} /></button>
                        <button type="button" onClick={() => setDeleteRecordTarget({ type: 'HISTORY', id: h.id, name: h.condition })} style={btnDangerIconStyle} title="Delete"><Trash2 size={14} /></button>
                      </div>
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

          {/* 3. ALLERGIES SECTION */}
          <SectionCard
            title="Documented Allergies"
            icon={ShieldAlert}
            iconColor="var(--rose)"
            action={
              <button type="button" onClick={() => openAllergyModal()} style={btnAddStyle}>
                <Plus size={14} />
                <span>Add Allergy</span>
              </button>
            }
          >
            {allergiesState.loading ? (
              <div style={sectionLoadingStyle}><Loader2 size={20} className="animate-pulse-slow" /><span>Loading allergies...</span></div>
            ) : allergiesState.error ? (
              <div style={sectionErrorStyle}>
                <span>{allergiesState.error}</span>
                <button type="button" onClick={fetchAllergies} style={btnRetryStyle}><RotateCcw size={12} /><span>Retry</span></button>
              </div>
            ) : allergiesState.data.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allergiesState.data.map((a) => (
                  <div key={a.id} style={{ ...recordCardStyle, background: 'var(--rose-light)', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--rose)' }}>{a.allergen}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SeverityBadge severity={a.severity} />
                        <button type="button" onClick={() => openAllergyModal(a)} style={btnIconStyle} title="Edit"><Edit size={14} /></button>
                        <button type="button" onClick={() => setDeleteRecordTarget({ type: 'ALLERGY', id: a.id, name: a.allergen })} style={btnDangerIconStyle} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    {a.reaction && <div style={{ fontSize: '12px', color: 'var(--text-main)' }}>Reaction: <strong>{a.reaction}</strong></div>}
                    {a.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Notes: {a.notes}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No allergies documented for this patient." />
            )}
          </SectionCard>

          {/* 4. CURRENT MEDICATIONS SECTION */}
          <SectionCard
            title="Current Medications"
            icon={Pill}
            iconColor="var(--cyan)"
            action={
              <button type="button" onClick={() => openMedicationModal()} style={btnAddStyle}>
                <Plus size={14} />
                <span>Add Medication</span>
              </button>
            }
          >
            {medicationsState.loading ? (
              <div style={sectionLoadingStyle}><Loader2 size={20} className="animate-pulse-slow" /><span>Loading medications...</span></div>
            ) : medicationsState.error ? (
              <div style={sectionErrorStyle}>
                <span>{medicationsState.error}</span>
                <button type="button" onClick={fetchMedications} style={btnRetryStyle}><RotateCcw size={12} /><span>Retry</span></button>
              </div>
            ) : medicationsState.data.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {medicationsState.data.map((m) => (
                  <div key={m.id} style={recordCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cyan)' }}>{m.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button type="button" onClick={() => openMedicationModal(m)} style={btnIconStyle} title="Edit"><Edit size={14} /></button>
                        <button type="button" onClick={() => setDeleteRecordTarget({ type: 'MEDICATION', id: m.id, name: m.name })} style={btnDangerIconStyle} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-main)' }}>Dosage: <strong>{m.dosage}</strong> • Frequency: {m.frequency}</div>
                    {m.notes && <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Notes: {m.notes}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No current medications prescribed." />
            )}
          </SectionCard>

        </div>
      )}

      {/* DIAGNOSTIC REPORTS SECTION (Live API Integration) */}
      {(activeTab === 'OVERVIEW' || activeTab === 'REPORTS') && (
        <SectionCard
          title="Diagnostic & Laboratory Reports"
          icon={FileText}
          iconColor="var(--primary)"
          action={
            <button type="button" onClick={() => openReportModal()} style={btnAddStyle}>
              <Plus size={14} />
              <span>Add Diagnostic Report</span>
            </button>
          }
        >
          {reportsState.loading ? (
            <div style={sectionLoadingStyle}><Loader2 size={20} className="animate-pulse-slow" /><span>Loading diagnostic reports...</span></div>
          ) : reportsState.error ? (
            <div style={sectionErrorStyle}>
              <span>{reportsState.error}</span>
              <button type="button" onClick={fetchReports} style={btnRetryStyle}><RotateCcw size={12} /><span>Retry Reports</span></button>
            </div>
          ) : reportsState.data.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reportsState.data.map((r) => (
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
                      <FileCheck size={18} color="var(--primary)" />
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>{r.reportName}</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#a5b4fc',
                        border: '1px solid var(--border-accent)'
                      }}>
                        {r.reportType}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <StatusBadge status={r.status} />
                      <button type="button" onClick={() => openReportModal(r)} style={btnIconStyle} title="Edit Report"><Edit size={14} /></button>
                      <button type="button" onClick={() => setDeleteRecordTarget({ type: 'REPORT', id: r.id, name: r.reportName })} style={btnDangerIconStyle} title="Delete Report"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span>Test Date: <strong>{r.testDate}</strong></span>
                    {r.labName && <span>Laboratory: <strong>{r.labName}</strong></span>}
                    {r.reportReference && <span>Ref: <strong style={{ fontFamily: 'monospace' }}>{r.reportReference}</strong></span>}
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

      {/* CLINICAL DECISION-SUPPORT ASSESSMENTS SECTION (Live API Integration) */}
      {(activeTab === 'OVERVIEW' || activeTab === 'ASSESSMENTS') && (
        <SectionCard
          title="Clinical Decision-Support Assessments"
          icon={BrainCircuit}
          iconColor="var(--amber)"
          action={
            <button
              type="button"
              onClick={handleCreateAssessment}
              disabled={isCreatingAssessment}
              style={btnAddStyle}
            >
              {isCreatingAssessment ? (
                <Loader2 size={14} className="animate-pulse-slow" />
              ) : (
                <Plus size={14} />
              )}
              <span>Run Assessment</span>
            </button>
          }
        >
          {assessmentsState.loading ? (
            <div style={sectionLoadingStyle}>
              <Loader2 size={20} className="animate-pulse-slow" />
              <span>Evaluating clinical decision rules...</span>
            </div>
          ) : assessmentsState.error ? (
            <div style={sectionErrorStyle}>
              <span>{assessmentsState.error}</span>
              <button type="button" onClick={fetchAssessments} style={btnRetryStyle}>
                <RotateCcw size={12} />
                <span>Retry</span>
              </button>
            </div>
          ) : assessmentsState.data.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {assessmentsState.data.map((assessment) => (
                <div
                  key={assessment.id}
                  onClick={() => onSelectAssessment && onSelectAssessment(patientId, assessment.id)}
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(11, 15, 25, 0.6)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <BrainCircuit size={20} color="var(--amber)" />
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                        Assessment #{assessment.id.slice(-8)}
                      </span>
                      <StatusBadge status={assessment.status} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {assessment.aiSummary ? (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(6, 182, 212, 0.15)',
                          color: 'var(--cyan)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Sparkles size={12} />
                          AI Summary Available
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: 'var(--text-subtle)',
                          border: '1px solid var(--border-color)'
                        }}>
                          Rule Engine Only
                        </span>
                      )}
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
                        View Details &rarr;
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <span>Findings: <strong style={{ color: '#fff' }}>{assessment.findings?.length || 0} rules triggered</strong></span>
                    {assessment.createdAt && <span>Created: <strong>{new Date(assessment.createdAt).toLocaleString()}</strong></span>}
                    {assessment.createdBy && <span>Evaluator: <strong>{assessment.createdBy}</strong></span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No decision-support assessments generated for this patient yet. Click 'Run Assessment' to evaluate clinical rules." />
          )}
        </SectionCard>
      )}

      {/* RECORD MODALS */}
      {activeModal !== 'NONE' && (
        <div style={modalOverlayStyle} className="animate-fade-in">
          <div className="glass-panel" style={modalBoxStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                {modalMode === 'CREATE' ? 'Add' : 'Edit'} {activeModal === 'SYMPTOM' ? 'Symptom' : activeModal === 'HISTORY' ? 'Medical Condition' : activeModal === 'ALLERGY' ? 'Allergy' : activeModal === 'MEDICATION' ? 'Medication' : 'Diagnostic Report'}
              </h3>
              <button type="button" onClick={closeModal} style={btnIconStyle}><X size={20} /></button>
            </div>

            {recordModalError && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--rose-light)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--rose)', fontSize: '13px' }}>
                {recordModalError}
              </div>
            )}

            {/* SYMPTOM FORM */}
            {activeModal === 'SYMPTOM' && (
              <form onSubmit={handleSymptomSubmit} style={formStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Symptom Name *</label>
                  <input type="text" required value={symName} onChange={e => setSymName(e.target.value)} placeholder="e.g. High Fever" style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Severity *</label>
                    <select value={symSeverity} onChange={e => setSymSeverity(e.target.value as SymptomSeverity)} style={inputStyle}>
                      <option value="MILD">Mild</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="SEVERE">Severe</option>
                    </select>
                  </div>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Duration *</label>
                    <input type="text" required value={symDuration} onChange={e => setSymDuration(e.target.value)} placeholder="e.g. 3 days" style={inputStyle} />
                  </div>
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Clinical Notes (Optional)</label>
                  <input type="text" value={symNotes} onChange={e => setSymNotes(e.target.value)} placeholder="e.g. Accompanied by chills" style={inputStyle} />
                </div>
                <ModalButtons isSubmitting={isSubmittingRecord} onCancel={closeModal} submitText={modalMode === 'CREATE' ? 'Save Symptom' : 'Update Symptom'} />
              </form>
            )}

            {/* MEDICAL HISTORY FORM */}
            {activeModal === 'HISTORY' && (
              <form onSubmit={handleHistorySubmit} style={formStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Condition *</label>
                  <input type="text" required value={histCondition} onChange={e => setHistCondition(e.target.value)} placeholder="e.g. Type 2 Diabetes" style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Status *</label>
                    <select value={histStatus} onChange={e => setHistStatus(e.target.value as HistoryStatus)} style={inputStyle}>
                      <option value="ACTIVE">Active</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="UNKNOWN">Unknown</option>
                    </select>
                  </div>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Diagnosed Date</label>
                    <input type="date" value={histDiagnosedDate} onChange={e => setHistDiagnosedDate(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Description (Optional)</label>
                  <input type="text" value={histDescription} onChange={e => setHistDescription(e.target.value)} placeholder="e.g. Managed with insulin" style={inputStyle} />
                </div>
                <ModalButtons isSubmitting={isSubmittingRecord} onCancel={closeModal} submitText={modalMode === 'CREATE' ? 'Save Condition' : 'Update Condition'} />
              </form>
            )}

            {/* ALLERGY FORM */}
            {activeModal === 'ALLERGY' && (
              <form onSubmit={handleAllergySubmit} style={formStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Allergen *</label>
                  <input type="text" required value={allAllergen} onChange={e => setAllAllergen(e.target.value)} placeholder="e.g. Penicillin" style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Reaction *</label>
                    <input type="text" required value={allReaction} onChange={e => setAllReaction(e.target.value)} placeholder="e.g. Skin Hives" style={inputStyle} />
                  </div>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Severity *</label>
                    <select value={allSeverity} onChange={e => setAllSeverity(e.target.value as SymptomSeverity)} style={inputStyle}>
                      <option value="MILD">Mild</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="SEVERE">Severe</option>
                    </select>
                  </div>
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Notes (Optional)</label>
                  <input type="text" value={allNotes} onChange={e => setAllNotes(e.target.value)} placeholder="e.g. Anaphylaxis risk" style={inputStyle} />
                </div>
                <ModalButtons isSubmitting={isSubmittingRecord} onCancel={closeModal} submitText={modalMode === 'CREATE' ? 'Save Allergy' : 'Update Allergy'} />
              </form>
            )}

            {/* MEDICATION FORM */}
            {activeModal === 'MEDICATION' && (
              <form onSubmit={handleMedicationSubmit} style={formStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Medication Name *</label>
                  <input type="text" required value={medName} onChange={e => setMedName(e.target.value)} placeholder="e.g. Amoxicillin" style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Dosage *</label>
                    <input type="text" required value={medDosage} onChange={e => setMedDosage(e.target.value)} placeholder="e.g. 500mg" style={inputStyle} />
                  </div>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Frequency *</label>
                    <input type="text" required value={medFrequency} onChange={e => setMedFrequency(e.target.value)} placeholder="e.g. Twice daily" style={inputStyle} />
                  </div>
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Prescription Notes (Optional)</label>
                  <input type="text" value={medNotes} onChange={e => setMedNotes(e.target.value)} placeholder="e.g. Take with food" style={inputStyle} />
                </div>
                <ModalButtons isSubmitting={isSubmittingRecord} onCancel={closeModal} submitText={modalMode === 'CREATE' ? 'Prescribe Medication' : 'Update Medication'} />
              </form>
            )}

            {/* DIAGNOSTIC REPORT FORM */}
            {activeModal === 'REPORT' && (
              <form onSubmit={handleReportSubmit} style={formStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Report Name *</label>
                  <input type="text" required value={repName} onChange={e => setRepName(e.target.value)} placeholder="e.g. Complete Blood Count (CBC)" style={inputStyle} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Report Type *</label>
                    <select value={repType} onChange={e => setRepType(e.target.value as ReportType)} style={inputStyle}>
                      <option value="BLOOD_TEST">Blood Test</option>
                      <option value="URINE_TEST">Urine Test</option>
                      <option value="IMAGING">Imaging</option>
                      <option value="X_RAY">X-Ray</option>
                      <option value="CT_SCAN">CT Scan</option>
                      <option value="MRI">MRI</option>
                      <option value="ULTRASOUND">Ultrasound</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Test Date *</label>
                    <input type="date" required value={repTestDate} onChange={e => setRepTestDate(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Processing Status *</label>
                    <select value={repStatus} onChange={e => setRepStatus(e.target.value as ReportStatus)} style={inputStyle}>
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="REVIEWED">Reviewed</option>
                    </select>
                  </div>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Laboratory Name</label>
                    <input type="text" value={repLabName} onChange={e => setRepLabName(e.target.value)} placeholder="e.g. Central Diagnostics Lab" style={inputStyle} />
                  </div>
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Report Reference Number</label>
                  <input type="text" value={repReference} onChange={e => setRepReference(e.target.value)} placeholder="e.g. REF-LAB-2026-901" style={inputStyle} />
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Clinical Findings & Summary</label>
                  <textarea
                    rows={3}
                    value={repSummary}
                    onChange={e => setRepSummary(e.target.value)}
                    placeholder="e.g. Hemoglobin 14.2 g/dL, WBC 6,500 /mcL within normal limits..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <ModalButtons isSubmitting={isSubmittingRecord} onCancel={closeModal} submitText={modalMode === 'CREATE' ? 'Upload Diagnostic Report' : 'Update Diagnostic Report'} />
              </form>
            )}

          </div>
        </div>
      )}

      {/* EDIT PATIENT DEMOGRAPHICS MODAL */}
      {isEditModalOpen && (
        <div style={modalOverlayStyle} className="animate-fade-in">
          <div className="glass-panel" style={modalBoxStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Edit Patient Details</h3>
              <button type="button" onClick={() => setIsEditModalOpen(false)} style={btnIconStyle}><X size={20} /></button>
            </div>
            {editError && <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--rose-light)', color: 'var(--rose)', fontSize: '13px' }}>{editError}</div>}
            <form onSubmit={handleEditPatientSubmit} style={formStyle}>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Full Name *</label>
                <input type="text" required value={editFullName} onChange={e => setEditFullName(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={fieldGroupStyle}><label style={labelStyle}>Date of Birth *</label><input type="date" required value={editDateOfBirth} onChange={e => setEditDateOfBirth(e.target.value)} style={inputStyle} /></div>
                <div style={fieldGroupStyle}><label style={labelStyle}>Gender *</label><select value={editGender} onChange={e => setEditGender(e.target.value)} style={inputStyle}><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={fieldGroupStyle}><label style={labelStyle}>Phone *</label><input type="text" required value={editPhone} onChange={e => setEditPhone(e.target.value)} style={inputStyle} /></div>
                <div style={fieldGroupStyle}><label style={labelStyle}>Blood Group</label><select value={editBloodGroup} onChange={e => setEditBloodGroup(e.target.value)} style={inputStyle}><option value="O+">O+</option><option value="O-">O-</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option></select></div>
              </div>
              <div style={fieldGroupStyle}><label style={labelStyle}>Email</label><input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={inputStyle} /></div>
              <div style={fieldGroupStyle}><label style={labelStyle}>Address</label><input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} style={inputStyle} /></div>
              <ModalButtons isSubmitting={isSavingEdit} onCancel={() => setIsEditModalOpen(false)} submitText="Save Changes" />
            </form>
          </div>
        </div>
      )}

      {/* DELETE RECORD CONFIRMATION MODAL */}
      {deleteRecordTarget && (
        <div style={modalOverlayStyle} className="animate-fade-in">
          <div className="glass-panel" style={{ ...modalBoxStyle, maxWidth: '440px', borderColor: 'rgba(244, 63, 94, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--rose)' }}>
              <Trash2 size={24} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Delete Record</h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-main)' }}>
              Are you sure you want to delete <strong style={{ color: 'var(--rose)' }}>{deleteRecordTarget.name}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button type="button" onClick={() => setDeleteRecordTarget(null)} disabled={isDeletingRecord} style={btnCancelStyle}>Cancel</button>
              <button type="button" onClick={handleDeleteRecordConfirm} disabled={isDeletingRecord} style={btnSubmitDangerStyle}>
                {isDeletingRecord ? <Loader2 size={16} className="animate-pulse-slow" /> : <Trash2 size={16} />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PATIENT CONFIRMATION MODAL */}
      {isDeletePatientModalOpen && (
        <div style={modalOverlayStyle} className="animate-fade-in">
          <div className="glass-panel" style={{ ...modalBoxStyle, maxWidth: '440px', borderColor: 'rgba(244, 63, 94, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--rose)' }}>
              <Trash2 size={24} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Delete Patient</h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-main)' }}>
              Are you sure you want to delete <strong style={{ color: 'var(--rose)' }}>{patient.fullName}</strong> ({patient.patientId})?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button type="button" onClick={() => setIsDeletePatientModalOpen(false)} disabled={isDeletingPatient} style={btnCancelStyle}>Cancel</button>
              <button type="button" onClick={handleDeletePatientConfirm} disabled={isDeletingPatient} style={btnSubmitDangerStyle}>
                {isDeletingPatient ? <Loader2 size={16} className="animate-pulse-slow" /> : <Trash2 size={16} />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Reusable Helper Components & Styles
const ModalButtons: React.FC<{ isSubmitting: boolean; onCancel: () => void; submitText: string }> = ({ isSubmitting, onCancel, submitText }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
    <button type="button" onClick={onCancel} disabled={isSubmitting} style={btnCancelStyle}>Cancel</button>
    <button type="submit" disabled={isSubmitting} style={btnSubmitStyle}>
      {isSubmitting ? <Loader2 size={16} className="animate-pulse-slow" /> : <CheckCircle2 size={16} />}
      <span>{submitText}</span>
    </button>
  </div>
);

const btnBackStyle: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'fit-content' };
const btnEditStyle: React.CSSProperties = { padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', border: '1px solid var(--border-accent)', color: '#a5b4fc', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' };
const btnDeleteStyle: React.CSSProperties = { padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--rose-light)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--rose)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' };
const btnAddStyle: React.CSSProperties = { padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', border: '1px solid var(--border-accent)', color: '#a5b4fc', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' };
const btnIconStyle: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '4px' };
const btnDangerIconStyle: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', padding: '4px', borderRadius: '4px' };
const btnRetryStyle: React.CSSProperties = { padding: '4px 10px', borderRadius: '4px', background: 'var(--rose)', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' };
const btnCancelStyle: React.CSSProperties = { padding: '10px 18px', borderRadius: 'var(--radius-sm)', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' };
const btnSubmitStyle: React.CSSProperties = { padding: '10px 22px', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' };
const btnSubmitDangerStyle: React.CSSProperties = { padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--rose)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)' };

const recordCardStyle: React.CSSProperties = { padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(11, 15, 25, 0.6)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' };
const sectionLoadingStyle: React.CSSProperties = { padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '13px' };
const sectionErrorStyle: React.CSSProperties = { padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--rose-light)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--rose)', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' };

const modalOverlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(5, 8, 15, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalBoxStyle: React.CSSProperties = { width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)' };
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '16px' };
const fieldGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' };
const inputStyle: React.CSSProperties = { padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(11, 15, 25, 0.8)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' };
