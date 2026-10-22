package com.clinassist.repository;

import com.clinassist.entity.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data MongoDB repository for AuditLog entity.
 */
@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    List<AuditLog> findAllByOrderByTimestampDesc();

    List<AuditLog> findByActorEmailOrderByTimestampDesc(String actorEmail);
}
