package com.clinassist.service;

import com.clinassist.dto.SymptomRequestDto;
import com.clinassist.dto.SymptomResponseDto;
import com.clinassist.entity.Symptom;
import com.clinassist.entity.SymptomSeverity;
import com.clinassist.exception.ClinicalRecordNotFoundException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.PatientRepository;
import com.clinassist.repository.SymptomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SymptomServiceTest {

    @Mock
    private SymptomRepository symptomRepository;

    @Mock
    private PatientRepository patientRepository;

    private SymptomService symptomService;

    @BeforeEach
    void setUp() {
        symptomService = new SymptomService(symptomRepository, patientRepository);
    }

    @Test
    void testCreateSymptomSuccess() {
        when(patientRepository.existsById("patient-1")).thenReturn(true);
        when(symptomRepository.save(any(Symptom.class))).thenAnswer(inv -> {
            Symptom s = inv.getArgument(0);
            s.setId("symp-1");
            return s;
        });

        SymptomRequestDto request = new SymptomRequestDto("Fever", SymptomSeverity.SEVERE, "3 days", "High body temperature");
        request.setSeverity(SymptomSeverity.SEVERE);

        SymptomResponseDto response = symptomService.createSymptom("patient-1", request);

        assertNotNull(response);
        assertEquals("symp-1", response.getId());
        assertEquals("patient-1", response.getPatientId());
        assertEquals("Fever", response.getName());
    }

    @Test
    void testCreateSymptomPatientNotFoundThrowsException() {
        when(patientRepository.existsById("missing-patient")).thenReturn(false);

        SymptomRequestDto request = new SymptomRequestDto("Fever", SymptomSeverity.MILD, "1 day", "Notes");

        assertThrows(PatientNotFoundException.class, () -> symptomService.createSymptom("missing-patient", request));
    }

    @Test
    void testGetSymptomByIdSuccess() {
        when(patientRepository.existsById("patient-1")).thenReturn(true);
        Symptom symptom = new Symptom("symp-1", "patient-1", "Cold", SymptomSeverity.MILD, "2 days", "Chills", LocalDateTime.now(), LocalDateTime.now());
        when(symptomRepository.findByIdAndPatientId("symp-1", "patient-1")).thenReturn(Optional.of(symptom));

        SymptomResponseDto response = symptomService.getSymptomById("patient-1", "symp-1");

        assertNotNull(response);
        assertEquals("Cold", response.getName());
    }

    @Test
    void testGetSymptomByIdCrossPatientOwnershipMismatchThrowsException() {
        when(patientRepository.existsById("patient-B")).thenReturn(true);
        // Symptom belongs to patient-A, so lookup for patient-B returns empty
        when(symptomRepository.findByIdAndPatientId("symp-A", "patient-B")).thenReturn(Optional.empty());

        assertThrows(ClinicalRecordNotFoundException.class, () -> symptomService.getSymptomById("patient-B", "symp-A"));
    }

    @Test
    void testDeleteSymptomSuccess() {
        when(patientRepository.existsById("patient-1")).thenReturn(true);
        Symptom symptom = new Symptom("symp-1", "patient-1", "Headache", SymptomSeverity.MODERATE, "5 hours", "", LocalDateTime.now(), LocalDateTime.now());
        when(symptomRepository.findByIdAndPatientId("symp-1", "patient-1")).thenReturn(Optional.of(symptom));

        symptomService.deleteSymptom("patient-1", "symp-1");

        verify(symptomRepository).delete(symptom);
    }
}
