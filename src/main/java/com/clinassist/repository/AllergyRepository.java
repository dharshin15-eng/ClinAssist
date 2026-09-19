package com.clinassist.repository;

import com.clinassist.entity.Allergy;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data MongoDB repository for Allergy entity.
 */
@Repository
public interface AllergyRepository extends MongoRepository<Allergy, String> {

    List<Allergy> findByPatientId(String patientId);

    Optional<Allergy> findByIdAndPatientId(String id, String patientId);
}
