package com.clinassist.repository;

import com.clinassist.entity.MedicalHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data MongoDB repository for MedicalHistory entity.
 */
@Repository
public interface MedicalHistoryRepository extends MongoRepository<MedicalHistory, String> {

    List<MedicalHistory> findByPatientId(String patientId);

    Optional<MedicalHistory> findByIdAndPatientId(String id, String patientId);
}
