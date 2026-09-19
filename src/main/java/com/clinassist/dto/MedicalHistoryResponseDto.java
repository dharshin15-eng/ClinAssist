package com.clinassist.dto;

import com.clinassist.entity.HistoryStatus;
import com.clinassist.entity.MedicalHistory;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for returning medical history details.
 */
public class MedicalHistoryResponseDto {

    private String id;
    private String patientId;
    private String condition;
    private String description;
    private LocalDate diagnosedDate;
    private HistoryStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MedicalHistoryResponseDto() {
    }

    public MedicalHistoryResponseDto(MedicalHistory history) {
        this.id = history.getId();
        this.patientId = history.getPatientId();
        this.condition = history.getCondition();
        this.description = history.getDescription();
        this.diagnosedDate = history.getDiagnosedDate();
        this.status = history.getStatus();
        this.createdAt = history.getCreatedAt();
        this.updatedAt = history.getUpdatedAt();
    }

    public MedicalHistoryResponseDto(String id, String patientId, String condition, String description, LocalDate diagnosedDate, HistoryStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.patientId = patientId;
        this.condition = condition;
        this.description = description;
        this.diagnosedDate = diagnosedDate;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDiagnosedDate() {
        return diagnosedDate;
    }

    public void setDiagnosedDate(LocalDate diagnosedDate) {
        this.diagnosedDate = diagnosedDate;
    }

    public HistoryStatus getStatus() {
        return status;
    }

    public void setStatus(HistoryStatus status) {
        this.status = status;
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
}
