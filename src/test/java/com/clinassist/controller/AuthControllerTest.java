package com.clinassist.controller;

import com.clinassist.dto.AuthResponseDto;
import com.clinassist.dto.LoginRequestDto;
import com.clinassist.dto.RegisterRequestDto;
import com.clinassist.dto.UserResponseDto;
import com.clinassist.entity.Role;
import com.clinassist.entity.User;
import com.clinassist.repository.UserRepository;
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
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "jwt.secret=TestJwtSecretKeyWhichIsAtLeast256BitsLongForHMACSHA256Signature123456",
        "jwt.expiration-ms=86400000"
})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegisterDoctorSuccess() throws Exception {
        RegisterRequestDto request = new RegisterRequestDto(
                "doctor@hospital.com",
                "Password123!",
                "Dr. John Doe",
                Role.DOCTOR
        );

        when(userRepository.existsByEmail("doctor@hospital.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId("doc-1");
            return u;
        });

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("doctor@hospital.com"))
                .andExpect(jsonPath("$.role").value("DOCTOR"));
    }

    @Test
    void testRegisterHospitalStaffSuccess() throws Exception {
        RegisterRequestDto request = new RegisterRequestDto(
                "staff@hospital.com",
                "StaffPassword123!",
                "Nurse Sarah Smith",
                Role.HOSPITAL_STAFF
        );

        when(userRepository.existsByEmail("staff@hospital.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId("staff-1");
            return u;
        });

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("staff@hospital.com"))
                .andExpect(jsonPath("$.role").value("HOSPITAL_STAFF"));
    }

    @Test
    void testRegisterAdminForbidden() throws Exception {
        RegisterRequestDto request = new RegisterRequestDto(
                "fakeadmin@hospital.com",
                "AdminPassword123!",
                "Fake Admin",
                Role.ADMIN
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("ADMIN role cannot be self-assigned via public registration"));
    }

    @Test
    void testRegisterDuplicateEmailFails() throws Exception {
        when(userRepository.existsByEmail("duplicate@hospital.com")).thenReturn(true);

        RegisterRequestDto request = new RegisterRequestDto(
                "duplicate@hospital.com",
                "NewPassword123!",
                "New User",
                Role.DOCTOR
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is already registered: duplicate@hospital.com"));
    }

    @Test
    void testLoginSuccess() throws Exception {
        User user = new User("doc-1", "doctor.login@hospital.com", passwordEncoder.encode("ValidPassword123!"), "Dr. Alice", Role.DOCTOR, LocalDateTime.now(), LocalDateTime.now());
        when(userRepository.findByEmail("doctor.login@hospital.com")).thenReturn(Optional.of(user));

        LoginRequestDto loginRequest = new LoginRequestDto("doctor.login@hospital.com", "ValidPassword123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("doctor.login@hospital.com"))
                .andExpect(jsonPath("$.role").value("DOCTOR"));
    }

    @Test
    void testLoginInvalidPasswordUnauthorized() throws Exception {
        User user = new User("doc-2", "doctor.invalid@hospital.com", passwordEncoder.encode("ValidPassword123!"), "Dr. Bob", Role.DOCTOR, LocalDateTime.now(), LocalDateTime.now());
        when(userRepository.findByEmail("doctor.invalid@hospital.com")).thenReturn(Optional.of(user));

        LoginRequestDto loginRequest = new LoginRequestDto("doctor.invalid@hospital.com", "WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void testGetCurrentUserWithTokenSuccess() throws Exception {
        User user = new User("doc-me", "me@hospital.com", passwordEncoder.encode("MySecret123!"), "Dr. Me", Role.DOCTOR, LocalDateTime.now(), LocalDateTime.now());
        when(userRepository.existsByEmail("me@hospital.com")).thenReturn(false);
        when(userRepository.findByEmail("me@hospital.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        RegisterRequestDto request = new RegisterRequestDto(
                "me@hospital.com",
                "MySecret123!",
                "Dr. Me",
                Role.DOCTOR
        );

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).get("token").asText();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("me@hospital.com"))
                .andExpect(jsonPath("$.fullName").value("Dr. Me"))
                .andExpect(jsonPath("$.role").value("DOCTOR"));
    }

    @Test
    void testGetCurrentUserWithoutTokenUnauthorized() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isForbidden());
    }
}
