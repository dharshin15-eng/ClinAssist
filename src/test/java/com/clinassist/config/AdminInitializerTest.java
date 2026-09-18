package com.clinassist.config;

import com.clinassist.entity.Role;
import com.clinassist.entity.User;
import com.clinassist.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminInitializerTest {

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private AdminInitializer adminInitializer;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        adminInitializer = new AdminInitializer(userRepository, passwordEncoder);
    }

    @Test
    void testAdminInitializerSkipsWhenEnvVarsBlank() {
        ReflectionTestUtils.setField(adminInitializer, "adminEmail", "");
        ReflectionTestUtils.setField(adminInitializer, "adminPassword", "");
        ReflectionTestUtils.setField(adminInitializer, "adminFullName", "");

        adminInitializer.run();

        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testAdminInitializerCreatesAdminWhenEnvVarsProvided() {
        ReflectionTestUtils.setField(adminInitializer, "adminEmail", "admin@hospital.com");
        ReflectionTestUtils.setField(adminInitializer, "adminPassword", "SecureAdminPass123!");
        ReflectionTestUtils.setField(adminInitializer, "adminFullName", "System Admin");

        when(userRepository.existsByEmail("admin@hospital.com")).thenReturn(false);

        adminInitializer.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedAdmin = userCaptor.getValue();
        assertEquals("admin@hospital.com", savedAdmin.getEmail());
        assertEquals("System Admin", savedAdmin.getFullName());
        assertEquals(Role.ADMIN, savedAdmin.getRole());
        assertTrue(passwordEncoder.matches("SecureAdminPass123!", savedAdmin.getPassword()));
    }

    @Test
    void testAdminInitializerSkipsWhenAdminAlreadyExists() {
        ReflectionTestUtils.setField(adminInitializer, "adminEmail", "admin@hospital.com");
        ReflectionTestUtils.setField(adminInitializer, "adminPassword", "SecureAdminPass123!");
        ReflectionTestUtils.setField(adminInitializer, "adminFullName", "System Admin");

        when(userRepository.existsByEmail("admin@hospital.com")).thenReturn(true);

        adminInitializer.run();

        verify(userRepository, never()).save(any());
    }
}
