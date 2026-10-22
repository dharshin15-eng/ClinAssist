package com.clinassist.config;

import com.clinassist.entity.Role;
import com.clinassist.entity.User;
import com.clinassist.repository.PatientRepository;
import com.clinassist.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PatientRepository patientRepository;

    private PasswordEncoder passwordEncoder;
    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        dataInitializer = new DataInitializer(userRepository, patientRepository, passwordEncoder);
    }

    @Test
    void testDataInitializerUpdatesExistingAdminAccount() {
        User oldAdmin = new User("admin-id-1", "admin@hospital.com", passwordEncoder.encode("OldPassword123!"), "System Admin", Role.ADMIN, LocalDateTime.now(), LocalDateTime.now());
        when(userRepository.findByEmail("admin@hospital.com")).thenReturn(Optional.of(oldAdmin));
        when(userRepository.existsByEmail("doctor@hospital.com")).thenReturn(true);
        when(userRepository.existsByEmail("staff@hospital.com")).thenReturn(true);
        when(patientRepository.count()).thenReturn(1L);

        dataInitializer.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, atLeastOnce()).save(userCaptor.capture());

        User updatedAdmin = userCaptor.getAllValues().get(0);
        assertEquals("admin-id-1", updatedAdmin.getId());
        assertEquals("Dharshin@gmail.com", updatedAdmin.getEmail());
        assertEquals(Role.ADMIN, updatedAdmin.getRole());
        assertTrue(passwordEncoder.matches("Dharshin2428", updatedAdmin.getPassword()));
    }

    @Test
    void testDataInitializerCreatesAdminOnFreshDatabase() {
        when(userRepository.findByEmail("admin@hospital.com")).thenReturn(Optional.empty());
        when(userRepository.existsByEmail("Dharshin@gmail.com")).thenReturn(false);
        when(userRepository.existsByEmail("doctor@hospital.com")).thenReturn(true);
        when(userRepository.existsByEmail("staff@hospital.com")).thenReturn(true);
        when(patientRepository.count()).thenReturn(1L);

        dataInitializer.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, atLeastOnce()).save(userCaptor.capture());

        User createdAdmin = userCaptor.getAllValues().get(0);
        assertEquals("Dharshin@gmail.com", createdAdmin.getEmail());
        assertEquals(Role.ADMIN, createdAdmin.getRole());
        assertTrue(passwordEncoder.matches("Dharshin2428", createdAdmin.getPassword()));
    }

    @Test
    void testDataInitializerEnsuresPasswordAndRoleWhenDharshinExists() {
        User existingAdmin = new User("admin-id-2", "Dharshin@gmail.com", passwordEncoder.encode("OldPassword123!"), "System Administrator", Role.ADMIN, LocalDateTime.now(), LocalDateTime.now());
        when(userRepository.findByEmail("admin@hospital.com")).thenReturn(Optional.empty());
        when(userRepository.existsByEmail("Dharshin@gmail.com")).thenReturn(true);
        when(userRepository.findByEmail("Dharshin@gmail.com")).thenReturn(Optional.of(existingAdmin));
        when(userRepository.existsByEmail("doctor@hospital.com")).thenReturn(true);
        when(userRepository.existsByEmail("staff@hospital.com")).thenReturn(true);
        when(patientRepository.count()).thenReturn(1L);

        dataInitializer.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, atLeastOnce()).save(userCaptor.capture());

        User updatedAdmin = userCaptor.getAllValues().get(0);
        assertEquals("Dharshin@gmail.com", updatedAdmin.getEmail());
        assertEquals(Role.ADMIN, updatedAdmin.getRole());
        assertTrue(passwordEncoder.matches("Dharshin2428", updatedAdmin.getPassword()));
    }
}
