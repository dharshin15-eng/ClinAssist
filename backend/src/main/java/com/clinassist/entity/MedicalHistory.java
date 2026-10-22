package com.clinassist.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * MongoDB document representing a patient medical history record.
 */
@Document(collection = "medical_history")
public class MedicalHistory {

    @Id
    private String id;

    @Indexed
    private String patientId;

    private String condition;
    private String description;
    private LocalDate diagnosedDate;
    private HistoryStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MedicalHistory() {
    }

    public MedicalHistory(String patientId, String condition, String description, LocalDate diagnosedDate, HistoryStatus status) {
        this.patientId = patientId;
        this.condition = condition;
        this.description = description;
        this.diagnosedDate = diagnosedDate;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public MedicalHistory(String id, String patientId, String condition, String description, LocalDate diagnosedDate, HistoryStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
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
