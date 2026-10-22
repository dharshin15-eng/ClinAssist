package com.clinassist.service;

import com.clinassist.dto.AllergyRequestDto;
import com.clinassist.dto.AllergyResponseDto;
import com.clinassist.entity.Allergy;
import com.clinassist.exception.ClinicalRecordNotFoundException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.AllergyRepository;
import com.clinassist.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing patient allergy records.
 */
@Service
public class AllergyService {

    private final AllergyRepository allergyRepository;
    private final PatientRepository patientRepository;

    public AllergyService(AllergyRepository allergyRepository, PatientRepository patientRepository) {
        this.allergyRepository = allergyRepository;
        this.patientRepository = patientRepository;
    }

    private void validatePatientExists(String patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new PatientNotFoundException("Patient not found with ID: " + patientId);
        }
    }

    public AllergyResponseDto createAllergy(String patientId, AllergyRequestDto dto) {
        validatePatientExists(patientId);

        Allergy allergy = new Allergy(
                patientId,
                dto.getAllergen(),
                dto.getReaction(),
                dto.getSeverity(),
                dto.getNotes()
        );

        Allergy saved = allergyRepository.save(allergy);
        return new AllergyResponseDto(saved);
    }

    public List<AllergyResponseDto> getAllergiesByPatientId(String patientId) {
        validatePatientExists(patientId);
        return allergyRepository.findByPatientId(patientId).stream()
                .map(AllergyResponseDto::new)
                .collect(Collectors.toList());
    }

    public AllergyResponseDto getAllergyById(String patientId, String allergyId) {
        validatePatientExists(patientId);
        Allergy allergy = allergyRepository.findByIdAndPatientId(allergyId, patientId)
                .orElseThrow(() -> new ClinicalRecordNotFoundException("Allergy record not found with ID: " + allergyId + " for patient: " + patientId));
        return new AllergyResponseDto(allergy);
    }

    public AllergyResponseDto updateAllergy(String patientId, String allergyId, AllergyRequestDto dto) {
        validatePatientExists(patientId);
        Allergy allergy = allergyRepository.findByIdAndPatientId(allergyId, patientId)
                .orElseThrow(() -> new ClinicalRecordNotFoundException("Allergy record not found with ID: " + allergyId + " for patient: " + patientId));

        allergy.setAllergen(dto.getAllergen());
        allergy.setReaction(dto.getReaction());
        allergy.setSeverity(dto.getSeverity());
        allergy.setNotes(dto.getNotes());
        allergy.setUpdatedAt(LocalDateTime.now());

        Allergy updated = allergyRepository.save(allergy);
        return new AllergyResponseDto(updated);
    }

    public void deleteAllergy(String patientId, String allergyId) {
        validatePatientExists(patientId);
        Allergy allergy = allergyRepository.findByIdAndPatientId(allergyId, patientId)
                .orElseThrow(() -> new ClinicalRecordNotFoundException("Allergy record not found with ID: " + allergyId + " for patient: " + patientId));
        allergyRepository.delete(allergy);
    }
}
