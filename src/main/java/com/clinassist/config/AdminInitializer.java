package com.clinassist.config;

import com.clinassist.entity.Role;
import com.clinassist.entity.User;
import com.clinassist.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Initializes an ADMIN user ONLY when explicit admin credentials are provided via environment variables.
 * Never uses default passwords or default usernames.
 */
@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${CLINASSIST_ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${CLINASSIST_ADMIN_PASSWORD:}")
    private String adminPassword;

    @Value("${CLINASSIST_ADMIN_FULL_NAME:}")
    private String adminFullName;

    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!StringUtils.hasText(adminEmail) || !StringUtils.hasText(adminPassword) || !StringUtils.hasText(adminFullName)) {
            logger.info("Admin initializer: No explicit environment credentials provided. Skipping initial ADMIN creation.");
            return;
        }

        if (userRepository.existsByEmail(adminEmail)) {
            logger.info("Admin initializer: User with email {} already exists. Skipping duplicate ADMIN creation.", adminEmail);
            return;
        }

        User adminUser = new User(
                adminEmail,
                passwordEncoder.encode(adminPassword),
                adminFullName,
                Role.ADMIN
        );

        userRepository.save(adminUser);
        logger.info("Admin initializer: Initial ADMIN user successfully created for email: {}", adminEmail);
    }
}
