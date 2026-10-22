package com.clinassist.controller;

import com.clinassist.dto.SymptomRequestDto;
import com.clinassist.dto.SymptomResponseDto;
import com.clinassist.service.SymptomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing patient symptoms.
 */
@RestController
@RequestMapping("/api/patients/{patientId}/symptoms")
@PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_STAFF', 'DOCTOR')")
public class SymptomController {

    private final SymptomService symptomService;

    public SymptomController(SymptomService symptomService) {
        this.symptomService = symptomService;
    }

    @PostMapping
    public ResponseEntity<SymptomResponseDto> createSymptom(@PathVariable String patientId,
                                                            @Valid @RequestBody SymptomRequestDto dto) {
        SymptomResponseDto response = symptomService.createSymptom(patientId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<SymptomResponseDto>> getSymptomsByPatientId(@PathVariable String patientId) {
        List<SymptomResponseDto> symptoms = symptomService.getSymptomsByPatientId(patientId);
        return ResponseEntity.ok(symptoms);
    }

    @GetMapping("/{symptomId}")
    public ResponseEntity<SymptomResponseDto> getSymptomById(@PathVariable String patientId,
                                                             @PathVariable String symptomId) {
        SymptomResponseDto symptom = symptomService.getSymptomById(patientId, symptomId);
        return ResponseEntity.ok(symptom);
    }

    @PutMapping("/{symptomId}")
    public ResponseEntity<SymptomResponseDto> updateSymptom(@PathVariable String patientId,
                                                             @PathVariable String symptomId,
                                                             @Valid @RequestBody SymptomRequestDto dto) {
        SymptomResponseDto updated = symptomService.updateSymptom(patientId, symptomId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{symptomId}")
    public ResponseEntity<Void> deleteSymptom(@PathVariable String patientId,
                                               @PathVariable String symptomId) {
        symptomService.deleteSymptom(patientId, symptomId);
        return ResponseEntity.noContent().build();
    }
}
