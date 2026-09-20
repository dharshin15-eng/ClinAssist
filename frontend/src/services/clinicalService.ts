import { apiClient } from './apiClient';
import type { Symptom, MedicalHistory, Allergy, Medication, SymptomSeverity, HistoryStatus } from '../types';

// DTO Interfaces matching backend contracts
export interface SymptomRequestDto {
  name: string;
  severity: SymptomSeverity;
  duration: string;
  notes?: string;
}

export interface MedicalHistoryRequestDto {
  condition: string;
  description?: string;
  diagnosedDate?: string; // ISO Date YYYY-MM-DD
  status: HistoryStatus;
}

export interface AllergyRequestDto {
  allergen: string;
  reaction: string;
  severity: SymptomSeverity;
  notes?: string;
}

export interface MedicationRequestDto {
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
}

// 1. Symptoms API Service
export const symptomService = {
  async getSymptoms(patientId: string): Promise<Symptom[]> {
    return await apiClient.get<Symptom[]>(`/api/patients/${patientId}/symptoms`);
  },
  async createSymptom(patientId: string, data: SymptomRequestDto): Promise<Symptom> {
    return await apiClient.post<Symptom>(`/api/patients/${patientId}/symptoms`, data);
  },
  async updateSymptom(patientId: string, symptomId: string, data: SymptomRequestDto): Promise<Symptom> {
    return await apiClient.put<Symptom>(`/api/patients/${patientId}/symptoms/${symptomId}`, data);
  },
  async deleteSymptom(patientId: string, symptomId: string): Promise<void> {
    return await apiClient.delete<void>(`/api/patients/${patientId}/symptoms/${symptomId}`);
  }
};

// 2. Medical History API Service
export const medicalHistoryService = {
  async getMedicalHistories(patientId: string): Promise<MedicalHistory[]> {
    return await apiClient.get<MedicalHistory[]>(`/api/patients/${patientId}/history`);
  },
  async createMedicalHistory(patientId: string, data: MedicalHistoryRequestDto): Promise<MedicalHistory> {
    return await apiClient.post<MedicalHistory>(`/api/patients/${patientId}/history`, data);
  },
  async updateMedicalHistory(patientId: string, historyId: string, data: MedicalHistoryRequestDto): Promise<MedicalHistory> {
    return await apiClient.put<MedicalHistory>(`/api/patients/${patientId}/history/${historyId}`, data);
  },
  async deleteMedicalHistory(patientId: string, historyId: string): Promise<void> {
    return await apiClient.delete<void>(`/api/patients/${patientId}/history/${historyId}`);
  }
};

// 3. Allergy API Service
export const allergyService = {
  async getAllergies(patientId: string): Promise<Allergy[]> {
    return await apiClient.get<Allergy[]>(`/api/patients/${patientId}/allergies`);
  },
  async createAllergy(patientId: string, data: AllergyRequestDto): Promise<Allergy> {
    return await apiClient.post<Allergy>(`/api/patients/${patientId}/allergies`, data);
  },
  async updateAllergy(patientId: string, allergyId: string, data: AllergyRequestDto): Promise<Allergy> {
    return await apiClient.put<Allergy>(`/api/patients/${patientId}/allergies/${allergyId}`, data);
  },
  async deleteAllergy(patientId: string, allergyId: string): Promise<void> {
    return await apiClient.delete<void>(`/api/patients/${patientId}/allergies/${allergyId}`);
  }
};

// 4. Medication API Service
export const medicationService = {
  async getMedications(patientId: string): Promise<Medication[]> {
    return await apiClient.get<Medication[]>(`/api/patients/${patientId}/medications`);
  },
  async createMedication(patientId: string, data: MedicationRequestDto): Promise<Medication> {
    return await apiClient.post<Medication>(`/api/patients/${patientId}/medications`, data);
  },
  async updateMedication(patientId: string, medicationId: string, data: MedicationRequestDto): Promise<Medication> {
    return await apiClient.put<Medication>(`/api/patients/${patientId}/medications/${medicationId}`, data);
  },
  async deleteMedication(patientId: string, medicationId: string): Promise<void> {
    return await apiClient.delete<void>(`/api/patients/${patientId}/medications/${medicationId}`);
  }
};
