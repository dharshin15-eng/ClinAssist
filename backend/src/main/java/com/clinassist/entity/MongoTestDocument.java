package com.clinassist.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Temporary entity to verify MongoDB database connectivity.
 */
@Document(collection = "mongo_test")
public class MongoTestDocument {

    @Id
    private String id;
    private String message;

    public MongoTestDocument() {
    }

    public MongoTestDocument(String message) {
        this.message = message;
    }

    public MongoTestDocument(String id, String message) {
        this.id = id;
        this.message = message;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
