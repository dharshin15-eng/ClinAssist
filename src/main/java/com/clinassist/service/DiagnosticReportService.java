package com.clinassist.service;

import com.clinassist.dto.DiagnosticReportRequestDto;
import com.clinassist.dto.DiagnosticReportResponseDto;
import com.clinassist.entity.DiagnosticReport;
import com.clinassist.exception.DiagnosticReportNotFoundException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.DiagnosticReportRepository;
import com.clinassist.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing diagnostic report CRUD business logic and ownership validation.
 */
@Service
public class DiagnosticReportService {

    private final DiagnosticReportRepository reportRepository;
    private final PatientRepository patientRepository;

    public DiagnosticReportService(DiagnosticReportRepository reportRepository, PatientRepository patientRepository) {
        this.reportRepository = reportRepository;
        this.patientRepository = patientRepository;
    }

    public DiagnosticReportResponseDto createReport(String patientId, DiagnosticReportRequestDto dto) {
        verifyPatientExists(patientId);

        DiagnosticReport report = new DiagnosticReport(
                patientId,
                dto.getReportName(),
                dto.getReportType(),
                dto.getTestDate(),
                dto.getLabName(),
                dto.getStatus(),
                dto.getSummary(),
                dto.getReportReference()
        );

        DiagnosticReport savedReport = reportRepository.save(report);
        return mapToDto(savedReport);
    }

    public List<DiagnosticReportResponseDto> getReportsByPatientId(String patientId) {
        verifyPatientExists(patientId);

        return reportRepository.findByPatientId(patientId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DiagnosticReportResponseDto getReportById(String patientId, String reportId) {
        verifyPatientExists(patientId);

        DiagnosticReport report = reportRepository.findByIdAndPatientId(reportId, patientId)
                .orElseThrow(() -> new DiagnosticReportNotFoundException(
                        "Diagnostic report not found with id: " + reportId + " for patient: " + patientId));

        return mapToDto(report);
    }

    public DiagnosticReportResponseDto updateReport(String patientId, String reportId, DiagnosticReportRequestDto dto) {
        verifyPatientExists(patientId);

        DiagnosticReport report = reportRepository.findByIdAndPatientId(reportId, patientId)
                .orElseThrow(() -> new DiagnosticReportNotFoundException(
                        "Diagnostic report not found with id: " + reportId + " for patient: " + patientId));

        report.setReportName(dto.getReportName());
        report.setReportType(dto.getReportType());
        report.setTestDate(dto.getTestDate());
        report.setLabName(dto.getLabName());
        report.setStatus(dto.getStatus());
        report.setSummary(dto.getSummary());
        report.setReportReference(dto.getReportReference());
        report.setUpdatedAt(LocalDateTime.now());

        DiagnosticReport updatedReport = reportRepository.save(report);
        return mapToDto(updatedReport);
    }

    public void deleteReport(String patientId, String reportId) {
        verifyPatientExists(patientId);

        DiagnosticReport report = reportRepository.findByIdAndPatientId(reportId, patientId)
                .orElseThrow(() -> new DiagnosticReportNotFoundException(
                        "Diagnostic report not found with id: " + reportId + " for patient: " + patientId));

        reportRepository.delete(report);
    }

    private void verifyPatientExists(String patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new PatientNotFoundException("Patient not found with id: " + patientId);
        }
    }

    private DiagnosticReportResponseDto mapToDto(DiagnosticReport report) {
        return new DiagnosticReportResponseDto(
                report.getId(),
                report.getPatientId(),
                report.getReportName(),
                report.getReportType(),
                report.getTestDate(),
                report.getLabName(),
                report.getStatus(),
                report.getSummary(),
                report.getReportReference(),
                report.getCreatedAt(),
                report.getUpdatedAt()
        );
    }
}
