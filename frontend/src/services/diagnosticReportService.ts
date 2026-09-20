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
   * Create a new diagnostic report record metadata.
   * POST /api/patients/{patientId}/reports
   */
  async createReport(patientId: string, data: DiagnosticReportRequestDto): Promise<DiagnosticReport> {
    return await apiClient.post<DiagnosticReport>(`/api/patients/${patientId}/reports`, data);
  },

  /**
   * Update an existing diagnostic report record metadata.
   * PUT /api/patients/{patientId}/reports/{reportId}
   */
  async updateReport(patientId: string, reportId: string, data: DiagnosticReportRequestDto): Promise<DiagnosticReport> {
    return await apiClient.put<DiagnosticReport>(`/api/patients/${patientId}/reports/${reportId}`, data);
  },

  /**
   * Delete a diagnostic report and its associated GridFS file.
   * DELETE /api/patients/{patientId}/reports/{reportId}
   */
  async deleteReport(patientId: string, reportId: string): Promise<void> {
    return await apiClient.delete<void>(`/api/patients/${patientId}/reports/${reportId}`);
  },

  /**
   * Upload or replace an actual diagnostic report binary file in GridFS.
   * POST /api/patients/{patientId}/reports/{reportId}/file
   */
  async uploadReportFile(patientId: string, reportId: string, file: File): Promise<DiagnosticReport> {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.postFormData<DiagnosticReport>(`/api/patients/${patientId}/reports/${reportId}/file`, formData);
  },

  /**
   * Fetch attached report binary file Blob with JWT Authorization header attached.
   * GET /api/patients/{patientId}/reports/{reportId}/file
   */
  async fetchReportFileBlob(patientId: string, reportId: string): Promise<Blob> {
    const token = localStorage.getItem('clinassist_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/patients/${patientId}/reports/${reportId}/file`, {
      headers
    });

    if (!response.ok) {
      throw new Error('Unable to open the diagnostic report file.');
    }

    return await response.blob();
  }
};
