package com.clinassist.controller;

import com.clinassist.dto.PatientRequestDto;
import com.clinassist.dto.PatientResponseDto;
import com.clinassist.entity.Role;
import com.clinassist.entity.User;
import com.clinassist.exception.DuplicatePatientIdException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.UserRepository;
import com.clinassist.security.JwtTokenProvider;
import com.clinassist.service.PatientService;
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

import java.time.LocalDate;
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
class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PatientService patientService;

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
    void testCreatePatientSuccess201() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);
        PatientRequestDto request = new PatientRequestDto(null, "John Doe", LocalDate.of(1985, 5, 20), "MALE", "9876543210", "john@hospital.com", "City", "O+");
        PatientResponseDto response = new PatientResponseDto("m-1", "PAT-1001", "John Doe", LocalDate.of(1985, 5, 20), "MALE", "9876543210", "john@hospital.com", "City", "O+", LocalDateTime.now(), LocalDateTime.now());

        when(patientService.createPatient(any(PatientRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/patients")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("m-1"))
                .andExpect(jsonPath("$.patientId").value("PAT-1001"))
                .andExpect(jsonPath("$.fullName").value("John Doe"));
    }

    @Test
    void testCreatePatientDuplicatePatientIdConflict409() throws Exception {
        String token = getValidJwtToken(Role.HOSPITAL_STAFF);
        PatientRequestDto request = new PatientRequestDto("PAT-DUP", "Jane Doe", LocalDate.of(1990, 1, 1), "FEMALE", "1234567890", "jane@hospital.com", "City", "A+");

        when(patientService.createPatient(any(PatientRequestDto.class)))
                .thenThrow(new DuplicatePatientIdException("Patient ID already exists: PAT-DUP"));

        mockMvc.perform(post("/api/patients")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Patient ID already exists: PAT-DUP"));
    }

    @Test
    void testCreatePatientInvalidPayloadBadRequest400() throws Exception {
        String token = getValidJwtToken(Role.ADMIN);
        // Blank fullName & Future date of birth
        PatientRequestDto request = new PatientRequestDto(null, "", LocalDate.now().plusYears(1), "MALE", "", "invalid-email", "", "");

        mockMvc.perform(post("/api/patients")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Error"));
    }

    @Test
    void testGetAllPatientsSuccess200() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);
        PatientResponseDto p1 = new PatientResponseDto("m-1", "PAT-1001", "P One", LocalDate.of(1990, 1, 1), "MALE", "111", "p1@test.com", "A1", "A+", LocalDateTime.now(), LocalDateTime.now());
        when(patientService.getAllPatients()).thenReturn(List.of(p1));

        mockMvc.perform(get("/api/patients")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].patientId").value("PAT-1001"));
    }

    @Test
    void testGetPatientByIdSuccess200() throws Exception {
        String token = getValidJwtToken(Role.HOSPITAL_STAFF);
        PatientResponseDto p1 = new PatientResponseDto("m-1", "PAT-1001", "P One", LocalDate.of(1990, 1, 1), "MALE", "111", "p1@test.com", "A1", "A+", LocalDateTime.now(), LocalDateTime.now());
        when(patientService.getPatientById("m-1")).thenReturn(p1);

        mockMvc.perform(get("/api/patients/m-1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("m-1"))
                .andExpect(jsonPath("$.fullName").value("P One"));
    }

    @Test
    void testGetPatientByIdNotFound404() throws Exception {
        String token = getValidJwtToken(Role.ADMIN);
        when(patientService.getPatientById("missing-1")).thenThrow(new PatientNotFoundException("Patient not found with ID: missing-1"));

        mockMvc.perform(get("/api/patients/missing-1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Patient not found with ID: missing-1"));
    }

    @Test
    void testUpdatePatientSuccess200() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);
        PatientRequestDto request = new PatientRequestDto("PAT-1001", "Updated Name", LocalDate.of(1985, 5, 20), "MALE", "9876543210", "john@hospital.com", "New City", "O+");
        PatientResponseDto response = new PatientResponseDto("m-1", "PAT-1001", "Updated Name", LocalDate.of(1985, 5, 20), "MALE", "9876543210", "john@hospital.com", "New City", "O+", LocalDateTime.now(), LocalDateTime.now());

        when(patientService.updatePatient(eq("m-1"), any(PatientRequestDto.class))).thenReturn(response);

        mockMvc.perform(put("/api/patients/m-1")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Name"))
                .andExpect(jsonPath("$.address").value("New City"));
    }

    @Test
    void testDeletePatientSuccess204NoContent() throws Exception {
        String token = getValidJwtToken(Role.ADMIN);

        mockMvc.perform(delete("/api/patients/m-1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    @Test
    void testDeletePatientNotFound404() throws Exception {
        String token = getValidJwtToken(Role.HOSPITAL_STAFF);
        doThrow(new PatientNotFoundException("Patient not found with ID: missing-m1"))
                .when(patientService).deletePatient("missing-m1");

        mockMvc.perform(delete("/api/patients/missing-m1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void testAllThreeRolesCanAccessPatientApis() throws Exception {
        // ADMIN access
        String adminToken = getValidJwtToken(Role.ADMIN);
        mockMvc.perform(get("/api/patients").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // HOSPITAL_STAFF access
        String staffToken = getValidJwtToken(Role.HOSPITAL_STAFF);
        mockMvc.perform(get("/api/patients").header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk());

        // DOCTOR access
        String doctorToken = getValidJwtToken(Role.DOCTOR);
        mockMvc.perform(get("/api/patients").header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk());
    }

    @Test
    void testUnauthenticatedRequestForbiddenOrUnauthorized() throws Exception {
        mockMvc.perform(get("/api/patients"))
                .andExpect(status().isForbidden());
    }
}
