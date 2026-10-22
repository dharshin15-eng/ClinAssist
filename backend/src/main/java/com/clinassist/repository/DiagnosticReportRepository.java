package com.clinassist.repository;

import com.clinassist.entity.DiagnosticReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data MongoDB repository for DiagnosticReport documents.
 */
@Repository
public interface DiagnosticReportRepository extends MongoRepository<DiagnosticReport, String> {

    List<DiagnosticReport> findByPatientId(String patientId);

    Optional<DiagnosticReport> findByIdAndPatientId(String id, String patientId);
}
