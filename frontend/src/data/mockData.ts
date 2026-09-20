import type {
  Patient,
  Symptom,
  MedicalHistory,
  Allergy,
  Medication,
  DiagnosticReport,
  Assessment
} from '../types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: '6aaecb6773a3c416fa03cf9a',
    patientId: 'PAT-20260920-8812',
    fullName: 'Robert Sterling',
    dateOfBirth: '1974-06-12',
    gender: 'Male',
    phone: '+1 (555) 234-5678',
    email: 'robert.sterling@example.com',
    address: '742 Evergreen Terrace, Springfield, IL',
    bloodGroup: 'O+',
    createdAt: '2026-09-18T10:15:00',
    updatedAt: '2026-09-20T08:30:00'
  },
  {
    id: '6aaecb6773a3c416fa03cf9b',
    patientId: 'PAT-20260920-9943',
    fullName: 'Eleanor Vance',
    dateOfBirth: '1982-11-24',
    gender: 'Female',
    phone: '+1 (555) 876-5432',
    email: 'eleanor.vance@example.com',
    address: '104 Hill House Lane, Boston, MA',
    bloodGroup: 'A-',
    createdAt: '2026-09-18T14:20:00',
    updatedAt: '2026-09-19T16:45:00'
  },
  {
    id: '6aaecb6773a3c416fa03cf9c',
    patientId: 'PAT-20260920-4411',
    fullName: 'Marcus Thorne',
    dateOfBirth: '1968-03-05',
    gender: 'Male',
    phone: '+1 (555) 345-6789',
    email: 'marcus.thorne@example.com',
    address: '42 Baker Street, Chicago, IL',
    bloodGroup: 'B+',
    createdAt: '2026-09-19T09:00:00',
    updatedAt: '2026-09-19T11:10:00'
  },
  {
    id: '6aaecb6773a3c416fa03cf9d',
    patientId: 'PAT-20260920-1102',
    fullName: 'Sophia Patel',
    dateOfBirth: '1995-08-19',
    gender: 'Female',
    phone: '+1 (555) 987-6543',
    email: 'sophia.patel@example.com',
    address: '88 Tech Boulevard, Austin, TX',
    bloodGroup: 'AB+',
    createdAt: '2026-09-20T07:45:00',
    updatedAt: '2026-09-20T07:45:00'
  }
];

export const MOCK_SYMPTOMS: Record<string, Symptom[]> = {
  '6aaecb6773a3c416fa03cf9a': [
    {
      id: 'symp-101',
      patientId: '6aaecb6773a3c416fa03cf9a',
      name: 'High Fever',
      severity: 'SEVERE',
      duration: '4 days',
      notes: 'Persistent body temperature hovering around 39.2°C with chills.',
      createdAt: '2026-09-18T11:00:00'
    },
    {
      id: 'symp-102',
      patientId: '6aaecb6773a3c416fa03cf9a',
      name: 'Productive Cough',
      severity: 'MODERATE',
      duration: '3 days',
      notes: 'Thick yellowish sputum production worse in early morning.',
      createdAt: '2026-09-18T11:05:00'
    }
  ],
  '6aaecb6773a3c416fa03cf9b': [
    {
      id: 'symp-201',
      patientId: '6aaecb6773a3c416fa03cf9b',
      name: 'Shortness of Breath',
      severity: 'MODERATE',
      duration: '2 days',
      notes: 'Dyspnea triggered upon moderate physical exertion.',
      createdAt: '2026-09-18T15:00:00'
    }
  ]
};

