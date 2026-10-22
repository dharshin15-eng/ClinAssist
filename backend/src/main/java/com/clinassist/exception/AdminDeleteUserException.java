package com.clinassist.exception;

/**
 * Exception thrown when an admin attempts an invalid user deletion,
 * such as deleting their own account or deleting the last remaining ADMIN.
 */
public class AdminDeleteUserException extends RuntimeException {

    public AdminDeleteUserException(String message) {
        super(message);
    }
}
