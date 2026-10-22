package com.clinassist.exception;

/**
 * Exception thrown when Gemini API integration fails or configuration is missing.
 */
public class GeminiServiceException extends RuntimeException {

    public GeminiServiceException(String message) {
        super(message);
    }

    public GeminiServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
