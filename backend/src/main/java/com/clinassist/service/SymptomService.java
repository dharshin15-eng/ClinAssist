package com.clinassist.service;

import com.clinassist.dto.SymptomRequestDto;
import com.clinassist.dto.SymptomResponseDto;
import com.clinassist.entity.Symptom;
import com.clinassist.exception.ClinicalRecordNotFoundException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.PatientRepository;
import com.clinassist.repository.SymptomRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing patient symptom records.
 */
@Service
public class SymptomService {

    private final SymptomRepository symptomRepository;
    private final PatientRepository patientRepository;

    public SymptomService(SymptomRepository symptomRepository, PatientRepository patientRepository) {
        this.symptomRepository = symptomRepository;
        this.patientRepository = patientRepository;
    }

    private void validatePatientExists(String patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new PatientNotFoundException("Patient not found with ID: " + patientId);
        }
    }

    public SymptomResponseDto createSymptom(String patientId, SymptomRequestDto dto) {
        validatePatientExists(patientId);

        Symptom symptom = new Symptom(
                patientId,
                dto.getName(),
                dto.getSeverity(),
                dto.getDuration(),
                dto.getNotes()
        );

        Symptom saved = symptomRepository.save(symptom);
        return new SymptomResponseDto(saved);
    }

    public List<SymptomResponseDto> getSymptomsByPatientId(String patientId) {
        validatePatientExists(patientId);
        return symptomRepository.findByPatientId(patientId).stream()
                .map(SymptomResponseDto::new)
                .collect(Collectors.toList());
    }

    public SymptomResponseDto getSymptomById(String patientId, String symptomId) {
        validatePatientExists(patientId);
        Symptom symptom = symptomRepository.findByIdAndPatientId(symptomId, patientId)
                .orElseThrow(() -> new ClinicalRecordNotFoundException("Symptom not found with ID: " + symptomId + " for patient: " + patientId));
        return new SymptomResponseDto(symptom);
    }

    public SymptomResponseDto updateSymptom(String patientId, String symptomId, SymptomRequestDto dto) {
        validatePatientExists(patientId);
        Symptom symptom = symptomRepository.findByIdAndPatientId(symptomId, patientId)
                .orElseThrow(() -> new ClinicalRecordNotFoundException("Symptom not found with ID: " + symptomId + " for patient: " + patientId));

        symptom.setName(dto.getName());
        symptom.setSeverity(dto.getSeverity());
        symptom.setDuration(dto.getDuration());
        symptom.setNotes(dto.getNotes());
        symptom.setUpdatedAt(LocalDateTime.now());

        Symptom updated = symptomRepository.save(symptom);
        return new SymptomResponseDto(updated);
    }

    public void deleteSymptom(String patientId, String symptomId) {
        validatePatientExists(patientId);
        Symptom symptom = symptomRepository.findByIdAndPatientId(symptomId, patientId)
                .orElseThrow(() -> new ClinicalRecordNotFoundException("Symptom not found with ID: " + symptomId + " for patient: " + patientId));
        symptomRepository.delete(symptom);
    }
}
