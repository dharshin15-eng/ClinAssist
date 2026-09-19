package com.clinassist.dto;

import com.clinassist.entity.FindingCategory;
import com.clinassist.entity.FindingSeverity;
import com.clinassist.entity.FindingSource;

/**
 * Data Transfer Object for assessment findings.
 */
public class AssessmentFindingResponseDto {

    private String id;
    private String assessmentId;
    private FindingCategory category;
    private String title;
    private String description;
    private FindingSeverity severity;
    private FindingSource source;

    public AssessmentFindingResponseDto() {
    }

    public AssessmentFindingResponseDto(String id, String assessmentId, FindingCategory category, String title,
                                       String description, FindingSeverity severity, FindingSource source) {
        this.id = id;
        this.assessmentId = assessmentId;
        this.category = category;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.source = source;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(String assessmentId) {
        this.assessmentId = assessmentId;
    }

    public FindingCategory getCategory() {
        return category;
    }

    public void setCategory(FindingCategory category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public FindingSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(FindingSeverity severity) {
        this.severity = severity;
    }

    public FindingSource getSource() {
        return source;
    }

    public void setSource(FindingSource source) {
        this.source = source;
    }
}
