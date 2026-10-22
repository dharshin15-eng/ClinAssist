package com.clinassist.repository;

import com.clinassist.entity.MongoTestDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for MongoTestDocument connectivity testing.
 */
@Repository
public interface MongoTestRepository extends MongoRepository<MongoTestDocument, String> {
}
