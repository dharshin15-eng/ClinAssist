package com.clinassist.service;

import com.clinassist.entity.*;
import com.clinassist.exception.GeminiServiceException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Service providing isolated integration with Google Gemini REST API.
 */
@Service
public class GeminiService {

    private final String apiKey;
    private final String apiUrl;
    private final String model;
    private final int timeoutMs;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public GeminiService(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models}") String apiUrl,
            @Value("${gemini.model:gemini-1.5-flash}") String model,
            @Value("${gemini.timeout-ms:10000}") int timeoutMs) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;
        this.timeoutMs = timeoutMs;
        this.objectMapper = new ObjectMapper();

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutMs);
        factory.setReadTimeout(timeoutMs);
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Package-private constructor for unit testing with custom RestTemplate.
     */
    GeminiService(String apiKey, String apiUrl, String model, int timeoutMs, RestTemplate restTemplate) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;
        this.timeoutMs = timeoutMs;
        this.objectMapper = new ObjectMapper();
        this.restTemplate = restTemplate;
    }

    public String generateSummary(Patient patient,
                                  List<AssessmentFinding> findings,
                                  List<Symptom> symptoms,
                                  List<MedicalHistory> histories,
                                  List<Allergy> allergies,
                                  List<Medication> medications,
                                  List<DiagnosticReport> reports) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new GeminiServiceException("Gemini API key is not configured. Set the GEMINI_API_KEY environment variable.");
        }

        String prompt = buildPrompt(patient, findings, symptoms, histories, allergies, medications, reports);

        try {
            String url = String.format("%s/%s:generateContent?key=%s", apiUrl, model, apiKey);

            Map<String, Object> part = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> requestBody = Map.of("contents", List.of(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new GeminiServiceException("Gemini API returned non-2xx HTTP status: " + response.getStatusCode());
            }

            return extractTextFromResponse(response.getBody());
        } catch (GeminiServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new GeminiServiceException("Failed to call Gemini API: " + e.getMessage(), e);
        }
    }

    private String buildPrompt(Patient patient,
                               List<AssessmentFinding> findings,
                               List<Symptom> symptoms,
                               List<MedicalHistory> histories,
                               List<Allergy> allergies,
                               List<Medication> medications,
                               List<DiagnosticReport> reports) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an AI healthcare decision-support assistant helping a licensed doctor.\n");
        sb.append("STRICT SAFETY INSTRUCTIONS:\n");
        sb.append("1. Do NOT make a definitive diagnosis.\n");
        sb.append("2. Do NOT prescribe, change, or stop medications.\n");
        sb.append("3. Do NOT invent facts, laboratory values, symptoms, or patient data not provided below.\n");
        sb.append("4. Use ONLY the supplied patient data and rule-engine findings.\n");
        sb.append("5. Remind the reader that professional clinical judgment by a doctor is strictly required.\n\n");

        sb.append("PATIENT INFORMATION:\n");
        if (patient != null) {
            sb.append("- Full Name: ").append(patient.getFullName()).append("\n");
            sb.append("- Age/DOB: ").append(patient.getDateOfBirth()).append("\n");
            sb.append("- Gender: ").append(patient.getGender()).append("\n");
            sb.append("- Blood Group: ").append(patient.getBloodGroup()).append("\n");
        }

        sb.append("\nRECORDED SYMPTOMS:\n");
        if (symptoms != null && !symptoms.isEmpty()) {
            for (Symptom s : symptoms) {
                sb.append("- ").append(s.getName()).append(" (Severity: ").append(s.getSeverity()).append(", Duration: ").append(s.getDuration()).append(")\n");
            }
        } else {
            sb.append("None recorded.\n");
        }

        sb.append("\nRECORDED MEDICAL HISTORY:\n");
        if (histories != null && !histories.isEmpty()) {
            for (MedicalHistory h : histories) {
                sb.append("- ").append(h.getCondition()).append(" (Status: ").append(h.getStatus()).append(")\n");
            }
        } else {
            sb.append("None recorded.\n");
        }

        sb.append("\nDOCUMENTED ALLERGIES:\n");
        if (allergies != null && !allergies.isEmpty()) {
            for (Allergy a : allergies) {
                sb.append("- ").append(a.getAllergen()).append(" (Reaction: ").append(a.getReaction()).append(")\n");
            }
        } else {
            sb.append("None documented.\n");
        }

        sb.append("\nCURRENT MEDICATIONS:\n");
        if (medications != null && !medications.isEmpty()) {
            for (Medication m : medications) {
                sb.append("- ").append(m.getName()).append(" (Dosage: ").append(m.getDosage()).append(", Frequency: ").append(m.getFrequency()).append(")\n");
            }
        } else {
            sb.append("None recorded.\n");
        }

        sb.append("\nDIAGNOSTIC REPORTS:\n");
        if (reports != null && !reports.isEmpty()) {
            for (DiagnosticReport r : reports) {
                sb.append("- ").append(r.getReportName()).append(" (Type: ").append(r.getReportType()).append(", Status: ").append(r.getStatus()).append(")\n");
            }
        } else {
            sb.append("None recorded.\n");
        }

        sb.append("\nDETERMINISTIC RULE ENGINE FINDINGS:\n");
        if (findings != null && !findings.isEmpty()) {
            for (AssessmentFinding f : findings) {
                sb.append("- [").append(f.getCategory()).append("] ").append(f.getTitle()).append(": ").append(f.getDescription()).append("\n");
            }
        } else {
            sb.append("No specific rule-engine findings.\n");
        }

        sb.append("\nPlease provide a clear, concise structured summary of the above information and clinical considerations for doctor review.");
        return sb.toString();
    }

    private String extractTextFromResponse(String jsonResponseBody) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
            throw new GeminiServiceException("Unexpected or malformed response JSON from Gemini API");
        } catch (GeminiServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new GeminiServiceException("Failed to parse Gemini API response JSON", e);
        }
    }
}
