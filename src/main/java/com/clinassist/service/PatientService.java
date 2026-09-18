package com.clinassist.service;

import com.clinassist.dto.PatientRequestDto;
import com.clinassist.dto.PatientResponseDto;
import com.clinassist.entity.Patient;
import com.clinassist.exception.DuplicatePatientIdException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for patient record management including collision-safe ID generation and CRUD operations.
 */
@Service
public class PatientService {

    private static final String ALPHA_NUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public PatientResponseDto createPatient(PatientRequestDto dto) {
        String patientId;

        if (StringUtils.hasText(dto.getPatientId())) {
            patientId = dto.getPatientId().trim();
            if (patientRepository.existsByPatientId(patientId)) {
                throw new DuplicatePatientIdException("Patient ID already exists: " + patientId);
            }
        } else {
            patientId = generateUniquePatientId();
        }

        Patient patient = new Patient(
                patientId,
                dto.getFullName(),
                dto.getDateOfBirth(),
                dto.getGender(),
                dto.getPhone(),
                dto.getEmail(),
                dto.getAddress(),
                dto.getBloodGroup()
        );

        Patient savedPatient = patientRepository.save(patient);
        return new PatientResponseDto(savedPatient);
    }

    public List<PatientResponseDto> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(PatientResponseDto::new)
                .collect(Collectors.toList());
    }

    public PatientResponseDto getPatientById(String id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));
        return new PatientResponseDto(patient);
    }

    public PatientResponseDto updatePatient(String id, PatientRequestDto dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));

        patient.setFullName(dto.getFullName());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setPhone(dto.getPhone());
        patient.setEmail(dto.getEmail());
        patient.setAddress(dto.getAddress());
        patient.setBloodGroup(dto.getBloodGroup());
        patient.setUpdatedAt(LocalDateTime.now());

        Patient updatedPatient = patientRepository.save(patient);
        return new PatientResponseDto(updatedPatient);
    }

    public void deletePatient(String id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));
        patientRepository.deleteById(patient.getId());
    }

    /**
     * Generates an explicitly collision-safe patientId (e.g. PAT-20260918-A7K9).
     */
    private String generateUniquePatientId() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String candidateId;
        int attempts = 0;

        do {
            StringBuilder randomSuffix = new StringBuilder(4);
            for (int i = 0; i < 4; i++) {
                randomSuffix.append(ALPHA_NUMERIC.charAt(RANDOM.nextInt(ALPHA_NUMERIC.length())));
            }
            candidateId = "PAT-" + datePrefix + "-" + randomSuffix.toString();
            attempts++;
            if (attempts > 100) {
                candidateId = "PAT-" + datePrefix + "-" + System.currentTimeMillis();
                break;
            }
        } while (patientRepository.existsByPatientId(candidateId));

        return candidateId;
    }
}
