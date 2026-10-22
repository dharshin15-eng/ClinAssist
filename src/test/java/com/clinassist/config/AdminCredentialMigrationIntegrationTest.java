package com.clinassist.config;

import com.clinassist.dto.AuthResponseDto;
import com.clinassist.dto.LoginRequestDto;
import com.clinassist.entity.Role;
import com.clinassist.entity.User;
import com.clinassist.exception.InvalidCredentialsException;
import com.clinassist.repository.UserRepository;
import com.clinassist.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AdminCredentialMigrationIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DataInitializer dataInitializer;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    @Test
    void verifyAdminCredentialsMigrationInMongoDB() {
        // Run DataInitializer to ensure migration is executed on the DB
        dataInitializer.run();

        // 1. Verify old admin email admin@hospital.com no longer exists
        Optional<User> oldAdmin = userRepository.findByEmail("admin@hospital.com");
        assertFalse(oldAdmin.isPresent(), "Old admin email (admin@hospital.com) should no longer exist in MongoDB");

        // 2. Verify new admin email Dharshin@gmail.com exists
        Optional<User> newAdminOpt = userRepository.findByEmail("Dharshin@gmail.com");
        assertTrue(newAdminOpt.isPresent(), "New admin email (Dharshin@gmail.com) must exist in MongoDB");

        User newAdmin = newAdminOpt.get();
        assertEquals(Role.ADMIN, newAdmin.getRole(), "Role must be ADMIN");
        assertTrue(passwordEncoder.matches("Dharshin2428", newAdmin.getPassword()), "Password must be BCrypt hashed Dharshin2428");
        assertNotEquals("Dharshin2428", newAdmin.getPassword(), "Plaintext password must NOT be stored in DB");

        // 3. Verify AuthService.login with new credentials succeeds
        AuthResponseDto response = authService.login(new LoginRequestDto("Dharshin@gmail.com", "Dharshin2428"));
        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("Dharshin@gmail.com", response.getEmail());
        assertEquals(Role.ADMIN, response.getRole());

        // 4. Verify AuthService.login with old credentials fails
        assertThrows(InvalidCredentialsException.class, () -> {
            authService.login(new LoginRequestDto("admin@hospital.com", "AdminSecret#2026"));
        });
    }
}
