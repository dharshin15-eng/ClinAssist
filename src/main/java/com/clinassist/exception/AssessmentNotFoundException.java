package com.clinassist.exception;

/**
 * Exception thrown when an assessment is not found or does not belong to the specified patient.
 */
public class AssessmentNotFoundException extends ClinicalRecordNotFoundException {

    public AssessmentNotFoundException(String message) {
        super(message);
    }
}
