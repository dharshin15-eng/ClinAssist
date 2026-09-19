package com.clinassist.service;

import com.clinassist.entity.*;
import com.clinassist.exception.GeminiServiceException;
import org.junit.jupiter.api.Test;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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
    }

    @Test
    void testApiFailureThrowsGeminiServiceException() {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);
        GeminiService service = new GeminiService("test-api-key", "http://api.url", "gemini-model", 5000, mockRestTemplate);

        when(mockRestTemplate.exchange(any(String.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RuntimeException("Connection timed out"));

        Patient patient = new Patient();

        assertThrows(GeminiServiceException.class, () ->
                service.generateSummary(patient, List.of(), List.of(), List.of(), List.of(), List.of(), List.of())
        );
    }
}
