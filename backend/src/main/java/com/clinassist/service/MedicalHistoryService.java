package com.clinassist.service;

import com.clinassist.dto.MedicalHistoryRequestDto;
import com.clinassist.dto.MedicalHistoryResponseDto;
import com.clinassist.entity.MedicalHistory;
import com.clinassist.exception.ClinicalRecordNotFoundException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.MedicalHistoryRepository;
import com.clinassist.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing patient medical history records.
 */
@Service
public class MedicalHistoryService {

    private final MedicalHistoryRepository historyRepository;
    private final PatientRepository patientRepository;

    public MedicalHistoryService(MedicalHistoryRepository historyRepository, PatientRepository patientRepository) {
        this.historyRepository = historyRepository;
        this.patientRepository = patientRepository;
    }

    private void validatePatientExists(String patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new PatientNotFoundException("Patient not found with ID: " + patientId);
        }
    }

    public MedicalHistoryResponseDto createMedicalHistory(String patientId, MedicalHistoryRequestDto dto) {
        validatePatientExists(patientId);

        MedicalHistory history = new MedicalHistory(
                patientId,
                dto.getCondition(),
                dto.getDescription(),
                dto.getDiagnosedDate(),
                dto.getStatus()
        );

        MedicalHistory saved = historyRepository.save(history);
        return new MedicalHistoryResponseDto(saved);
    }

    public List<MedicalHistoryResponseDto> getMedicalHistoryByPatientId(String patientId) {
        validatePatientExists(patientId);
        return historyRepository.findByPatientId(patientId).stream()
                .map(MedicalHistoryResponseDto::new)
                .collect(Collectors.toList());
    }

    public MedicalHistoryResponseDto getMedicalHistoryById(String patientId, String historyId) {
        validatePatientExists(patientId);
        MedicalHistory history = historyRepository.findByIdAndPatientId(historyId, patientId)
                .orElseThrow(() -> new ClinicalRecordNotFoundException("Medical history record not found with ID: " + historyId + " for patient: " + patientId));
        return new MedicalHistoryResponseDto(history);
    }

    public MedicalHistoryResponseDto updateMedicalHistory(String patientId, String historyId, MedicalHistoryRequestDto dto) {
        validatePatientExists(patientId);
        MedicalHistory history = historyRepository.findByIdAndPatientId(historyId, patientId)
                .orElseThrow(() -> new ClinicalRecordNotFoundException("Medical history record not found with ID: " + historyId + " for patient: " + patientId));

        history.setCondition(dto.getCondition());
        history.setDescription(dto.getDescription());
        history.setDiagnosedDate(dto.getDiagnosedDate());
        history.setStatus(dto.getStatus());
        history.setUpdatedAt(LocalDateTime.now());

        MedicalHistory updated = historyRepository.save(history);
        return new MedicalHistoryResponseDto(updated);
    }

    public void deleteMedicalHistory(String patientId, String historyId) {
        validatePatientExists(patientId);
        MedicalHistory history = historyRepository.findByIdAndPatientId(historyId, patientId)
                .orElseThrow(() -> new ClinicalRecordNotFoundException("Medical history record not found with ID: " + historyId + " for patient: " + patientId));
        historyRepository.delete(history);
    }
}
