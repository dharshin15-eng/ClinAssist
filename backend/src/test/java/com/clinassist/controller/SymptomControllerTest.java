package com.clinassist.controller;

import com.clinassist.dto.SymptomRequestDto;
import com.clinassist.dto.SymptomResponseDto;
import com.clinassist.entity.Role;
import com.clinassist.entity.SymptomSeverity;
import com.clinassist.entity.User;
import com.clinassist.exception.ClinicalRecordNotFoundException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.UserRepository;
import com.clinassist.security.JwtTokenProvider;
import com.clinassist.service.SymptomService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "jwt.secret=TestJwtSecretKeyWhichIsAtLeast256BitsLongForHMACSHA256Signature123456",
        "jwt.expiration-ms=86400000"
})
class SymptomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SymptomService symptomService;

    @MockitoBean
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private String getValidJwtToken(Role role) {
        String email = role.name().toLowerCase() + "@hospital.com";
        User user = new User("id-" + role.name(), email, passwordEncoder.encode("password"), "Test User", role, LocalDateTime.now(), LocalDateTime.now());
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        return tokenProvider.generateToken(email, role.name());
    }

    @Test
    void testCreateSymptomSuccess201() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);
        SymptomRequestDto request = new SymptomRequestDto("Fever", SymptomSeverity.SEVERE, "3 days", "High temp");
        SymptomResponseDto response = new SymptomResponseDto("symp-1", "pat-1", "Fever", SymptomSeverity.SEVERE, "3 days", "High temp", LocalDateTime.now(), LocalDateTime.now());

        when(symptomService.createSymptom(eq("pat-1"), any(SymptomRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/patients/pat-1/symptoms")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("symp-1"))
                .andExpect(jsonPath("$.name").value("Fever"));
    }

    @Test
    void testCreateSymptomPatientNotFound404() throws Exception {
        String token = getValidJwtToken(Role.HOSPITAL_STAFF);
        SymptomRequestDto request = new SymptomRequestDto("Fever", SymptomSeverity.MILD, "1 day", "Notes");

        when(symptomService.createSymptom(eq("missing-pat"), any(SymptomRequestDto.class)))
                .thenThrow(new PatientNotFoundException("Patient not found with ID: missing-pat"));

        mockMvc.perform(post("/api/patients/missing-pat/symptoms")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void testGetSymptomByIdCrossPatientOwnershipMismatch404() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);

        when(symptomService.getSymptomById("pat-B", "symp-A"))
                .thenThrow(new ClinicalRecordNotFoundException("Symptom not found with ID: symp-A for patient: pat-B"));

        mockMvc.perform(get("/api/patients/pat-B/symptoms/symp-A")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void testDeleteSymptomSuccess204NoContent() throws Exception {
        String token = getValidJwtToken(Role.ADMIN);

        mockMvc.perform(delete("/api/patients/pat-1/symptoms/symp-1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    @Test
    void testUnauthenticatedRequestForbiddenOrUnauthorized() throws Exception {
        mockMvc.perform(get("/api/patients/pat-1/symptoms"))
                .andExpect(status().isForbidden());
    }
}
