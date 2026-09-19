package com.clinassist.controller;

import com.clinassist.dto.DiagnosticReportRequestDto;
import com.clinassist.dto.DiagnosticReportResponseDto;
import com.clinassist.service.DiagnosticReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing patient diagnostic reports.
 */
@RestController
@RequestMapping("/api/patients/{patientId}/reports")
@PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_STAFF', 'DOCTOR')")
public class DiagnosticReportController {

    private final DiagnosticReportService reportService;

    public DiagnosticReportController(DiagnosticReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<DiagnosticReportResponseDto> createReport(
            @PathVariable String patientId,
            @Valid @RequestBody DiagnosticReportRequestDto requestDto) {
        DiagnosticReportResponseDto response = reportService.createReport(patientId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<DiagnosticReportResponseDto>> getReportsByPatientId(
            @PathVariable String patientId) {
        List<DiagnosticReportResponseDto> reports = reportService.getReportsByPatientId(patientId);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<DiagnosticReportResponseDto> getReportById(
            @PathVariable String patientId,
            @PathVariable String reportId) {
        DiagnosticReportResponseDto report = reportService.getReportById(patientId, reportId);
        return ResponseEntity.ok(report);
    }

    @PutMapping("/{reportId}")
    public ResponseEntity<DiagnosticReportResponseDto> updateReport(
            @PathVariable String patientId,
            @PathVariable String reportId,
            @Valid @RequestBody DiagnosticReportRequestDto requestDto) {
        DiagnosticReportResponseDto updatedReport = reportService.updateReport(patientId, reportId, requestDto);
        return ResponseEntity.ok(updatedReport);
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<Void> deleteReport(
            @PathVariable String patientId,
            @PathVariable String reportId) {
        reportService.deleteReport(patientId, reportId);
        return ResponseEntity.noContent().build();
    }
}
