package com.clinassist.controller;

import com.clinassist.dto.AiSummaryResponseDto;
import com.clinassist.dto.AssessmentFindingResponseDto;
import com.clinassist.dto.AssessmentResponseDto;
import com.clinassist.entity.*;
import com.clinassist.exception.AssessmentNotFoundException;
import com.clinassist.exception.GeminiServiceException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.UserRepository;
import com.clinassist.security.JwtTokenProvider;
import com.clinassist.service.AssessmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "jwt.secret=TestJwtSecretKeyWhichIsAtLeast256BitsLongForHMACSHA256Signature123456",
        "jwt.expiration-ms=86400000"
})
class AssessmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AssessmentService assessmentService;

    @MockitoBean
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String getValidJwtToken(Role role) {
        String email = role.name().toLowerCase() + "@hospital.com";
        User user = new User("id-" + role.name(), email, passwordEncoder.encode("password"), "Test User", role, LocalDateTime.now(), LocalDateTime.now());
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        return tokenProvider.generateToken(email, role.name());
    }

    @Test
    void testCreateAssessmentSuccess201() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);
        AssessmentFindingResponseDto finding = new AssessmentFindingResponseDto(
                "f-1", "assess-1", FindingCategory.SYMPTOM, "Title", "Desc", FindingSeverity.HIGH, FindingSource.RULE_ENGINE
        );
        AssessmentResponseDto response = new AssessmentResponseDto(
                "assess-1", "pat-1", "doctor@hospital.com", AssessmentStatus.COMPLETED, null, LocalDateTime.now(), LocalDateTime.now(), List.of(finding)
        );

        when(assessmentService.createAssessment("pat-1")).thenReturn(response);

        mockMvc.perform(post("/api/patients/pat-1/assessments")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("assess-1"))
                .andExpect(jsonPath("$.createdBy").value("doctor@hospital.com"))
                .andExpect(jsonPath("$.findings[0].category").value("SYMPTOM"));
    }

    @Test
    void testGetAssessmentsByPatientIdSuccess200() throws Exception {
        String token = getValidJwtToken(Role.HOSPITAL_STAFF);
        AssessmentResponseDto response = new AssessmentResponseDto(
                "assess-1", "pat-1", "staff@hospital.com", AssessmentStatus.COMPLETED, "Stored Summary", LocalDateTime.now(), LocalDateTime.now(), List.of()
        );

        when(assessmentService.getAssessmentsByPatientId("pat-1")).thenReturn(List.of(response));

        mockMvc.perform(get("/api/patients/pat-1/assessments")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("assess-1"))
                .andExpect(jsonPath("$[0].aiSummary").value("Stored Summary"));
    }

    @Test
    void testGetAssessmentByIdSuccess200() throws Exception {
        String token = getValidJwtToken(Role.ADMIN);
        AssessmentResponseDto response = new AssessmentResponseDto(
                "assess-1", "pat-1", "admin@hospital.com", AssessmentStatus.COMPLETED, null, LocalDateTime.now(), LocalDateTime.now(), List.of()
        );

        when(assessmentService.getAssessmentById("pat-1", "assess-1")).thenReturn(response);

        mockMvc.perform(get("/api/patients/pat-1/assessments/assess-1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("assess-1"));
    }

    @Test
    void testGenerateAiSummarySuccess200() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);
        AiSummaryResponseDto response = new AiSummaryResponseDto(
                "assess-1", "pat-1", "Generated AI Summary text", "Disclaimer text", LocalDateTime.now()
        );

        when(assessmentService.generateAiSummary("pat-1", "assess-1")).thenReturn(response);

        mockMvc.perform(post("/api/patients/pat-1/assessments/assess-1/ai-summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assessmentId").value("assess-1"))
                .andExpect(jsonPath("$.aiSummary").value("Generated AI Summary text"));
    }

    @Test
    void testGenerateAiSummaryGeminiFailureReturns503() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);

        when(assessmentService.generateAiSummary("pat-1", "assess-1"))
                .thenThrow(new GeminiServiceException("Gemini API service unavailable"));

        mockMvc.perform(post("/api/patients/pat-1/assessments/assess-1/ai-summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503))
                .andExpect(jsonPath("$.message").value("Gemini API service unavailable"));
    }

    @Test
    void testMissingPatientReturns404() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);

        when(assessmentService.createAssessment("missing-pat"))
                .thenThrow(new PatientNotFoundException("Patient not found with id: missing-pat"));

        mockMvc.perform(post("/api/patients/missing-pat/assessments")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void testMissingAssessmentReturns404() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);

        when(assessmentService.getAssessmentById("pat-1", "missing-assess"))
                .thenThrow(new AssessmentNotFoundException("Assessment not found with id: missing-assess for patient: pat-1"));

        mockMvc.perform(get("/api/patients/pat-1/assessments/missing-assess")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void testCrossPatientAccessReturns404() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);

        when(assessmentService.getAssessmentById("pat-B", "assess-A"))
                .thenThrow(new AssessmentNotFoundException("Assessment not found with id: assess-A for patient: pat-B"));

        mockMvc.perform(get("/api/patients/pat-B/assessments/assess-A")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void testUnauthenticatedAccessRejected() throws Exception {
        mockMvc.perform(post("/api/patients/pat-1/assessments"))
                .andExpect(status().isForbidden());
    }
}
