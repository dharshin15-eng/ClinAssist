package com.clinassist.dto;

import com.clinassist.entity.Medication;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for returning medication record details.
 */
public class MedicationResponseDto {

    private String id;
    private String patientId;
    private String name;
    private String dosage;
    private String frequency;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MedicationResponseDto() {
    }

    public MedicationResponseDto(Medication medication) {
        this.id = medication.getId();
        this.patientId = medication.getPatientId();
        this.name = medication.getName();
        this.dosage = medication.getDosage();
        this.frequency = medication.getFrequency();
        this.notes = medication.getNotes();
        this.createdAt = medication.getCreatedAt();
        this.updatedAt = medication.getUpdatedAt();
    }

    public MedicationResponseDto(String id, String patientId, String name, String dosage, String frequency, String notes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.patientId = patientId;
        this.name = name;
        this.dosage = dosage;
        this.frequency = frequency;
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
