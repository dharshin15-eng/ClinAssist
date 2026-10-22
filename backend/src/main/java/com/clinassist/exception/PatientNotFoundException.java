package com.clinassist.exception;

/**
 * Exception thrown when a patient record is not found in MongoDB.
 */
public class PatientNotFoundException extends RuntimeException {

    public PatientNotFoundException(String message) {
        super(message);
    }
}
