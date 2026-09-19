package com.clinassist.dto;

import com.clinassist.entity.SymptomSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object for creating or updating a symptom record.
 */
public class SymptomRequestDto {

    @NotBlank(message = "Symptom name is required")
    private String name;

    @NotNull(message = "Severity is required")
    private SymptomSeverity severity;

    @NotBlank(message = "Duration is required")
    private String duration;

    private String notes;

    public SymptomRequestDto() {
    }

    public SymptomRequestDto(String name, SymptomSeverity severity, String duration, String notes) {
        this.name = name;
        this.severity = severity;
        this.duration = duration;
        this.notes = notes;
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
}