export const MOCK_MEDICAL_HISTORIES: Record<string, MedicalHistory[]> = {
  '6aaecb6773a3c416fa03cf9a': [
    {
      id: 'hist-101',
      patientId: '6aaecb6773a3c416fa03cf9a',
      condition: 'Type 2 Diabetes Mellitus',
      description: 'HbA1c last recorded at 7.2%. Managed with oral hypoglycemic agents.',
      diagnosedDate: '2019-04-15',
      status: 'ACTIVE'
    },
    {
      id: 'hist-102',
      patientId: '6aaecb6773a3c416fa03cf9a',
      condition: 'Essential Hypertension',
      description: 'Controlled blood pressure baseline 128/82 mmHg.',
      diagnosedDate: '2021-08-10',
      status: 'ACTIVE'
    }
  ],
  '6aaecb6773a3c416fa03cf9b': [
    {
      id: 'hist-201',
      patientId: '6aaecb6773a3c416fa03cf9b',
      condition: 'Bronchial Asthma',
      description: 'Seasonal exacerbations during autumn months.',
      diagnosedDate: '2015-10-01',
      status: 'ACTIVE'
    }
  ]
};

export const MOCK_ALLERGIES: Record<string, Allergy[]> = {
  '6aaecb6773a3c416fa03cf9a': [
    {
      id: 'all-101',
      patientId: '6aaecb6773a3c416fa03cf9a',
      allergen: 'Penicillin Antibiotics',
      reaction: 'Urticaria, facial flushing, and mild bronchospasm',
      severity: 'SEVERE',
      notes: 'Strictly avoid all beta-lactam antibiotic derivatives.'
    }
  ],
  '6aaecb6773a3c416fa03cf9b': [
    {
      id: 'all-201',
      patientId: '6aaecb6773a3c416fa03cf9b',
      allergen: 'Sulfa Drugs',
      reaction: 'Generalized maculopapular rash',
      severity: 'MODERATE',
      notes: 'Avoid Trimethoprim-sulfamethoxazole.'
    }
  ]
};

export const MOCK_MEDICATIONS: Record<string, Medication[]> = {
  '6aaecb6773a3c416fa03cf9a': [
    {
      id: 'med-101',
      patientId: '6aaecb6773a3c416fa03cf9a',
      name: 'Metformin Hydrochloride',
      dosage: '500 mg',
      frequency: 'Twice daily with meals',
      notes: 'Blood glucose management'
    },
    {
      id: 'med-102',
      patientId: '6aaecb6773a3c416fa03cf9a',
      name: 'Lisinopril',
      dosage: '10 mg',
      frequency: 'Once daily in the morning',
      notes: 'Antihypertensive therapy'
    }
  ],
  '6aaecb6773a3c416fa03cf9b': [
    {
      id: 'med-201',
      patientId: '6aaecb6773a3c416fa03cf9b',
      name: 'Albuterol Inhaler',
      dosage: '90 mcg/actuation',
      frequency: '2 puffs every 4 to 6 hours as needed',
      notes: 'Rescue bronchodilator'
    }
  ]
};

export const MOCK_DIAGNOSTIC_REPORTS: Record<string, DiagnosticReport[]> = {
  '6aaecb6773a3c416fa03cf9a': [
    {
      id: 'rep-101',
      patientId: '6aaecb6773a3c416fa03cf9a',
      reportName: 'Complete Blood Count (CBC) with Differential',
      reportType: 'BLOOD_TEST',
      testDate: '2026-09-19',
      labName: 'Central Pathology Laboratory',
      status: 'COMPLETED',
      summary: 'Elevated WBC count (14.2 x10^3/uL) with 82% neutrophilia indicating active bacterial response.',
      reportReference: 'LAB-CBC-20260919-01'
    },
    {
      id: 'rep-102',
      patientId: '6aaecb6773a3c416fa03cf9a',
      reportName: 'Chest X-Ray (PA & Lateral)',
      reportType: 'X_RAY',
      testDate: '2026-09-19',
      labName: 'St. Jude Diagnostic Imaging Center',
      status: 'REVIEWED',
      summary: 'Focal alveolar consolidation in right lower lobe consistent with lobar pneumonia.',
      reportReference: 'RAD-CXR-20260919-88'
    }
  ]
};

