package com.clinassist.controller;

import com.clinassist.dto.AllergyRequestDto;
import com.clinassist.dto.AllergyResponseDto;
import com.clinassist.service.AllergyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing patient allergies.
 */
@RestController
@RequestMapping("/api/patients/{patientId}/allergies")
@PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_STAFF', 'DOCTOR')")
public class AllergyController {

    private final AllergyService allergyService;

    public AllergyController(AllergyService allergyService) {
        this.allergyService = allergyService;
    }

    @PostMapping
    public ResponseEntity<AllergyResponseDto> createAllergy(@PathVariable String patientId,
                                                           @Valid @RequestBody AllergyRequestDto dto) {
        AllergyResponseDto response = allergyService.createAllergy(patientId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AllergyResponseDto>> getAllergiesByPatientId(@PathVariable String patientId) {
        List<AllergyResponseDto> allergies = allergyService.getAllergiesByPatientId(patientId);
        return ResponseEntity.ok(allergies);
    }

    @GetMapping("/{allergyId}")
    public ResponseEntity<AllergyResponseDto> getAllergyById(@PathVariable String patientId,
                                                             @PathVariable String allergyId) {
        AllergyResponseDto allergy = allergyService.getAllergyById(patientId, allergyId);
        return ResponseEntity.ok(allergy);
    }

    @PutMapping("/{allergyId}")
    public ResponseEntity<AllergyResponseDto> updateAllergy(@PathVariable String patientId,
                                                             @PathVariable String allergyId,
                                                             @Valid @RequestBody AllergyRequestDto dto) {
        AllergyResponseDto updated = allergyService.updateAllergy(patientId, allergyId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{allergyId}")
    public ResponseEntity<Void> deleteAllergy(@PathVariable String patientId,
                                               @PathVariable String allergyId) {
        allergyService.deleteAllergy(patientId, allergyId);
        return ResponseEntity.noContent().build();
    }
}
