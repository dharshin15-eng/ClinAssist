package com.clinassist.service;

import com.clinassist.dto.AdminCreateUserRequestDto;
import com.clinassist.dto.UserResponseDto;
import com.clinassist.entity.Role;
import com.clinassist.entity.User;
import com.clinassist.exception.InvalidCredentialsException;
import com.clinassist.exception.SelfDisablingException;
import com.clinassist.exception.UnauthorizedRoleAssignmentException;
import com.clinassist.exception.UserAlreadyExistsException;
import com.clinassist.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service orchestrating Admin User Management operations, role validation, status toggling, and audit logging.
 */
@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public AdminUserService(UserRepository userRepository,
                            PasswordEncoder passwordEncoder,
                            AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponseDto::new)
                .collect(Collectors.toList());
    }

    public UserResponseDto createUser(AdminCreateUserRequestDto dto, String adminEmail) {
        if (dto.getRole() == Role.ADMIN) {
            throw new UnauthorizedRoleAssignmentException("ADMIN role cannot be created via Admin user management endpoint");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new UserAlreadyExistsException("Email is already registered: " + dto.getEmail());
        }

        User user = new User(
                dto.getEmail(),
                passwordEncoder.encode(dto.getPassword()),
                dto.getFullName(),
                dto.getRole()
        );
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        // Record Audit Log event
        auditLogService.logEvent(
                adminEmail,
                Role.ADMIN,
                "ADMIN_CREATE_USER",
                savedUser.getId(),
                savedUser.getEmail(),
                "Created user " + savedUser.getFullName() + " with role " + savedUser.getRole(),
                true
        );

        return new UserResponseDto(savedUser);
    }

    public UserResponseDto updateUserStatus(String targetUserId, boolean enabled, String adminEmail) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new InvalidCredentialsException("User not found with id: " + targetUserId));

        if (targetUser.getEmail().equalsIgnoreCase(adminEmail) && !enabled) {
            throw new SelfDisablingException("Admin users cannot disable their own active account");
        }

        targetUser.setEnabled(enabled);
        targetUser.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(targetUser);

        String action = enabled ? "ADMIN_ENABLE_USER" : "ADMIN_DISABLE_USER";
        auditLogService.logEvent(
                adminEmail,
                Role.ADMIN,
                action,
                savedUser.getId(),
                savedUser.getEmail(),
                (enabled ? "Enabled" : "Disabled") + " user account: " + savedUser.getEmail(),
                true
        );

        return new UserResponseDto(savedUser);
    }
}
