package com.clinassist.controller;

import com.clinassist.dto.AdminCreateUserRequestDto;
import com.clinassist.dto.UserResponseDto;
import com.clinassist.dto.UserStatusUpdateRequestDto;
import com.clinassist.entity.AuditLog;
import com.clinassist.service.AdminUserService;
import com.clinassist.service.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Administrative User Management and Audit Logs.
 * Protected strictly by Spring Security method authorization: ADMIN role only.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final AuditLogService auditLogService;

    public AdminUserController(AdminUserService adminUserService, AuditLogService auditLogService) {
        this.adminUserService = adminUserService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = adminUserService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody AdminCreateUserRequestDto dto,
                                                     Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "ADMIN";
        UserResponseDto response = adminUserService.createUser(dto, adminEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<UserResponseDto> updateUserStatus(@PathVariable String userId,
                                                           @Valid @RequestBody UserStatusUpdateRequestDto dto,
                                                           Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "ADMIN";
        UserResponseDto response = adminUserService.updateUserStatus(userId, dto.getEnabled(), adminEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        List<AuditLog> auditLogs = auditLogService.getAllAuditLogs();
        return ResponseEntity.ok(auditLogs);
    }
}
