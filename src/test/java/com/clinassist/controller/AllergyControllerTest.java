package com.clinassist.controller;

import com.clinassist.dto.AllergyRequestDto;
import com.clinassist.dto.AllergyResponseDto;
import com.clinassist.entity.Role;
import com.clinassist.entity.SymptomSeverity;
import com.clinassist.entity.User;
import com.clinassist.repository.UserRepository;
import com.clinassist.security.JwtTokenProvider;
import com.clinassist.service.AllergyService;
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
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
class AllergyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AllergyService allergyService;

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
    void testCreateAllergySuccess201() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);
        AllergyRequestDto request = new AllergyRequestDto("Peanuts", "Anaphylaxis", SymptomSeverity.SEVERE, "Carry EpiPen");
        AllergyResponseDto response = new AllergyResponseDto("all-1", "pat-1", "Peanuts", "Anaphylaxis", SymptomSeverity.SEVERE, "Carry EpiPen", LocalDateTime.now(), LocalDateTime.now());

        when(allergyService.createAllergy(eq("pat-1"), any(AllergyRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/patients/pat-1/allergies")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("all-1"))
                .andExpect(jsonPath("$.allergen").value("Peanuts"));
    }

    @Test
    void testDeleteAllergySuccess204() throws Exception {
        String token = getValidJwtToken(Role.HOSPITAL_STAFF);

        mockMvc.perform(delete("/api/patients/pat-1/allergies/all-1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }
}
