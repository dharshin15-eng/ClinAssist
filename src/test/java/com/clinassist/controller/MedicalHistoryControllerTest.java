package com.clinassist.controller;

import com.clinassist.dto.MedicalHistoryRequestDto;
import com.clinassist.dto.MedicalHistoryResponseDto;
import com.clinassist.entity.HistoryStatus;
import com.clinassist.entity.Role;
import com.clinassist.entity.User;
import com.clinassist.repository.UserRepository;
import com.clinassist.security.JwtTokenProvider;
import com.clinassist.service.MedicalHistoryService;
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
class MedicalHistoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MedicalHistoryService historyService;

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
    void testCreateMedicalHistorySuccess201() throws Exception {
        String token = getValidJwtToken(Role.DOCTOR);
        MedicalHistoryRequestDto request = new MedicalHistoryRequestDto("Hypertension", "High BP", LocalDate.of(2018, 6, 15), HistoryStatus.ACTIVE);
        MedicalHistoryResponseDto response = new MedicalHistoryResponseDto("hist-1", "pat-1", "Hypertension", "High BP", LocalDate.of(2018, 6, 15), HistoryStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now());

        when(historyService.createMedicalHistory(eq("pat-1"), any(MedicalHistoryRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/patients/pat-1/history")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("hist-1"))
                .andExpect(jsonPath("$.condition").value("Hypertension"));
    }

    @Test
    void testDeleteMedicalHistorySuccess204() throws Exception {
        String token = getValidJwtToken(Role.ADMIN);

        mockMvc.perform(delete("/api/patients/pat-1/history/hist-1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }
}
