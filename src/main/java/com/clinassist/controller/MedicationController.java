package com.clinassist.controller;

import com.clinassist.dto.MedicationRequestDto;
import com.clinassist.dto.MedicationResponseDto;
import com.clinassist.service.MedicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing patient medications.
 */
@RestController
@RequestMapping("/api/patients/{patientId}/medications")
@PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_STAFF', 'DOCTOR')")
public class MedicationController {

    private final MedicationService medicationService;

    public MedicationController(MedicationService medicationService) {
        this.medicationService = medicationService;
    }

    @PostMapping
    public ResponseEntity<MedicationResponseDto> createMedication(@PathVariable String patientId,
                                                                   @Valid @RequestBody MedicationRequestDto dto) {
        MedicationResponseDto response = medicationService.createMedication(patientId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<MedicationResponseDto>> getMedicationsByPatientId(@PathVariable String patientId) {
        List<MedicationResponseDto> medications = medicationService.getMedicationsByPatientId(patientId);
        return ResponseEntity.ok(medications);
    }

    @GetMapping("/{medicationId}")
    public ResponseEntity<MedicationResponseDto> getMedicationById(@PathVariable String patientId,
                                                                     @PathVariable String medicationId) {
        MedicationResponseDto medication = medicationService.getMedicationById(patientId, medicationId);
        return ResponseEntity.ok(medication);
    }

    @PutMapping("/{medicationId}")
    public ResponseEntity<MedicationResponseDto> updateMedication(@PathVariable String patientId,
                                                                     @PathVariable String medicationId,
                                                                     @Valid @RequestBody MedicationRequestDto dto) {
        MedicationResponseDto updated = medicationService.updateMedication(patientId, medicationId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{medicationId}")
    public ResponseEntity<Void> deleteMedication(@PathVariable String patientId,
                                                       @PathVariable String medicationId) {
        medicationService.deleteMedication(patientId, medicationId);
        return ResponseEntity.noContent().build();
    }
}
