package com.clinassist.exception;

/**
 * Exception thrown when attempting to create a patient with a duplicate patientId.
 */
public class DuplicatePatientIdException extends RuntimeException {

    public DuplicatePatientIdException(String message) {
        super(message);
    }
}
