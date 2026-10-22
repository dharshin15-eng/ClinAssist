package com.clinassist.dto;

import com.clinassist.entity.SymptomSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object for creating or updating an allergy record.
 */
public class AllergyRequestDto {

    @NotBlank(message = "Allergen is required")
    private String allergen;

    @NotBlank(message = "Reaction is required")
    private String reaction;

    @NotNull(message = "Severity is required")
    private SymptomSeverity severity;

    private String notes;

    public AllergyRequestDto() {
    }

    public AllergyRequestDto(String allergen, String reaction, SymptomSeverity severity, String notes) {
        this.allergen = allergen;
        this.reaction = reaction;
        this.severity = severity;
        this.notes = notes;
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
}
