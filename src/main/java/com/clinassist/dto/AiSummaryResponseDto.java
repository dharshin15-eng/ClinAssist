package com.clinassist.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for AI generated summary response.
 */
public class AiSummaryResponseDto {

    private String assessmentId;
    private String patientId;
    private String aiSummary;
    private String disclaimer;
    private LocalDateTime generatedAt;

    public AiSummaryResponseDto() {
    }

    public AiSummaryResponseDto(String assessmentId, String patientId, String aiSummary, String disclaimer, LocalDateTime generatedAt) {
        this.assessmentId = assessmentId;
        this.patientId = patientId;
        this.aiSummary = aiSummary;
        this.disclaimer = disclaimer;
        this.generatedAt = generatedAt;
    }

    public String getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(String assessmentId) {
        this.assessmentId = assessmentId;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}
