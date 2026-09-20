package com.clinassist.service;

import com.clinassist.entity.*;
import com.clinassist.exception.GeminiServiceException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class GeminiServiceTest {

    @Test
    void testMissingApiKeyThrowsGeminiServiceException() {
        GeminiService service = new GeminiService("", "http://api.url", "gemini-model", 5000);
        Patient patient = new Patient();

        assertThrows(GeminiServiceException.class, () ->
                service.generateSummary(patient, List.of(), List.of(), List.of(), List.of(), List.of(), List.of())
        );
    }

    @Test
    void testGenerateSummarySuccessWithMockRestTemplate() {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);
        GeminiService service = new GeminiService("test-api-key", "http://api.url", "gemini-model", 5000, mockRestTemplate);

        String mockResponseBody = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "Clinical summary generated successfully for doctor review."
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        when(mockRestTemplate.exchange(any(String.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(new ResponseEntity<>(mockResponseBody, HttpStatus.OK));

        Patient patient = new Patient();
        patient.setFullName("John Doe");

        String result = service.generateSummary(patient, List.of(), List.of(), List.of(), List.of(), List.of(), List.of());

        assertNotNull(result);
        assertEquals("Clinical summary generated successfully for doctor review.", result);
        verify(mockRestTemplate, times(1)).exchange(any(String.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class));
    }

    @Test
    void testRetry503ServiceUnavailableSucceedsOnSecondAttempt() {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);
        GeminiService service = new GeminiService("test-api-key", "http://api.url", "gemini-model", 5000, mockRestTemplate);

        String mockResponseBody = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "Summary succeeded on retry attempt."
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        // First attempt throws 503, second attempt succeeds with 200 OK
        when(mockRestTemplate.exchange(any(String.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new HttpServerErrorException(HttpStatus.SERVICE_UNAVAILABLE, "Service Unavailable"))
                .thenReturn(new ResponseEntity<>(mockResponseBody, HttpStatus.OK));

        Patient patient = new Patient();

        String result = service.generateSummary(patient, List.of(), List.of(), List.of(), List.of(), List.of(), List.of());

        assertEquals("Summary succeeded on retry attempt.", result);
        verify(mockRestTemplate, times(2)).exchange(any(String.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class));
    }

    @Test
    void testRetry503ExhaustsMaxRetriesAndThrowsSafeException() {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);
        GeminiService service = new GeminiService("test-api-key", "http://api.url", "gemini-model", 5000, mockRestTemplate);

        // All 3 attempts fail with 503 Service Unavailable
        when(mockRestTemplate.exchange(any(String.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new HttpServerErrorException(HttpStatus.SERVICE_UNAVAILABLE, "Service Unavailable"));

        Patient patient = new Patient();

        GeminiServiceException ex = assertThrows(GeminiServiceException.class, () ->
                service.generateSummary(patient, List.of(), List.of(), List.of(), List.of(), List.of(), List.of())
        );

        assertTrue(ex.getMessage().contains("temporarily unavailable"));
        assertTrue(ex.getMessage().contains("503"));
        verify(mockRestTemplate, times(3)).exchange(any(String.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class));
    }

    @Test
    void testPermanentError401DoesNotRetry() {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);
        GeminiService service = new GeminiService("test-api-key", "http://api.url", "gemini-model", 5000, mockRestTemplate);

        when(mockRestTemplate.exchange(any(String.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new HttpClientErrorException(HttpStatus.UNAUTHORIZED, "Unauthorized"));

        Patient patient = new Patient();

        GeminiServiceException ex = assertThrows(GeminiServiceException.class, () ->
                service.generateSummary(patient, List.of(), List.of(), List.of(), List.of(), List.of(), List.of())
        );

        assertTrue(ex.getMessage().contains("401"));
        // Verified exchange was only called ONCE (no retries for 401)
        verify(mockRestTemplate, times(1)).exchange(any(String.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class));
    }

    @Test
    void testPermanentError403DoesNotRetry() {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);
        GeminiService service = new GeminiService("test-api-key", "http://api.url", "gemini-model", 5000, mockRestTemplate);

        when(mockRestTemplate.exchange(any(String.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new HttpClientErrorException(HttpStatus.FORBIDDEN, "Forbidden"));

        Patient patient = new Patient();

        assertThrows(GeminiServiceException.class, () ->
                service.generateSummary(patient, List.of(), List.of(), List.of(), List.of(), List.of(), List.of())
        );

        verify(mockRestTemplate, times(1)).exchange(any(String.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class));
    }

    @Test
    void testPermanentError404DoesNotRetry() {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);
        GeminiService service = new GeminiService("test-api-key", "http://api.url", "gemini-model", 5000, mockRestTemplate);

        when(mockRestTemplate.exchange(any(String.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND, "Not Found"));

        Patient patient = new Patient();

        assertThrows(GeminiServiceException.class, () ->
                service.generateSummary(patient, List.of(), List.of(), List.of(), List.of(), List.of(), List.of())
        );

        verify(mockRestTemplate, times(1)).exchange(any(String.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class));
    }
}
