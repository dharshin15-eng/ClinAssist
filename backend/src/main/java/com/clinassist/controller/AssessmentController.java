package com.clinassist.controller;

import com.clinassist.dto.AiSummaryResponseDto;
import com.clinassist.dto.AssessmentResponseDto;
import com.clinassist.service.AssessmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing clinical decision-support assessments and AI summaries.
 */
@RestController
@RequestMapping("/api/patients/{patientId}/assessments")
@PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_STAFF', 'DOCTOR')")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping
    public ResponseEntity<AssessmentResponseDto> createAssessment(@PathVariable String patientId) {
        AssessmentResponseDto response = assessmentService.createAssessment(patientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AssessmentResponseDto>> getAssessmentsByPatientId(@PathVariable String patientId) {
        List<AssessmentResponseDto> assessments = assessmentService.getAssessmentsByPatientId(patientId);
        return ResponseEntity.ok(assessments);
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<AssessmentResponseDto> getAssessmentById(@PathVariable String patientId,
                                                                   @PathVariable String assessmentId) {
        AssessmentResponseDto assessment = assessmentService.getAssessmentById(patientId, assessmentId);
        return ResponseEntity.ok(assessment);
    }

    @PostMapping("/{assessmentId}/ai-summary")
    public ResponseEntity<AiSummaryResponseDto> generateAiSummary(@PathVariable String patientId,
                                                                   @PathVariable String assessmentId) {
        AiSummaryResponseDto response = assessmentService.generateAiSummary(patientId, assessmentId);
        return ResponseEntity.ok(response);
    }
}
