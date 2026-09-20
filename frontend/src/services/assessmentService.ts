import { apiClient } from './apiClient';
import type { Assessment } from '../types';

export interface AiSummaryResponseDto {
  assessmentId: string;
  patientId: string;
  aiSummary: string;
  disclaimer: string;
  generatedAt: string;
}

export const assessmentService = {
  /**
   * Fetch all clinical decision-support assessments for a patient by MongoDB internal patient ID.
   * GET /api/patients/{patientId}/assessments
   */
  async getAssessments(patientId: string): Promise<Assessment[]> {
    return await apiClient.get<Assessment[]>(`/api/patients/${patientId}/assessments`);
  },

  /**
   * Fetch a specific clinical decision-support assessment by assessment ID.
   * GET /api/patients/{patientId}/assessments/{assessmentId}
   */
  async getAssessment(patientId: string, assessmentId: string): Promise<Assessment> {
    return await apiClient.get<Assessment>(`/api/patients/${patientId}/assessments/${assessmentId}`);
  },

  /**
   * Create a new clinical decision-support assessment for a patient.
   * Evaluates deterministic rule engine rules against patient clinical data.
   * POST /api/patients/{patientId}/assessments
   */
  async createAssessment(patientId: string): Promise<Assessment> {
    return await apiClient.post<Assessment>(`/api/patients/${patientId}/assessments`, {});
  },

  /**
   * Trigger Gemini AI summary generation for an existing assessment.
   * POST /api/patients/{patientId}/assessments/{assessmentId}/ai-summary
   */
  async generateAiSummary(patientId: string, assessmentId: string): Promise<AiSummaryResponseDto> {
    return await apiClient.post<AiSummaryResponseDto>(`/api/patients/${patientId}/assessments/${assessmentId}/ai-summary`, {});
  }
};
