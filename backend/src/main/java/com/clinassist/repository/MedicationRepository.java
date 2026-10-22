package com.clinassist.repository;

import com.clinassist.entity.Medication;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data MongoDB repository for Medication entity.
 */
@Repository
public interface MedicationRepository extends MongoRepository<Medication, String> {

    List<Medication> findByPatientId(String patientId);

    Optional<Medication> findByIdAndPatientId(String id, String patientId);
}
