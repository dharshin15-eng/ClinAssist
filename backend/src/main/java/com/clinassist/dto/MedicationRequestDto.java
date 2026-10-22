package com.clinassist.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object for creating or updating a medication record.
 */
public class MedicationRequestDto {

    @NotBlank(message = "Medication name is required")
    private String name;

    @NotBlank(message = "Dosage is required")
    private String dosage;

    @NotBlank(message = "Frequency is required")
    private String frequency;

    private String notes;

    public MedicationRequestDto() {
    }

    public MedicationRequestDto(String name, String dosage, String frequency, String notes) {
        this.name = name;
        this.dosage = dosage;
        this.frequency = frequency;
        this.notes = notes;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
