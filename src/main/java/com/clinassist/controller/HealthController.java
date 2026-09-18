package com.clinassist.controller;

import com.clinassist.dto.HealthResponseDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for application health monitoring.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public HealthResponseDto getHealth() {
        return new HealthResponseDto("UP", "ClinAssist");
    }
}
