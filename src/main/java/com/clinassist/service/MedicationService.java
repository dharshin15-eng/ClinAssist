package com.clinassist.service;

import com.clinassist.dto.MedicationRequestDto;
import com.clinassist.dto.MedicationResponseDto;
import com.clinassist.entity.Medication;
import com.clinassist.exception.ClinicalRecordNotFoundException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.MedicationRepository;
import com.clinassist.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing patient medication records.
 */
@Service
public class MedicationService {

    private final MedicationRepository medicationRepository;
    private final PatientRepository patientRepository;

    public MedicationService(MedicationRepository medicationRepository, PatientRepository patientRepository) {
        this.medicationRepository = medicationRepository;
        this.patientRepository = patientRepository;
    }

    private void validatePatientExists(String patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new PatientNotFoundException("Patient not found with ID: " + patientId);
        }
    }

    public MedicationResponseDto createMedication(String patientId, MedicationRequestDto dto) {
        validatePatientExists(patientId);

        Medication medication = new Medication(
                patientId,
                dto.getName(),
                dto.getDosage(),
                dto.getFrequency(),
                dto.getNotes()
        );

        Medication saved = medicationRepository.save(medication);
        return new MedicationResponseDto(saved);
    }

    public List<MedicationResponseDto> getMedicationsByPatientId(String patientId) {
        validatePatientExists(patientId);
        return medicationRepository.findByPatientId(patientId).stream()
                .map(MedicationResponseDto::new)
                .collect(Collectors.toList());
    }

    public MedicationResponseDto getMedicationById(String patientId, String medicationId) {
        validatePatientExists(patientId);
        Medication medication = medicationRepository.findByIdAndPatientId(medicationId, patientId)
                .orElseThrow(() -> new ClinicalRecordNotFoundException("Medication record not found with ID: " + medicationId + " for patient: " + patientId));
        return new MedicationResponseDto(medication);
    }

    public MedicationResponseDto updateMedication(String patientId, String medicationId, MedicationRequestDto dto) {
        validatePatientExists(patientId);
        Medication medication = medicationRepository.findByIdAndPatientId(medicationId, patientId)
                .orElseThrow(() -> new ClinicalRecordNotFoundException("Medication record not found with ID: " + medicationId + " for patient: " + patientId));

        medication.setName(dto.getName());
        medication.setDosage(dto.getDosage());
        medication.setFrequency(dto.getFrequency());
        medication.setNotes(dto.getNotes());
        medication.setUpdatedAt(LocalDateTime.now());

        Medication updated = medicationRepository.save(medication);
        return new MedicationResponseDto(updated);
    }

    public void deleteMedication(String patientId, String medicationId) {
        validatePatientExists(patientId);
        Medication medication = medicationRepository.findByIdAndPatientId(medicationId, patientId)
                .orElseThrow(() -> new ClinicalRecordNotFoundException("Medication record not found with ID: " + medicationId + " for patient: " + patientId));
        medicationRepository.delete(medication);
    }
}
