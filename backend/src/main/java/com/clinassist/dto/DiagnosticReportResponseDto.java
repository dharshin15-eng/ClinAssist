package com.clinassist.dto;

import com.clinassist.entity.ReportStatus;
import com.clinassist.entity.ReportType;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for returning diagnostic report responses.
 */
public class DiagnosticReportResponseDto {

    private String id;
    private String patientId;
    private String reportName;
    private ReportType reportType;
    private LocalDate testDate;
    private String labName;
    private ReportStatus status;
    private String summary;
    private String reportReference;
    private String fileId;
    private String fileName;
    private String fileContentType;
    private Long fileSize;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DiagnosticReportResponseDto() {
    }

    public DiagnosticReportResponseDto(String id, String patientId, String reportName, ReportType reportType,
                                       LocalDate testDate, String labName, ReportStatus status, String summary,
                                       String reportReference, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.patientId = patientId;
        this.reportName = reportName;
        this.reportType = reportType;
        this.testDate = testDate;
        this.labName = labName;
        this.status = status;
        this.summary = summary;
        this.reportReference = reportReference;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public DiagnosticReportResponseDto(String id, String patientId, String reportName, ReportType reportType,
                                       LocalDate testDate, String labName, ReportStatus status, String summary,
                                       String reportReference, String fileId, String fileName, String fileContentType,
                                       Long fileSize, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.patientId = patientId;
        this.reportName = reportName;
        this.reportType = reportType;
        this.testDate = testDate;
        this.labName = labName;
        this.status = status;
        this.summary = summary;
        this.reportReference = reportReference;
        this.fileId = fileId;
        this.fileName = fileName;
        this.fileContentType = fileContentType;
        this.fileSize = fileSize;
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

    public String getFileId() {
        return fileId;
    }

    public void setFileId(String fileId) {
        this.fileId = fileId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileContentType() {
        return fileContentType;
    }

    public void setFileContentType(String fileContentType) {
        this.fileContentType = fileContentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
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
