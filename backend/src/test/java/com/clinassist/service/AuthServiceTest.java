package com.clinassist.service;

import com.clinassist.dto.AuthResponseDto;
import com.clinassist.dto.LoginRequestDto;
import com.clinassist.dto.RegisterRequestDto;
import com.clinassist.dto.UserResponseDto;
import com.clinassist.entity.Role;
import com.clinassist.entity.User;
import com.clinassist.exception.InvalidCredentialsException;
import com.clinassist.exception.UnauthorizedRoleAssignmentException;
import com.clinassist.exception.UserAlreadyExistsException;
import com.clinassist.repository.UserRepository;
import com.clinassist.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider tokenProvider;

    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(userRepository, passwordEncoder, tokenProvider);
    }

    @Test
    void testRegisterDoctorSuccess() {
        RegisterRequestDto request = new RegisterRequestDto("doctor@hospital.com", "Password123!", "Dr. John Doe", Role.DOCTOR);

        when(userRepository.existsByEmail("doctor@hospital.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId("doc-123");
            return u;
        });
        when(tokenProvider.generateToken("doctor@hospital.com", "DOCTOR")).thenReturn("mock-jwt-token");

        AuthResponseDto response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("doctor@hospital.com", response.getEmail());
        assertEquals(Role.DOCTOR, response.getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegisterHospitalStaffSuccess() {
        RegisterRequestDto request = new RegisterRequestDto("staff@hospital.com", "StaffPassword123!", "Nurse Sarah", Role.HOSPITAL_STAFF);

        when(userRepository.existsByEmail("staff@hospital.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId("staff-123");
            return u;
        });
        when(tokenProvider.generateToken("staff@hospital.com", "HOSPITAL_STAFF")).thenReturn("mock-staff-jwt-token");

        AuthResponseDto response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock-staff-jwt-token", response.getToken());
        assertEquals(Role.HOSPITAL_STAFF, response.getRole());
    }

    @Test
    void testRegisterAdminForbidden() {
        RegisterRequestDto request = new RegisterRequestDto("fakeadmin@hospital.com", "AdminPassword123!", "Fake Admin", Role.ADMIN);

        UnauthorizedRoleAssignmentException ex = assertThrows(
                UnauthorizedRoleAssignmentException.class,
                () -> authService.register(request)
        );

        assertEquals("ADMIN role cannot be self-assigned via public registration", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testRegisterDuplicateEmailThrowsException() {
        RegisterRequestDto request = new RegisterRequestDto("existing@hospital.com", "Password123!", "Existing User", Role.DOCTOR);
        when(userRepository.existsByEmail("existing@hospital.com")).thenReturn(true);

        UserAlreadyExistsException ex = assertThrows(
                UserAlreadyExistsException.class,
                () -> authService.register(request)
        );

        assertTrue(ex.getMessage().contains("Email is already registered"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testLoginSuccess() {
        String rawPassword = "ValidPassword123!";
        String encodedPassword = passwordEncoder.encode(rawPassword);
        User user = new User("123", "doctor@hospital.com", encodedPassword, "Dr. John", Role.DOCTOR, LocalDateTime.now(), LocalDateTime.now());

        LoginRequestDto loginRequest = new LoginRequestDto("doctor@hospital.com", rawPassword);

        when(userRepository.findByEmail("doctor@hospital.com")).thenReturn(Optional.of(user));
        when(tokenProvider.generateToken("doctor@hospital.com", "DOCTOR")).thenReturn("valid-jwt-token");

        AuthResponseDto response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("valid-jwt-token", response.getToken());
        assertEquals("doctor@hospital.com", response.getEmail());
    }

    @Test
    void testLoginInvalidPasswordThrowsException() {
        String encodedPassword = passwordEncoder.encode("CorrectPassword123!");
        User user = new User("123", "doctor@hospital.com", encodedPassword, "Dr. John", Role.DOCTOR, LocalDateTime.now(), LocalDateTime.now());

        LoginRequestDto loginRequest = new LoginRequestDto("doctor@hospital.com", "WrongPassword!");

        when(userRepository.findByEmail("doctor@hospital.com")).thenReturn(Optional.of(user));

        InvalidCredentialsException ex = assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(loginRequest)
        );

        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    void testGetCurrentUserSuccess() {
        User user = new User("user-1", "user@hospital.com", "encoded-pass", "User Name", Role.HOSPITAL_STAFF, LocalDateTime.now(), LocalDateTime.now());
        when(userRepository.findByEmail("user@hospital.com")).thenReturn(Optional.of(user));

        UserResponseDto response = authService.getCurrentUser("user@hospital.com");

        assertNotNull(response);
        assertEquals("user@hospital.com", response.getEmail());
        assertEquals(Role.HOSPITAL_STAFF, response.getRole());
    }
}
