package com.clinassist.service;

import com.clinassist.dto.AiSummaryResponseDto;
import com.clinassist.dto.AssessmentFindingResponseDto;
import com.clinassist.dto.AssessmentResponseDto;
import com.clinassist.engine.RuleEngine;
import com.clinassist.engine.RuleEvaluationContext;
import com.clinassist.entity.*;
import com.clinassist.exception.AssessmentNotFoundException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service orchestrating clinical assessments, rule engine execution, and AI summary generation.
 */
@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentFindingRepository findingRepository;
    private final PatientRepository patientRepository;
    private final SymptomRepository symptomRepository;
    private final MedicalHistoryRepository medicalHistoryRepository;
    private final AllergyRepository allergyRepository;
    private final MedicationRepository medicationRepository;
    private final DiagnosticReportRepository diagnosticReportRepository;
    private final RuleEngine ruleEngine;
    private final GeminiService geminiService;

    public AssessmentService(AssessmentRepository assessmentRepository,
                             AssessmentFindingRepository findingRepository,
                             PatientRepository patientRepository,
                             SymptomRepository symptomRepository,
                             MedicalHistoryRepository medicalHistoryRepository,
                             AllergyRepository allergyRepository,
                             MedicationRepository medicationRepository,
                             DiagnosticReportRepository diagnosticReportRepository,
                             RuleEngine ruleEngine,
                             GeminiService geminiService) {
        this.assessmentRepository = assessmentRepository;
        this.findingRepository = findingRepository;
        this.patientRepository = patientRepository;
        this.symptomRepository = symptomRepository;
        this.medicalHistoryRepository = medicalHistoryRepository;
        this.allergyRepository = allergyRepository;
        this.medicationRepository = medicationRepository;
        this.diagnosticReportRepository = diagnosticReportRepository;
        this.ruleEngine = ruleEngine;
        this.geminiService = geminiService;
    }

    public AssessmentResponseDto createAssessment(String patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with id: " + patientId));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String createdBy = (authentication != null && authentication.getName() != null && !authentication.getName().isBlank())
                ? authentication.getName()
                : "SYSTEM";

        List<Symptom> symptoms = symptomRepository.findByPatientId(patientId);
        List<MedicalHistory> histories = medicalHistoryRepository.findByPatientId(patientId);
        List<Allergy> allergies = allergyRepository.findByPatientId(patientId);
        List<Medication> medications = medicationRepository.findByPatientId(patientId);
        List<DiagnosticReport> reports = diagnosticReportRepository.findByPatientId(patientId);

        RuleEvaluationContext context = new RuleEvaluationContext(patient, symptoms, histories, allergies, medications, reports);
        List<AssessmentFinding> findings = ruleEngine.evaluateRules(context);

        Assessment assessment = new Assessment(patientId, createdBy, AssessmentStatus.COMPLETED);
        Assessment savedAssessment = assessmentRepository.save(assessment);

        try {
            if (findings != null && !findings.isEmpty()) {
                for (AssessmentFinding finding : findings) {
                    finding.setAssessmentId(savedAssessment.getId());
                }
                findingRepository.saveAll(findings);
            }
        } catch (Exception e) {
            // Explicit failure cleanup if finding persistence fails
            assessmentRepository.delete(savedAssessment);
            throw new RuntimeException("Failed to persist assessment findings. Assessment creation rolled back.", e);
        }

        List<AssessmentFinding> savedFindings = findingRepository.findByAssessmentId(savedAssessment.getId());
        return mapToDto(savedAssessment, savedFindings);
    }

    public List<AssessmentResponseDto> getAssessmentsByPatientId(String patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new PatientNotFoundException("Patient not found with id: " + patientId);
        }

        return assessmentRepository.findByPatientId(patientId).stream()
                .map(assessment -> {
                    List<AssessmentFinding> findings = findingRepository.findByAssessmentId(assessment.getId());
                    return mapToDto(assessment, findings);
                })
                .collect(Collectors.toList());
    }

    public AssessmentResponseDto getAssessmentById(String patientId, String assessmentId) {
        if (!patientRepository.existsById(patientId)) {
            throw new PatientNotFoundException("Patient not found with id: " + patientId);
        }

        Assessment assessment = assessmentRepository.findByIdAndPatientId(assessmentId, patientId)
                .orElseThrow(() -> new AssessmentNotFoundException(
                        "Assessment not found with id: " + assessmentId + " for patient: " + patientId));

        List<AssessmentFinding> findings = findingRepository.findByAssessmentId(assessmentId);
        return mapToDto(assessment, findings);
    }

    public AiSummaryResponseDto generateAiSummary(String patientId, String assessmentId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with id: " + patientId));

        Assessment assessment = assessmentRepository.findByIdAndPatientId(assessmentId, patientId)
                .orElseThrow(() -> new AssessmentNotFoundException(
                        "Assessment not found with id: " + assessmentId + " for patient: " + patientId));

        List<AssessmentFinding> findings = findingRepository.findByAssessmentId(assessmentId);
        List<Symptom> symptoms = symptomRepository.findByPatientId(patientId);
        List<MedicalHistory> histories = medicalHistoryRepository.findByPatientId(patientId);
        List<Allergy> allergies = allergyRepository.findByPatientId(patientId);
        List<Medication> medications = medicationRepository.findByPatientId(patientId);
        List<DiagnosticReport> reports = diagnosticReportRepository.findByPatientId(patientId);

        // Call Gemini Service. In case of failure, exception is propagated directly without modifying assessment data.
        String summary = geminiService.generateSummary(patient, findings, symptoms, histories, allergies, medications, reports);

        assessment.setAiSummary(summary);
        assessment.setUpdatedAt(LocalDateTime.now());
        assessmentRepository.save(assessment);

        String disclaimer = "Clinical decision-support summary generated for review by a licensed doctor. Final clinical decision rests with the doctor.";
        return new AiSummaryResponseDto(assessment.getId(), patientId, summary, disclaimer, LocalDateTime.now());
    }

    private AssessmentResponseDto mapToDto(Assessment assessment, List<AssessmentFinding> findings) {
        List<AssessmentFindingResponseDto> findingDtos = (findings != null)
                ? findings.stream().map(this::mapFindingToDto).collect(Collectors.toList())
                : List.of();

        return new AssessmentResponseDto(
                assessment.getId(),
                assessment.getPatientId(),
                assessment.getCreatedBy(),
                assessment.getStatus(),
                assessment.getAiSummary(),
                assessment.getCreatedAt(),
                assessment.getUpdatedAt(),
                findingDtos
        );
    }

    private AssessmentFindingResponseDto mapFindingToDto(AssessmentFinding finding) {
        return new AssessmentFindingResponseDto(
                finding.getId(),
                finding.getAssessmentId(),
                finding.getCategory(),
                finding.getTitle(),
                finding.getDescription(),
                finding.getSeverity(),
                finding.getSource()
        );
    }
}
