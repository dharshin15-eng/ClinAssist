package com.clinassist.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document representing a security audit event in ClinAssist.
 */
@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    @Indexed
    private String actorEmail;
    private Role actorRole;
    private String action;
    private String targetUserId;
    private String targetResourceId;
    private String details;
    private boolean success;
    private LocalDateTime timestamp;

    public AuditLog() {
    }

    public AuditLog(String actorEmail, Role actorRole, String action, String targetUserId, String targetResourceId, String details, boolean success) {
        this.actorEmail = actorEmail;
        this.actorRole = actorRole;
        this.action = action;
        this.targetUserId = targetUserId;
        this.targetResourceId = targetResourceId;
        this.details = details;
        this.success = success;
        this.timestamp = LocalDateTime.now();
    }

    public AuditLog(String id, String actorEmail, Role actorRole, String action, String targetUserId, String targetResourceId, String details, boolean success, LocalDateTime timestamp) {
        this.id = id;
        this.actorEmail = actorEmail;
        this.actorRole = actorRole;
        this.action = action;
        this.targetUserId = targetUserId;
        this.targetResourceId = targetResourceId;
        this.details = details;
        this.success = success;
        this.timestamp = timestamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public void setActorEmail(String actorEmail) {
        this.actorEmail = actorEmail;
    }

    public Role getActorRole() {
        return actorRole;
    }

    public void setActorRole(Role actorRole) {
        this.actorRole = actorRole;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(String targetUserId) {
        this.targetUserId = targetUserId;
    }

    public String getTargetResourceId() {
        return targetResourceId;
    }

    public void setTargetResourceId(String targetResourceId) {
        this.targetResourceId = targetResourceId;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
