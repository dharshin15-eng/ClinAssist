package com.clinassist.exception;

/**
 * Exception thrown when authentication fails due to bad credentials.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
