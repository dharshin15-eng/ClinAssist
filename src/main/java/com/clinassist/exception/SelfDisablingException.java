package com.clinassist.exception;

/**
 * Exception thrown when an authenticated Admin attempts to disable their own user account.
 */
public class SelfDisablingException extends RuntimeException {

    public SelfDisablingException(String message) {
        super(message);
    }
}
