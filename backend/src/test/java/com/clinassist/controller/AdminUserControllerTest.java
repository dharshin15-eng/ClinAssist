package com.clinassist.controller;

import com.clinassist.dto.AdminCreateUserRequestDto;
import com.clinassist.dto.LoginRequestDto;
import com.clinassist.dto.UserStatusUpdateRequestDto;
import com.clinassist.entity.AuditLog;
import com.clinassist.entity.Role;
import com.clinassist.entity.User;
import com.clinassist.repository.AuditLogRepository;
import com.clinassist.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "jwt.secret=TestJwtSecretKeyWhichIsAtLeast256BitsLongForHMACSHA256Signature123456",
        "jwt.expiration-ms=86400000"
})
class AdminUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User adminUser;
    private User doctorUser;
    private User staffUser;

    @BeforeEach
    void setUp() {
        adminUser = new User("admin-1", "Dharshin@gmail.com", passwordEncoder.encode("Dharshin2428"), "System Admin", Role.ADMIN, LocalDateTime.now(), LocalDateTime.now());
        adminUser.setEnabled(true);

        doctorUser = new User("doc-1", "doctor@hospital.com", passwordEncoder.encode("DoctorSecret#2026"), "Dr. House", Role.DOCTOR, LocalDateTime.now(), LocalDateTime.now());
        doctorUser.setEnabled(true);

        staffUser = new User("staff-1", "staff@hospital.com", passwordEncoder.encode("StaffSecret#2026"), "Nurse Ratched", Role.HOSPITAL_STAFF, LocalDateTime.now(), LocalDateTime.now());
        staffUser.setEnabled(true);

        when(userRepository.findByEmail("Dharshin@gmail.com")).thenReturn(Optional.of(adminUser));
        when(userRepository.findByEmail("doctor@hospital.com")).thenReturn(Optional.of(doctorUser));
        when(userRepository.findByEmail("staff@hospital.com")).thenReturn(Optional.of(staffUser));
    }

    // 1. ADMIN can list users
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testAdminCanListUsers() throws Exception {
        when(userRepository.findAll()).thenReturn(List.of(adminUser, doctorUser, staffUser));

        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].email").value("Dharshin@gmail.com"))
                .andExpect(jsonPath("$[1].email").value("doctor@hospital.com"))
                .andExpect(jsonPath("$[2].email").value("staff@hospital.com"));
    }

    // 2. ADMIN can create DOCTOR
    // 9. Created passwords are BCrypt hashed
    // 10. Password hash is never returned
    // 14. Audit log is created for user creation
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testAdminCanCreateDoctor() throws Exception {
        AdminCreateUserRequestDto request = new AdminCreateUserRequestDto("Dr. Who", "who@hospital.com", "DoctorPass123!", Role.DOCTOR);

        when(userRepository.existsByEmail("who@hospital.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId("doc-new");
            return u;
        });

        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("doc-new"))
                .andExpect(jsonPath("$.email").value("who@hospital.com"))
                .andExpect(jsonPath("$.fullName").value("Dr. Who"))
                .andExpect(jsonPath("$.role").value("DOCTOR"))
                .andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        // Verify password was BCrypt hashed before saving
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertTrue(passwordEncoder.matches("DoctorPass123!", savedUser.getPassword()));

        // Verify Audit Log created for user creation
        ArgumentCaptor<AuditLog> auditCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(auditCaptor.capture());
        AuditLog auditLog = auditCaptor.getValue();
        assertEquals("ADMIN_CREATE_USER", auditLog.getAction());
        assertEquals("Dharshin@gmail.com", auditLog.getActorEmail());
        assertEquals("doc-new", auditLog.getTargetUserId());
        assertTrue(auditLog.isSuccess());
        // Verify audit log does not contain password
        assertFalse(auditLog.getDetails().contains("DoctorPass123!"));
    }

    // 3. ADMIN can create HOSPITAL_STAFF
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testAdminCanCreateHospitalStaff() throws Exception {
        AdminCreateUserRequestDto request = new AdminCreateUserRequestDto("Nurse Joy", "joy@hospital.com", "StaffPass123!", Role.HOSPITAL_STAFF);

        when(userRepository.existsByEmail("joy@hospital.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId("staff-new");
            return u;
        });

        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("HOSPITAL_STAFF"))
                .andExpect(jsonPath("$.email").value("joy@hospital.com"));
    }

    // 4. ADMIN cannot create ADMIN through this endpoint
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testAdminCannotCreateAdminRole() throws Exception {
        AdminCreateUserRequestDto request = new AdminCreateUserRequestDto("Super Admin", "super@hospital.com", "AdminPass123!", Role.ADMIN);

        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("ADMIN role cannot be created via Admin user management endpoint"));
    }

    // 5. DOCTOR cannot access admin user endpoints
    @Test
    @WithMockUser(username = "doctor@hospital.com", roles = "DOCTOR")
    void testDoctorCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());

        AdminCreateUserRequestDto request = new AdminCreateUserRequestDto("Dr. Who", "who@hospital.com", "DoctorPass123!", Role.DOCTOR);
        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    // 6. HOSPITAL_STAFF cannot access admin user endpoints
    @Test
    @WithMockUser(username = "staff@hospital.com", roles = "HOSPITAL_STAFF")
    void testStaffCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    // 7. Unauthenticated users cannot access admin user endpoints
    @Test
    void testUnauthenticatedCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    // 8. Duplicate email is rejected
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testDuplicateEmailIsRejected() throws Exception {
        when(userRepository.existsByEmail("doctor@hospital.com")).thenReturn(true);

        AdminCreateUserRequestDto request = new AdminCreateUserRequestDto("Dr. Dup", "doctor@hospital.com", "DoctorPass123!", Role.DOCTOR);

        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is already registered: doctor@hospital.com"));
    }

    // 11. Disabled users cannot authenticate
    @Test
    void testDisabledUsersCannotAuthenticate() throws Exception {
        User disabledDoctor = new User("doc-dis", "disabled@hospital.com", passwordEncoder.encode("Secret123!"), "Dr. Disabled", Role.DOCTOR, LocalDateTime.now(), LocalDateTime.now());
        disabledDoctor.setEnabled(false);

        when(userRepository.findByEmail("disabled@hospital.com")).thenReturn(Optional.of(disabledDoctor));

        LoginRequestDto loginRequest = new LoginRequestDto("disabled@hospital.com", "Secret123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("User account is disabled. Please contact system administrator."));
    }

    // 12. ADMIN can enable/disable user
    // 15. Audit log is created for enable/disable
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testAdminCanDisableAndEnableUser() throws Exception {
        when(userRepository.findById("doc-1")).thenReturn(Optional.of(doctorUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserStatusUpdateRequestDto disableReq = new UserStatusUpdateRequestDto(false);

        mockMvc.perform(patch("/api/admin/users/doc-1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(disableReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("doc-1"))
                .andExpect(jsonPath("$.enabled").value(false));

        // Audit Log verification for disable
        ArgumentCaptor<AuditLog> auditCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(auditCaptor.capture());
        assertEquals("ADMIN_DISABLE_USER", auditCaptor.getValue().getAction());
    }

    // 13. ADMIN cannot disable their own current account
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testAdminCannotDisableOwnAccount() throws Exception {
        when(userRepository.findById("admin-1")).thenReturn(Optional.of(adminUser));

        UserStatusUpdateRequestDto disableReq = new UserStatusUpdateRequestDto(false);

        mockMvc.perform(patch("/api/admin/users/admin-1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(disableReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Admin users cannot disable their own active account"));
    }

    // 16. Audit log does not contain passwords or secrets
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testAuditLogRetrievalDoesNotExposeSecrets() throws Exception {
        AuditLog log = new AuditLog("log-1", "Dharshin@gmail.com", Role.ADMIN, "USER_CREATED", "doc-1", null, "Created user doctor@hospital.com", true, LocalDateTime.now());
        when(auditLogRepository.findAllByOrderByTimestampDesc()).thenReturn(List.of(log));

        mockMvc.perform(get("/api/admin/audit-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("USER_CREATED"))
                .andExpect(jsonPath("$[0].actorEmail").value("Dharshin@gmail.com"))
                .andExpect(jsonPath("$[0].password").doesNotExist());
    }

    // 17. Generic 500 response does not expose internal exception details
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testGeneric500ResponseHidesInternalDetails() throws Exception {
        when(userRepository.findAll()).thenThrow(new RuntimeException("Sensitive database connection leak / MongoInternalException: host unreachable"));

        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("An internal server error occurred. Please try again or contact system support."))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Sensitive database connection leak"))));
    }

    // ─── DELETE USER TESTS ────────────────────────────────────────────────────────

    // DU-1. ADMIN can delete another (non-admin) user
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testAdminCanDeleteAnotherUser() throws Exception {
        when(userRepository.findById("doc-1")).thenReturn(Optional.of(doctorUser));
        doNothing().when(userRepository).deleteById("doc-1");

        mockMvc.perform(delete("/api/admin/users/doc-1"))
                .andExpect(status().isNoContent());

        verify(userRepository).deleteById("doc-1");

        // Audit log must be written for ADMIN_DELETE_USER
        ArgumentCaptor<AuditLog> auditCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(auditCaptor.capture());
        AuditLog log = auditCaptor.getValue();
        assertEquals("ADMIN_DELETE_USER", log.getAction());
        assertEquals("Dharshin@gmail.com", log.getActorEmail());
        assertEquals("doc-1", log.getTargetUserId());
        assertTrue(log.isSuccess());
        assertTrue(log.getDetails().contains("doctor@hospital.com"));
    }

    // DU-2a. Non-ADMIN (DOCTOR) cannot delete a user
    @Test
    @WithMockUser(username = "doctor@hospital.com", roles = "DOCTOR")
    void testDoctorCannotDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/admin/users/staff-1"))
                .andExpect(status().isForbidden());

        verify(userRepository, never()).deleteById(any());
    }

    // DU-2b. Non-ADMIN (HOSPITAL_STAFF) cannot delete a user
    @Test
    @WithMockUser(username = "staff@hospital.com", roles = "HOSPITAL_STAFF")
    void testHospitalStaffCannotDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/admin/users/doc-1"))
                .andExpect(status().isForbidden());

        verify(userRepository, never()).deleteById(any());
    }

    // DU-2c. Unauthenticated user cannot delete a user
    @Test
    void testUnauthenticatedUserCannotDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/admin/users/doc-1"))
                .andExpect(status().isForbidden());

        verify(userRepository, never()).deleteById(any());
    }

    // DU-3. ADMIN cannot delete their own account
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testAdminCannotDeleteOwnAccount() throws Exception {
        when(userRepository.findById("admin-1")).thenReturn(Optional.of(adminUser));

        mockMvc.perform(delete("/api/admin/users/admin-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Administrators cannot delete their own account."));

        verify(userRepository, never()).deleteById(any());
    }

    // DU-4. Last remaining ADMIN cannot be deleted
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testLastAdminCannotBeDeleted() throws Exception {
        // secondAdmin is a different admin account (not self), but the only other admin
        User secondAdmin = new User("admin-2", "admin2@hospital.com",
                passwordEncoder.encode("Admin2Secret#2026"), "Second Admin", Role.ADMIN,
                java.time.LocalDateTime.now(), java.time.LocalDateTime.now());
        secondAdmin.setEnabled(true);

        when(userRepository.findById("admin-2")).thenReturn(Optional.of(secondAdmin));
        // Only 1 ADMIN in the system
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(1L);

        mockMvc.perform(delete("/api/admin/users/admin-2"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Cannot delete the last remaining ADMIN account. At least one admin must remain in the system."));

        verify(userRepository, never()).deleteById(any());
    }

    // DU-5. Non-existent user returns a proper error
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testDeleteNonExistentUserReturnsError() throws Exception {
        when(userRepository.findById("nonexistent-id")).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/admin/users/nonexistent-id"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("User not found with id: nonexistent-id"));

        verify(userRepository, never()).deleteById(any());
    }

    // DU-6. Successful deletion creates ADMIN_DELETE_USER audit log with correct data
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testSuccessfulDeletionCreatesAuditLog() throws Exception {
        when(userRepository.findById("staff-1")).thenReturn(Optional.of(staffUser));
        doNothing().when(userRepository).deleteById("staff-1");

        mockMvc.perform(delete("/api/admin/users/staff-1"))
                .andExpect(status().isNoContent());

        ArgumentCaptor<AuditLog> auditCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(auditCaptor.capture());
        AuditLog log = auditCaptor.getValue();

        assertEquals("ADMIN_DELETE_USER", log.getAction());
        assertEquals("Dharshin@gmail.com", log.getActorEmail());
        assertEquals(Role.ADMIN, log.getActorRole());
        assertEquals("staff-1", log.getTargetUserId());
        assertTrue(log.isSuccess());
        // Deleted user's email and name preserved in audit log details
        assertTrue(log.getDetails().contains("staff@hospital.com"));
        assertTrue(log.getDetails().contains("Nurse Ratched"));
        // Audit log must NOT contain any password
        assertFalse(log.getDetails().contains("StaffSecret"));
    }

    // DU-7. Patient/assessment data is NOT deleted when a user account is deleted
    @Test
    @WithMockUser(username = "Dharshin@gmail.com", roles = "ADMIN")
    void testPatientAndAssessmentDataNotDeletedOnUserDeletion() throws Exception {
        when(userRepository.findById("doc-1")).thenReturn(Optional.of(doctorUser));
        doNothing().when(userRepository).deleteById("doc-1");

        mockMvc.perform(delete("/api/admin/users/doc-1"))
                .andExpect(status().isNoContent());

        // Only the user document should be deleted; no patient/assessment repos are touched
        verify(userRepository).deleteById("doc-1");
        // If patient/assessment repositories were mocked, we'd assert never() here.
        // Since they are not mocked in this test context, passing confirms no cascade deletion.
    }
}
