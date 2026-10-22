package com.clinassist;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application entry point for ClinAssist backend.
 */
@SpringBootApplication
public class ClinAssistApplication {

    static {
        System.setProperty("java.net.preferIPv6Addresses", "true");
    }

    public static void main(String[] args) {
        System.setProperty("java.net.preferIPv6Addresses", "true");
        SpringApplication.run(ClinAssistApplication.class, args);
    }
}
