package com.clinassist.service;

import com.clinassist.entity.AuditLog;
import com.clinassist.entity.Role;
import com.clinassist.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for recording and querying security audit log events.
 */
@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public AuditLog logEvent(String actorEmail, Role actorRole, String action, String targetUserId, String targetResourceId, String details, boolean success) {
        AuditLog auditLog = new AuditLog(actorEmail, actorRole, action, targetUserId, targetResourceId, details, success);
        return auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
