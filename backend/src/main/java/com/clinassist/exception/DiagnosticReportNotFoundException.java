package com.clinassist.exception;

/**
 * Exception thrown when a diagnostic report is not found or does not belong to the specified patient.
 */
public class DiagnosticReportNotFoundException extends ClinicalRecordNotFoundException {

    public DiagnosticReportNotFoundException(String message) {
        super(message);
    }
}
