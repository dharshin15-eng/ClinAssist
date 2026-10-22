package com.clinassist.dto;

import com.clinassist.entity.Allergy;
import com.clinassist.entity.SymptomSeverity;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for returning allergy record details.
 */
public class AllergyResponseDto {

    private String id;
    private String patientId;
    private String allergen;
    private String reaction;
    private SymptomSeverity severity;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AllergyResponseDto() {
    }

    public AllergyResponseDto(Allergy allergy) {
        this.id = allergy.getId();
        this.patientId = allergy.getPatientId();
        this.allergen = allergy.getAllergen();
        this.reaction = allergy.getReaction();
        this.severity = allergy.getSeverity();
        this.notes = allergy.getNotes();
        this.createdAt = allergy.getCreatedAt();
        this.updatedAt = allergy.getUpdatedAt();
    }

    public AllergyResponseDto(String id, String patientId, String allergen, String reaction, SymptomSeverity severity, String notes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.patientId = patientId;
        this.allergen = allergen;
        this.reaction = reaction;
        this.severity = severity;
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

    public String getAllergen() {
        return allergen;
    }

    public void setAllergen(String allergen) {
        this.allergen = allergen;
    }

    public String getReaction() {
        return reaction;
    }

    public void setReaction(String reaction) {
        this.reaction = reaction;
    }

    public SymptomSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(SymptomSeverity severity) {
        this.severity = severity;
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
