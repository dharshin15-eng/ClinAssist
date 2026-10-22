package com.clinassist.config;

import com.clinassist.entity.Patient;
import com.clinassist.entity.Role;
import com.clinassist.entity.User;
import com.clinassist.repository.PatientRepository;
import com.clinassist.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Initializes default demo accounts and sample patient records if the database is empty.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           PatientRepository patientRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedPatients();
    }

    private void seedUsers() {
        Optional<User> oldAdminOpt = userRepository.findByEmail("admin@hospital.com");
        if (oldAdminOpt.isPresent()) {
            User admin = oldAdminOpt.get();
            admin.setEmail("Dharshin@gmail.com");
            admin.setPassword(passwordEncoder.encode("Dharshin2428"));
            admin.setRole(Role.ADMIN);
            admin.setUpdatedAt(LocalDateTime.now());
            userRepository.save(admin);
            logger.info("DataInitializer: Updated existing ADMIN user from admin@hospital.com to Dharshin@gmail.com");
        } else if (!userRepository.existsByEmail("Dharshin@gmail.com")) {
            User admin = new User(
                    "Dharshin@gmail.com",
                    passwordEncoder.encode("Dharshin2428"),
                    "System Administrator",
                    Role.ADMIN
            );
            userRepository.save(admin);
            logger.info("DataInitializer: Created default ADMIN user (Dharshin@gmail.com)");
        } else {
            userRepository.findByEmail("Dharshin@gmail.com").ifPresent(admin -> {
                admin.setPassword(passwordEncoder.encode("Dharshin2428"));
                admin.setRole(Role.ADMIN);
                admin.setUpdatedAt(LocalDateTime.now());
                userRepository.save(admin);
                logger.info("DataInitializer: Ensured ADMIN user Dharshin@gmail.com is up to date");
            });
        }

        if (!userRepository.existsByEmail("doctor@hospital.com")) {
            User doctor = new User(
                    "doctor@hospital.com",
                    passwordEncoder.encode("DoctorSecret#2026"),
                    "Sarah Jenkins",
                    Role.DOCTOR
            );
            userRepository.save(doctor);
            logger.info("DataInitializer: Created default DOCTOR user (doctor@hospital.com)");
        }

        if (!userRepository.existsByEmail("staff@hospital.com")) {
            User staff = new User(
                    "staff@hospital.com",
                    passwordEncoder.encode("StaffSecret#2026"),
                    "Michael Scott",
                    Role.HOSPITAL_STAFF
            );
            userRepository.save(staff);
            logger.info("DataInitializer: Created default HOSPITAL_STAFF user (staff@hospital.com)");
        }
    }

    private void seedPatients() {
        if (patientRepository.count() == 0) {
            Patient p1 = new Patient(
                    "PAT-1001",
                    "Eleanor Vance",
                    LocalDate.of(1985, 4, 12),
                    "FEMALE",
                    "+1-555-0142",
                    "eleanor.vance@example.com",
                    "104 Hill House Rd, Blackwood, MA",
                    "O+"
            );

            Patient p2 = new Patient(
                    "PAT-1002",
                    "Robert Chase",
                    LocalDate.of(1978, 11, 23),
                    "MALE",
                    "+1-555-0188",
                    "robert.chase@example.com",
                    "452 Princeton Ave, Plainsboro, NJ",
                    "A+"
            );

            Patient p3 = new Patient(
                    "PAT-1003",
                    "Sophia Martinez",
                    LocalDate.of(1992, 7, 5),
                    "FEMALE",
                    "+1-555-0129",
                    "sophia.martinez@example.com",
                    "789 Palm Springs Blvd, Miami, FL",
                    "B-"
            );

            patientRepository.save(p1);
            patientRepository.save(p2);
            patientRepository.save(p3);
            logger.info("DataInitializer: Seeded 3 initial sample patients (PAT-1001, PAT-1002, PAT-1003)");
        }
    }
}
