package com.clinassist.exception;

/**
 * Exception thrown when user registration uses an existing email.
 */
public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
