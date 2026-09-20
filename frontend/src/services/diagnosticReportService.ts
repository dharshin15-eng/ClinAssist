import { apiClient } from './apiClient';
import type { DiagnosticReport, ReportType, ReportStatus } from '../types';

export interface DiagnosticReportRequestDto {
  reportName: string;
  reportType: ReportType;
  testDate: string; // ISO date string (YYYY-MM-DD)
  labName?: string;
  status: ReportStatus;
  summary?: string;
  reportReference?: string;
}

export const diagnosticReportService = {
  /**
   * Fetch all diagnostic reports for a patient by MongoDB internal patient ID.
   * GET /api/patients/{patientId}/reports
   */
  async getReports(patientId: string): Promise<DiagnosticReport[]> {
    return await apiClient.get<DiagnosticReport[]>(`/api/patients/${patientId}/reports`);
  },

  /**
   * Create/upload a new diagnostic report.
   * POST /api/patients/{patientId}/reports
   */
  async createReport(patientId: string, data: DiagnosticReportRequestDto): Promise<DiagnosticReport> {
    return await apiClient.post<DiagnosticReport>(`/api/patients/${patientId}/reports`, data);
  },

  /**
   * Update an existing diagnostic report by report ID.
   * PUT /api/patients/{patientId}/reports/{reportId}
   */
  async updateReport(patientId: string, reportId: string, data: DiagnosticReportRequestDto): Promise<DiagnosticReport> {
    return await apiClient.put<DiagnosticReport>(`/api/patients/${patientId}/reports/${reportId}`, data);
  },

  /**
   * Delete a diagnostic report by report ID.
   * DELETE /api/patients/{patientId}/reports/{reportId}
   */
  async deleteReport(patientId: string, reportId: string): Promise<void> {
    return await apiClient.delete<void>(`/api/patients/${patientId}/reports/${reportId}`);
  }
};
