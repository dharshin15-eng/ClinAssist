package com.clinassist.repository;

import com.clinassist.entity.Symptom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data MongoDB repository for Symptom entity.
 */
@Repository
public interface SymptomRepository extends MongoRepository<Symptom, String> {

    List<Symptom> findByPatientId(String patientId);

    Optional<Symptom> findByIdAndPatientId(String id, String patientId);
}
