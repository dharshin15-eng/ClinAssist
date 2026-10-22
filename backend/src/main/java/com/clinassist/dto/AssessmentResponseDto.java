package com.clinassist.dto;

import com.clinassist.entity.AssessmentStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for returning assessment responses.
 */
public class AssessmentResponseDto {

    private String id;
    private String patientId;
    private String createdBy;
    private AssessmentStatus status;
    private String aiSummary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AssessmentFindingResponseDto> findings;

    public AssessmentResponseDto() {
    }

    public AssessmentResponseDto(String id, String patientId, String createdBy, AssessmentStatus status,
                                 String aiSummary, LocalDateTime createdAt, LocalDateTime updatedAt,
                                 List<AssessmentFindingResponseDto> findings) {
        this.id = id;
        this.patientId = patientId;
        this.createdBy = createdBy;
        this.status = status;
        this.aiSummary = aiSummary;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.findings = findings;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public AssessmentStatus getStatus() {
        return status;
    }

    public void setStatus(AssessmentStatus status) {
        this.status = status;
    }

    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<AssessmentFindingResponseDto> getFindings() {
        return findings;
    }

    public void setFindings(List<AssessmentFindingResponseDto> findings) {
        this.findings = findings;
    }
}
