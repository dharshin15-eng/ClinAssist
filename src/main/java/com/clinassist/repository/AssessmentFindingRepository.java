package com.clinassist.repository;

import com.clinassist.entity.AssessmentFinding;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data MongoDB repository for AssessmentFinding documents.
 */
@Repository
public interface AssessmentFindingRepository extends MongoRepository<AssessmentFinding, String> {

    List<AssessmentFinding> findByAssessmentId(String assessmentId);

    void deleteByAssessmentId(String assessmentId);
}