export const MOCK_ASSESSMENTS: Record<string, Assessment[]> = {
  '6aaecb6773a3c416fa03cf9a': [
    {
      id: 'assess-9001',
      patientId: '6aaecb6773a3c416fa03cf9a',
      createdBy: 'doctor@hospital.com',
      status: 'COMPLETED',
      aiSummary: 'CLINICAL DECISION SUPPORT SUMMARY FOR DOCTOR REVIEW:\n\n1. PATIENT FACTS & DATA:\n- Patient Robert Sterling (52y, Male, O+) presented with 4-day High Fever (39.2°C) and 3-day Productive Yellowish Cough.\n- Active medical history of Type 2 Diabetes Mellitus and Essential Hypertension.\n- Severe documented allergy to Penicillin Antibiotics.\n- Diagnostic imaging (Chest X-Ray) indicates right lower lobe consolidation with elevated WBC count (14.2 x10^3/uL).\n\n2. DETERMINISTIC RULE-ENGINE FINDINGS:\n- [SYMPTOM] High Fever recorded for 4 days with severe rating.\n- [ALLERGY] Critical Alert: Documented severe penicillin allergy. Avoid all beta-lactams.\n- [MEDICAL_HISTORY] Active Type 2 Diabetes & Hypertension noted.\n- [DIAGNOSTIC_REPORT] Chest X-Ray & CBC reports available confirming consolidation.\n\n3. CLINICAL CONSIDERATIONS:\n- Findings strongly support clinical evaluation for community-acquired pneumonia.\n- If antibiotic therapy is selected by the attending physician, select non-beta-lactam alternatives (e.g., Macrolides or Respiratory Fluoroquinolones) due to severe Penicillin allergy.\n\nDISCLAIMER: This decision-support summary is generated for review by a licensed doctor. Final clinical decision and prescription rest entirely with the attending physician.',
      createdAt: '2026-09-19T16:30:00',
      updatedAt: '2026-09-19T16:32:00',
      findings: [
        {
          id: 'find-01',
          assessmentId: 'assess-9001',
          category: 'SYMPTOM',
          title: 'Symptom Consideration: High Fever',
          description: "Patient symptom 'High Fever' recorded with duration: 4 days. Severity: SEVERE.",
          severity: 'HIGH',
          source: 'RULE_ENGINE'
        },
        {
          id: 'find-02',
          assessmentId: 'assess-9001',
          category: 'ALLERGY',
          title: 'Documented Allergy: Penicillin Antibiotics',
          description: 'Patient has a documented severe allergy to Penicillin Antibiotics. Reaction: Urticaria, facial flushing, and mild bronchospasm.',
          severity: 'HIGH',
          source: 'RULE_ENGINE'
        },
        {
          id: 'find-03',
          assessmentId: 'assess-9001',
          category: 'MEDICAL_HISTORY',
          title: 'Medical History Condition: Type 2 Diabetes Mellitus',
          description: 'Patient has a documented active medical history of Type 2 Diabetes Mellitus (Status: ACTIVE).',
          severity: 'MEDIUM',
          source: 'RULE_ENGINE'
        },
        {
          id: 'find-04',
          assessmentId: 'assess-9001',
          category: 'MEDICATION',
          title: 'Current Medication: Metformin Hydrochloride',
          description: 'Patient is currently prescribed Metformin Hydrochloride 500 mg Twice daily. Consider during clinical evaluation.',
          severity: 'INFORMATIONAL',
          source: 'RULE_ENGINE'
        },
        {
          id: 'find-05',
          assessmentId: 'assess-9001',
          category: 'DIAGNOSTIC_REPORT',
          title: 'Diagnostic Report: Chest X-Ray',
          description: 'Diagnostic report Chest X-Ray (Type: X_RAY, Status: REVIEWED) available for review. Summary: Focal consolidation in RLL.',
          severity: 'INFORMATIONAL',
          source: 'RULE_ENGINE'
        }
      ]
    }
  ]
};
