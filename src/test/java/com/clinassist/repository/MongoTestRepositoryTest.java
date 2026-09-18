package com.clinassist.repository;

import com.clinassist.entity.MongoTestDocument;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test verifying live MongoDB document saving and retrieval.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "spring.data.mongodb.uri=${MONGODB_URI:mongodb://localhost:27017/clinassist?connectTimeoutMS=1000&serverSelectionTimeoutMS=1000}"
})
class MongoTestRepositoryTest {

    @Autowired
    private MongoTestRepository mongoTestRepository;

    @Test
    void testMongoSaveAndRetrieve() {
        MongoTestDocument doc = new MongoTestDocument("ClinAssist MongoDB connection successful");
        MongoTestDocument savedDoc = mongoTestRepository.save(doc);

        assertNotNull(savedDoc.getId(), "Saved document ID should not be null");
        assertEquals("ClinAssist MongoDB connection successful", savedDoc.getMessage());

        Optional<MongoTestDocument> retrievedDoc = mongoTestRepository.findById(savedDoc.getId());
        assertTrue(retrievedDoc.isPresent(), "Retrieved document should be present in MongoDB");
        assertEquals("ClinAssist MongoDB connection successful", retrievedDoc.get().getMessage());

        // Cleanup test document after verification
        mongoTestRepository.deleteById(savedDoc.getId());
    }
}
