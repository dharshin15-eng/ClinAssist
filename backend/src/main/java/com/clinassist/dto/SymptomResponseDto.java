package com.clinassist.dto;

import com.clinassist.entity.Symptom;
import com.clinassist.entity.SymptomSeverity;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for returning symptom record details.
 */
public class SymptomResponseDto {

    private String id;
    private String patientId;
    private String name;
    private SymptomSeverity severity;
    private String duration;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SymptomResponseDto() {
    }

    public SymptomResponseDto(Symptom symptom) {
        this.id = symptom.getId();
        this.patientId = symptom.getPatientId();
        this.name = symptom.getName();
        this.severity = symptom.getSeverity();
        this.duration = symptom.getDuration();
        this.notes = symptom.getNotes();
        this.createdAt = symptom.getCreatedAt();
        this.updatedAt = symptom.getUpdatedAt();
    }

    public SymptomResponseDto(String id, String patientId, String name, SymptomSeverity severity, String duration, String notes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.patientId = patientId;
        this.name = name;
        this.severity = severity;
        this.duration = duration;
        this.notes = notes;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public SymptomSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(SymptomSeverity severity) {
        this.severity = severity;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
