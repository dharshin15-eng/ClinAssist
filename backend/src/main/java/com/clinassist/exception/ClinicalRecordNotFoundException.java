package com.clinassist.exception;

/**
 * Exception thrown when a clinical record (Symptom, Medical History, Allergy, Medication)
 * is not found or does not belong to the specified patient.
 */
public class ClinicalRecordNotFoundException extends RuntimeException {

    public ClinicalRecordNotFoundException(String message) {
        super(message);
    }
}
