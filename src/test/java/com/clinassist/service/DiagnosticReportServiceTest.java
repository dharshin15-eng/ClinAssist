package com.clinassist.service;

import com.clinassist.dto.DiagnosticReportRequestDto;
import com.clinassist.dto.DiagnosticReportResponseDto;
import com.clinassist.entity.DiagnosticReport;
import com.clinassist.entity.ReportStatus;
import com.clinassist.entity.ReportType;
import com.clinassist.exception.ClinicalRecordNotFoundException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.DiagnosticReportRepository;
import com.clinassist.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiagnosticReportServiceTest {

    @Mock
    private DiagnosticReportRepository reportRepository;

    @Mock
    private PatientRepository patientRepository;

    private DiagnosticReportService reportService;

    @BeforeEach
    void setUp() {
        reportService = new DiagnosticReportService(reportRepository, patientRepository);
    }

    @Test
    void testCreateReportSuccess() {
        when(patientRepository.existsById("patient-1")).thenReturn(true);
        when(reportRepository.save(any(DiagnosticReport.class))).thenAnswer(inv -> {
            DiagnosticReport r = inv.getArgument(0);
            r.setId("report-1");
            return r;
        });

        DiagnosticReportRequestDto request = new DiagnosticReportRequestDto(
                "CBC Blood Test", ReportType.BLOOD_TEST, LocalDate.now(), "City Lab", ReportStatus.COMPLETED, "Normal blood count", "REF-1001"
        );

        DiagnosticReportResponseDto response = reportService.createReport("patient-1", request);

        assertNotNull(response);
        assertEquals("report-1", response.getId());
        assertEquals("patient-1", response.getPatientId());
        assertEquals("CBC Blood Test", response.getReportName());
        assertEquals(ReportType.BLOOD_TEST, response.getReportType());
        assertEquals(ReportStatus.COMPLETED, response.getStatus());
    }

    @Test
    void testCreateReportPatientNotFoundThrowsException() {
        when(patientRepository.existsById("missing-patient")).thenReturn(false);

        DiagnosticReportRequestDto request = new DiagnosticReportRequestDto(
                "X-Ray Chest", ReportType.X_RAY, LocalDate.now(), "Lab B", ReportStatus.PENDING, "Pending scan", "REF-1002"
        );

        assertThrows(PatientNotFoundException.class, () -> reportService.createReport("missing-patient", request));
    }

    @Test
    void testGetReportsByPatientIdSuccess() {
        when(patientRepository.existsById("patient-1")).thenReturn(true);
        DiagnosticReport r1 = new DiagnosticReport("r-1", "patient-1", "Blood Test", ReportType.BLOOD_TEST, LocalDate.now(), "Lab A", ReportStatus.COMPLETED, "Summary A", "REF-1", LocalDateTime.now(), LocalDateTime.now());
        when(reportRepository.findByPatientId("patient-1")).thenReturn(List.of(r1));

        List<DiagnosticReportResponseDto> reports = reportService.getReportsByPatientId("patient-1");

        assertNotNull(reports);
        assertEquals(1, reports.size());
        assertEquals("Blood Test", reports.get(0).getReportName());
    }

    @Test
    void testGetReportByIdSuccess() {
        when(patientRepository.existsById("patient-1")).thenReturn(true);
        DiagnosticReport report = new DiagnosticReport("report-1", "patient-1", "MRI Brain", ReportType.MRI, LocalDate.now(), "Radiology Dept", ReportStatus.REVIEWED, "No abnormality", "REF-2001", LocalDateTime.now(), LocalDateTime.now());
        when(reportRepository.findByIdAndPatientId("report-1", "patient-1")).thenReturn(Optional.of(report));

        DiagnosticReportResponseDto response = reportService.getReportById("patient-1", "report-1");

        assertNotNull(response);
        assertEquals("MRI Brain", response.getReportName());
        assertEquals(ReportType.MRI, response.getReportType());
    }

    @Test
    void testGetReportByIdCrossPatientOwnershipMismatchThrowsException() {
        when(patientRepository.existsById("patient-B")).thenReturn(true);
        when(reportRepository.findByIdAndPatientId("report-A", "patient-B")).thenReturn(Optional.empty());

        assertThrows(ClinicalRecordNotFoundException.class, () -> reportService.getReportById("patient-B", "report-A"));
    }

    @Test
    void testUpdateReportSuccess() {
        when(patientRepository.existsById("patient-1")).thenReturn(true);
        DiagnosticReport existing = new DiagnosticReport("report-1", "patient-1", "Old Name", ReportType.URINE_TEST, LocalDate.now(), "Lab", ReportStatus.PENDING, "Old", "REF-00", LocalDateTime.now(), LocalDateTime.now());
        when(reportRepository.findByIdAndPatientId("report-1", "patient-1")).thenReturn(Optional.of(existing));
        when(reportRepository.save(any(DiagnosticReport.class))).thenAnswer(inv -> inv.getArgument(0));

        DiagnosticReportRequestDto updateRequest = new DiagnosticReportRequestDto(
                "Updated Urine Test", ReportType.URINE_TEST, LocalDate.now(), "Lab New", ReportStatus.COMPLETED, "Updated Summary", "REF-01"
        );

        DiagnosticReportResponseDto response = reportService.updateReport("patient-1", "report-1", updateRequest);

        assertNotNull(response);
        assertEquals("Updated Urine Test", response.getReportName());
        assertEquals(ReportStatus.COMPLETED, response.getStatus());
    }

    @Test
    void testDeleteReportSuccess() {
        when(patientRepository.existsById("patient-1")).thenReturn(true);
        DiagnosticReport report = new DiagnosticReport("report-1", "patient-1", "CT Scan", ReportType.CT_SCAN, LocalDate.now(), "Lab C", ReportStatus.PENDING, "Notes", "REF-300", LocalDateTime.now(), LocalDateTime.now());
        when(reportRepository.findByIdAndPatientId("report-1", "patient-1")).thenReturn(Optional.of(report));

        reportService.deleteReport("patient-1", "report-1");

        verify(reportRepository).delete(report);
    }
}
