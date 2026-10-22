package com.clinassist.controller;

import com.clinassist.dto.MedicalHistoryRequestDto;
import com.clinassist.dto.MedicalHistoryResponseDto;
import com.clinassist.service.MedicalHistoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing patient medical history.
 */
@RestController
@RequestMapping("/api/patients/{patientId}/history")
@PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_STAFF', 'DOCTOR')")
public class MedicalHistoryController {

    private final MedicalHistoryService historyService;

    public MedicalHistoryController(MedicalHistoryService historyService) {
        this.historyService = historyService;
    }

    @PostMapping
    public ResponseEntity<MedicalHistoryResponseDto> createMedicalHistory(@PathVariable String patientId,
                                                                          @Valid @RequestBody MedicalHistoryRequestDto dto) {
        MedicalHistoryResponseDto response = historyService.createMedicalHistory(patientId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<MedicalHistoryResponseDto>> getMedicalHistoryByPatientId(@PathVariable String patientId) {
        List<MedicalHistoryResponseDto> history = historyService.getMedicalHistoryByPatientId(patientId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{historyId}")
    public ResponseEntity<MedicalHistoryResponseDto> getMedicalHistoryById(@PathVariable String patientId,
                                                                           @PathVariable String historyId) {
        MedicalHistoryResponseDto history = historyService.getMedicalHistoryById(patientId, historyId);
        return ResponseEntity.ok(history);
    }

    @PutMapping("/{historyId}")
    public ResponseEntity<MedicalHistoryResponseDto> updateMedicalHistory(@PathVariable String patientId,
                                                                           @PathVariable String historyId,
                                                                           @Valid @RequestBody MedicalHistoryRequestDto dto) {
        MedicalHistoryResponseDto updated = historyService.updateMedicalHistory(patientId, historyId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{historyId}")
    public ResponseEntity<Void> deleteMedicalHistory(@PathVariable String patientId,
                                                     @PathVariable String historyId) {
        historyService.deleteMedicalHistory(patientId, historyId);
        return ResponseEntity.noContent().build();
    }
}
