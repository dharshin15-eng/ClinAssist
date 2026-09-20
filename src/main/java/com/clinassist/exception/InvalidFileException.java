package com.clinassist.exception;

/**
 * Exception thrown when an uploaded file fails validation (e.g. invalid type, invalid magic bytes, or oversized).
 */
public class InvalidFileException extends RuntimeException {

    public InvalidFileException(String message) {
        super(message);
    }
}
