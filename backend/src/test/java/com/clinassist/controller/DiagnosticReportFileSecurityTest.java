package com.clinassist.controller;

import com.clinassist.dto.DiagnosticReportResponseDto;
import com.clinassist.dto.ReportFileResource;
import com.clinassist.entity.ReportStatus;
import com.clinassist.entity.ReportType;
import com.clinassist.exception.DiagnosticReportNotFoundException;
import com.clinassist.security.JwtAuthenticationFilter;
import com.clinassist.security.JwtTokenProvider;
import com.clinassist.service.DiagnosticReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DiagnosticReportController.class)
@AutoConfigureMockMvc(addFilters = false) // Filter testing done via Spring Security tests, here testing controller authorization & ownership contracts
public class DiagnosticReportFileSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DiagnosticReportService reportService;

    @MockBean
    private JwtTokenProvider tokenProvider;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private String patientAId;
    private String patientBId;
    private String reportId;

    @BeforeEach
    void setUp() {
        patientAId = "673f11112222333344445555";
        patientBId = "673f99998888777766665555";
        reportId = "673f88888888888888888888";
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void getFile_authorizedSamePatient_returns200AndFileBytes() throws Exception {
        byte[] content = new byte[] {0x25, 0x50, 0x44, 0x46}; // %PDF
        Resource resource = new ByteArrayResource(content);
        ReportFileResource fileResource = new ReportFileResource(resource, "xray.pdf", "application/pdf", content.length);

        when(reportService.getFileResource(patientAId, reportId)).thenReturn(fileResource);

        mockMvc.perform(get("/api/patients/{patientId}/reports/{reportId}/file", patientAId, reportId))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "inline; filename=\"xray.pdf\""))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(content().bytes(content));
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void getFile_crossPatientAccess_returns404NotFound() throws Exception {
        // Patient B attempts to access Patient A's report ID via Patient B's path URL
        when(reportService.getFileResource(patientBId, reportId))
                .thenThrow(new DiagnosticReportNotFoundException("Diagnostic report not found with id: " + reportId + " for patient: " + patientBId));

        mockMvc.perform(get("/api/patients/{patientId}/reports/{reportId}/file", patientBId, reportId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void uploadFile_authorizedSamePatient_returns200UpdatedDto() throws Exception {
        byte[] pdfMagicBytes = new byte[] {0x25, 0x50, 0x44, 0x46};
        MockMultipartFile file = new MockMultipartFile("file", "lab.pdf", "application/pdf", pdfMagicBytes);

        DiagnosticReportResponseDto responseDto = new DiagnosticReportResponseDto(
                reportId, patientAId, "Lab Report", ReportType.BLOOD_TEST,
                LocalDate.now(), "Apex Lab", ReportStatus.COMPLETED, "Normal", "REF-001",
                "gridfs-id-123", "lab.pdf", "application/pdf", (long) pdfMagicBytes.length,
                LocalDateTime.now(), LocalDateTime.now()
        );

        when(reportService.storeFile(eq(patientAId), eq(reportId), any())).thenReturn(responseDto);

        mockMvc.perform(multipart("/api/patients/{patientId}/reports/{reportId}/file", patientAId, reportId).file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileId").value("gridfs-id-123"))
                .andExpect(jsonPath("$.fileName").value("lab.pdf"));
    }
}
