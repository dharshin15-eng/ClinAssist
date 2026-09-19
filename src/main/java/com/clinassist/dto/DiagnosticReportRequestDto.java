package com.clinassist.dto;

import com.clinassist.entity.ReportStatus;
import com.clinassist.entity.ReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Data Transfer Object for creating or updating a diagnostic report.
 */
public class DiagnosticReportRequestDto {

    @NotBlank(message = "Report name is required")
    private String reportName;

    @NotNull(message = "Report type is required")
    private ReportType reportType;

    @NotNull(message = "Test date is required")
    private LocalDate testDate;

    private String labName;

    @NotNull(message = "Report status is required")
    private ReportStatus status;

    private String summary;
    private String reportReference;

    public DiagnosticReportRequestDto() {
    }

    public DiagnosticReportRequestDto(String reportName, ReportType reportType, LocalDate testDate,
                                      String labName, ReportStatus status, String summary, String reportReference) {
        this.reportName = reportName;
        this.reportType = reportType;
        this.testDate = testDate;
        this.labName = labName;
        this.status = status;
        this.summary = summary;
        this.reportReference = reportReference;
    }

    public String getReportName() {
        return reportName;
    }

    public void setReportName(String reportName) {
        this.reportName = reportName;
    }

    public ReportType getReportType() {
        return reportType;
    }

    public void setReportType(ReportType reportType) {
        this.reportType = reportType;
    }

    public LocalDate getTestDate() {
        return testDate;
    }

    public void setTestDate(LocalDate testDate) {
        this.testDate = testDate;
    }

    public String getLabName() {
        return labName;
    }

    public void setLabName(String labName) {
        this.labName = labName;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getReportReference() {
        return reportReference;
    }

    public void setReportReference(String reportReference) {
        this.reportReference = reportReference;
    }
}
