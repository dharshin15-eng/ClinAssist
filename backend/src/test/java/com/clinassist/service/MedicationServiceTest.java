package com.clinassist.service;

import com.clinassist.dto.MedicationRequestDto;
import com.clinassist.dto.MedicationResponseDto;
import com.clinassist.entity.Medication;
import com.clinassist.exception.ClinicalRecordNotFoundException;
import com.clinassist.repository.MedicationRepository;
import com.clinassist.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicationServiceTest {

    @Mock
    private MedicationRepository medicationRepository;

    @Mock
    private PatientRepository patientRepository;

    private MedicationService medicationService;

    @BeforeEach
    void setUp() {
        medicationService = new MedicationService(medicationRepository, patientRepository);
    }

    @Test
    void testCreateMedicationSuccess() {
        when(patientRepository.existsById("pat-1")).thenReturn(true);
        when(medicationRepository.save(any(Medication.class))).thenAnswer(inv -> {
            Medication m = inv.getArgument(0);
            m.setId("med-1");
            return m;
        });

        MedicationRequestDto request = new MedicationRequestDto("Metformin", "500mg", "Twice daily", "Take with meals");

        MedicationResponseDto response = medicationService.createMedication("pat-1", request);

        assertNotNull(response);
        assertEquals("med-1", response.getId());
        assertEquals("Metformin", response.getName());
    }

    @Test
    void testGetMedicationByIdOwnershipMismatchThrowsException() {
        when(patientRepository.existsById("pat-B")).thenReturn(true);
        when(medicationRepository.findByIdAndPatientId("med-A", "pat-B")).thenReturn(Optional.empty());

        assertThrows(ClinicalRecordNotFoundException.class, () -> medicationService.getMedicationById("pat-B", "med-A"));
    }
}
