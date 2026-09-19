package com.clinassist.dto;

import com.clinassist.entity.HistoryStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

/**
 * Data Transfer Object for creating or updating a medical history record.
 */
public class MedicalHistoryRequestDto {

    @NotBlank(message = "Condition is required")
    private String condition;

    private String description;

    @PastOrPresent(message = "Diagnosed date cannot be in the future")
    private LocalDate diagnosedDate;

    @NotNull(message = "Status is required")
    private HistoryStatus status;

    public MedicalHistoryRequestDto() {
    }

    public MedicalHistoryRequestDto(String condition, String description, LocalDate diagnosedDate, HistoryStatus status) {
        this.condition = condition;
        this.description = description;
        this.diagnosedDate = diagnosedDate;
        this.status = status;
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
}
