export type Role = 'ADMIN' | 'HOSPITAL_STAFF' | 'DOCTOR';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface Patient {
  id: string;
  patientId: string; // Business identifier PAT-XXXX
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SymptomSeverity = 'MILD' | 'MODERATE' | 'SEVERE';

export interface Symptom {
  id: string;
  patientId: string;
  name: string;
  severity: SymptomSeverity;
  duration: string;
  notes?: string;
  createdAt?: string;
}

export type HistoryStatus = 'ACTIVE' | 'RESOLVED' | 'UNKNOWN';

export interface MedicalHistory {
  id: string;
  patientId: string;
  condition: string;
  description?: string;
  diagnosedDate?: string;
  status: HistoryStatus;
}

export interface Allergy {
  id: string;
  patientId: string;
  allergen: string;
  reaction?: string;
  severity: SymptomSeverity;
  notes?: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
}

export type ReportType = 'BLOOD_TEST' | 'URINE_TEST' | 'IMAGING' | 'X_RAY' | 'CT_SCAN' | 'MRI' | 'ULTRASOUND' | 'OTHER';
export type ReportStatus = 'PENDING' | 'COMPLETED' | 'REVIEWED';

export interface DiagnosticReport {
  id: string;
  patientId: string;
  reportName: string;
  reportType: ReportType;
  testDate: string;
  labName?: string;
  status: ReportStatus;
  summary?: string;
  reportReference?: string;
}

export type AssessmentStatus = 'DRAFT' | 'COMPLETED' | 'REVIEWED';
export type FindingCategory = 'SYMPTOM' | 'MEDICAL_HISTORY' | 'ALLERGY' | 'MEDICATION' | 'DIAGNOSTIC_REPORT' | 'GENERAL';
export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'INFORMATIONAL';
export type FindingSource = 'PATIENT_RECORD' | 'RULE_ENGINE';

export interface AssessmentFinding {
  id: string;
  assessmentId: string;
  category: FindingCategory;
  title: string;
  description: string;
  severity: FindingSeverity;
  source: FindingSource;
}

export interface Assessment {
  id: string;
  patientId: string;
  createdBy: string;
  status: AssessmentStatus;
  aiSummary?: string;
  createdAt?: string;
  updatedAt?: string;
  findings: AssessmentFinding[];
}
