package com.clinassist.controller;

import com.clinassist.dto.DiagnosticReportRequestDto;
import com.clinassist.dto.DiagnosticReportResponseDto;
import com.clinassist.entity.ReportStatus;
import com.clinassist.entity.ReportType;
import com.clinassist.entity.Role;
import com.clinassist.entity.User;
import com.clinassist.exception.ClinicalRecordNotFoundException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.UserRepository;
import com.clinassist.security.JwtTokenProvider;
import com.clinassist.service.DiagnosticReportService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "jwt.secret=TestJwtSecretKeyWhichIsAtLeast256BitsLongForHMACSHA256Signature123456",
        "jwt.expiration-ms=86400000"
})
class DiagnosticReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DiagnosticReportService reportService;

    @MockitoBean
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private String getValidJwtToken(Role role) {
        String email = role.name().toLowerCase() + "@hospital.com";
        User user = new User("id-" + role.name(), email, passwordEncoder.encode("password"), "Test User", role, LocalDateTime.now(), LocalDateTime.now());
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        return tokenProvider.generateToken(email, role.name());
    }

    @Test
    void testCreateReportSuccess201() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);
        DiagnosticReportRequestDto request = new DiagnosticReportRequestDto(
                "Blood Test", ReportType.BLOOD_TEST, LocalDate.now(), "Central Lab", ReportStatus.COMPLETED, "Normal", "REF-001"
        );
        DiagnosticReportResponseDto response = new DiagnosticReportResponseDto(
                "report-1", "pat-1", "Blood Test", ReportType.BLOOD_TEST, LocalDate.now(), "Central Lab", ReportStatus.COMPLETED, "Normal", "REF-001", LocalDateTime.now(), LocalDateTime.now()
        );

        when(reportService.createReport(eq("pat-1"), any(DiagnosticReportRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/patients/pat-1/reports")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("report-1"))
                .andExpect(jsonPath("$.reportName").value("Blood Test"))
                .andExpect(jsonPath("$.reportType").value("BLOOD_TEST"))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void testGetAllReportsSuccess200() throws Exception {
        String token = getValidJwtToken(Role.HOSPITAL_STAFF);
        DiagnosticReportResponseDto response = new DiagnosticReportResponseDto(
                "report-1", "pat-1", "Ultrasound", ReportType.ULTRASOUND, LocalDate.now(), "City Hospital", ReportStatus.REVIEWED, "Abdomen clear", "REF-002", LocalDateTime.now(), LocalDateTime.now()
        );

        when(reportService.getReportsByPatientId("pat-1")).thenReturn(List.of(response));

        mockMvc.perform(get("/api/patients/pat-1/reports")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("report-1"))
                .andExpect(jsonPath("$[0].reportName").value("Ultrasound"));
    }

    @Test
    void testGetReportByIdSuccess200() throws Exception {
        String token = getValidJwtToken(Role.ADMIN);
        DiagnosticReportResponseDto response = new DiagnosticReportResponseDto(
                "report-1", "pat-1", "CT Scan", ReportType.CT_SCAN, LocalDate.now(), "Radiology", ReportStatus.COMPLETED, "Scan clear", "REF-003", LocalDateTime.now(), LocalDateTime.now()
        );

        when(reportService.getReportById("pat-1", "report-1")).thenReturn(response);

        mockMvc.perform(get("/api/patients/pat-1/reports/report-1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("report-1"))
                .andExpect(jsonPath("$.reportType").value("CT_SCAN"));
    }

    @Test
    void testUpdateReportSuccess200() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);
        DiagnosticReportRequestDto request = new DiagnosticReportRequestDto(
                "Updated X-Ray", ReportType.X_RAY, LocalDate.now(), "Lab", ReportStatus.REVIEWED, "Reviewed notes", "REF-004"
        );
        DiagnosticReportResponseDto response = new DiagnosticReportResponseDto(
                "report-1", "pat-1", "Updated X-Ray", ReportType.X_RAY, LocalDate.now(), "Lab", ReportStatus.REVIEWED, "Reviewed notes", "REF-004", LocalDateTime.now(), LocalDateTime.now()
        );

        when(reportService.updateReport(eq("pat-1"), eq("report-1"), any(DiagnosticReportRequestDto.class))).thenReturn(response);

        mockMvc.perform(put("/api/patients/pat-1/reports/report-1")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reportName").value("Updated X-Ray"))
                .andExpect(jsonPath("$.status").value("REVIEWED"));
    }

    @Test
    void testDeleteReportSuccess204NoContent() throws Exception {
        String token = getValidJwtToken(Role.ADMIN);

        mockMvc.perform(delete("/api/patients/pat-1/reports/report-1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    @Test
    void testMissingPatient404() throws Exception {
        String token = getValidJwtToken(Role.HOSPITAL_STAFF);

        when(reportService.getReportsByPatientId("missing-patient"))
                .thenThrow(new PatientNotFoundException("Patient not found with id: missing-patient"));

        mockMvc.perform(get("/api/patients/missing-patient/reports")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void testMissingReport404() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);

        when(reportService.getReportById("pat-1", "missing-report"))
                .thenThrow(new ClinicalRecordNotFoundException("Diagnostic report not found with id: missing-report for patient: pat-1"));

        mockMvc.perform(get("/api/patients/pat-1/reports/missing-report")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void testCrossPatientAccessReturns404() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);

        when(reportService.getReportById("pat-B", "report-A"))
                .thenThrow(new ClinicalRecordNotFoundException("Diagnostic report not found with id: report-A for patient: pat-B"));

        mockMvc.perform(get("/api/patients/pat-B/reports/report-A")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void testBusinessPatientIdPathUsageReturns404() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);
        String businessPatientId = "PAT-20260919-JLYQ";

        when(reportService.getReportsByPatientId(businessPatientId))
                .thenThrow(new PatientNotFoundException("Patient not found with id: " + businessPatientId));

        mockMvc.perform(get("/api/patients/" + businessPatientId + "/reports")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void testInvalidRequestPayload400BadRequest() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);
        // Missing required fields (reportName is blank, reportType is null, testDate is null, status is null)
        DiagnosticReportRequestDto invalidRequest = new DiagnosticReportRequestDto();

        mockMvc.perform(post("/api/patients/pat-1/reports")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void testUnauthenticatedAccessRejected() throws Exception {
        mockMvc.perform(get("/api/patients/pat-1/reports"))
                .andExpect(status().isForbidden());
    }
}
