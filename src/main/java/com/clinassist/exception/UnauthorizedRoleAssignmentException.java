package com.clinassist.exception;

/**
 * Exception thrown when attempting unauthorized role self-assignment (e.g. public ADMIN registration).
 */
public class UnauthorizedRoleAssignmentException extends RuntimeException {

    public UnauthorizedRoleAssignmentException(String message) {
        super(message);
    }
}
