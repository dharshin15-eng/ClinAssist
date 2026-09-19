package com.clinassist.repository;

import com.clinassist.entity.Assessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data MongoDB repository for Assessment documents.
 */
@Repository
public interface AssessmentRepository extends MongoRepository<Assessment, String> {

    List<Assessment> findByPatientId(String patientId);

    Optional<Assessment> findByIdAndPatientId(String id, String patientId);
}
