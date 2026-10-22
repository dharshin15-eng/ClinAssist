package com.clinassist.service;

import com.clinassist.dto.AiSummaryResponseDto;
import com.clinassist.dto.AssessmentResponseDto;
import com.clinassist.engine.RuleEngine;
import com.clinassist.entity.*;
import com.clinassist.exception.AssessmentNotFoundException;
import com.clinassist.exception.GeminiServiceException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssessmentServiceTest {

    @Mock private AssessmentRepository assessmentRepository;
    @Mock private AssessmentFindingRepository findingRepository;
    @Mock private PatientRepository patientRepository;
    @Mock private SymptomRepository symptomRepository;
    @Mock private MedicalHistoryRepository medicalHistoryRepository;
    @Mock private AllergyRepository allergyRepository;
    @Mock private MedicationRepository medicationRepository;
    @Mock private DiagnosticReportRepository diagnosticReportRepository;
    @Mock private RuleEngine ruleEngine;
    @Mock private GeminiService geminiService;

    private AssessmentService assessmentService;

    @BeforeEach
    void setUp() {
        assessmentService = new AssessmentService(
                assessmentRepository, findingRepository, patientRepository,
                symptomRepository, medicalHistoryRepository, allergyRepository,
                medicationRepository, diagnosticReportRepository, ruleEngine, geminiService
        );

        // Set authenticated user context
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("doctor@hospital.com", "password", List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testCreateAssessmentSuccessExtractsCreatedByFromSecurityContext() {
        Patient patient = new Patient();
        patient.setId("patient-1");
        when(patientRepository.findById("patient-1")).thenReturn(Optional.of(patient));

        AssessmentFinding finding = new AssessmentFinding(FindingCategory.SYMPTOM, "Title", "Desc", FindingSeverity.HIGH, FindingSource.RULE_ENGINE);
        when(ruleEngine.evaluateRules(any())).thenReturn(List.of(finding));

        when(assessmentRepository.save(any(Assessment.class))).thenAnswer(inv -> {
            Assessment a = inv.getArgument(0);
            a.setId("assess-1");
            return a;
        });

        when(findingRepository.findByAssessmentId("assess-1")).thenReturn(List.of(finding));

        AssessmentResponseDto response = assessmentService.createAssessment("patient-1");

        assertNotNull(response);
        assertEquals("assess-1", response.getId());
        assertEquals("patient-1", response.getPatientId());
        assertEquals("doctor@hospital.com", response.getCreatedBy(), "CreatedBy must be derived strictly from SecurityContextHolder principal");
        assertEquals(1, response.getFindings().size());
    }

    @Test
    void testCreateAssessmentAtomicPersistenceRollbackOnFindingFailure() {
        Patient patient = new Patient();
        patient.setId("patient-1");
        when(patientRepository.findById("patient-1")).thenReturn(Optional.of(patient));

        AssessmentFinding finding = new AssessmentFinding(FindingCategory.SYMPTOM, "Title", "Desc", FindingSeverity.HIGH, FindingSource.RULE_ENGINE);
        when(ruleEngine.evaluateRules(any())).thenReturn(List.of(finding));

        Assessment assessment = new Assessment("patient-1", "doctor@hospital.com", AssessmentStatus.COMPLETED);
        assessment.setId("assess-1");
        when(assessmentRepository.save(any(Assessment.class))).thenReturn(assessment);

        // Simulate failure during finding persistence
        when(findingRepository.saveAll(any())).thenThrow(new RuntimeException("Database error saving findings"));

        assertThrows(RuntimeException.class, () -> assessmentService.createAssessment("patient-1"));

        // Verify explicit rollback cleanup was executed
        verify(assessmentRepository).delete(assessment);
    }

    @Test
    void testGenerateAiSummaryGeminiFailurePreservesAssessmentData() {
        Patient patient = new Patient();
        patient.setId("patient-1");
        when(patientRepository.findById("patient-1")).thenReturn(Optional.of(patient));

        Assessment assessment = new Assessment("assess-1", "patient-1", "doctor@hospital.com", AssessmentStatus.COMPLETED, null, null, null);
        when(assessmentRepository.findByIdAndPatientId("assess-1", "patient-1")).thenReturn(Optional.of(assessment));

        // Simulate Gemini failure
        when(geminiService.generateSummary(any(), any(), any(), any(), any(), any(), any()))
                .thenThrow(new GeminiServiceException("Gemini API connection timeout"));

        assertThrows(GeminiServiceException.class, () -> assessmentService.generateAiSummary("patient-1", "assess-1"));

        // Verify assessment was NOT deleted, findings were NOT deleted, and aiSummary was NOT overwritten with error text
        verify(assessmentRepository, never()).delete(any());
        verify(findingRepository, never()).deleteByAssessmentId(any());
        assertNull(assessment.getAiSummary(), "aiSummary should remain unchanged when Gemini fails");
    }

    @Test
    void testGetAssessmentByIdCrossPatientMismatchThrowsException() {
        when(patientRepository.existsById("patient-B")).thenReturn(true);
        when(assessmentRepository.findByIdAndPatientId("assess-A", "patient-B")).thenReturn(Optional.empty());

        assertThrows(AssessmentNotFoundException.class, () -> assessmentService.getAssessmentById("patient-B", "assess-A"));
    }
}
