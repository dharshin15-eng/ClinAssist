package com.clinassist.service;

import com.clinassist.dto.AllergyRequestDto;
import com.clinassist.dto.AllergyResponseDto;
import com.clinassist.entity.Allergy;
import com.clinassist.entity.SymptomSeverity;
import com.clinassist.exception.ClinicalRecordNotFoundException;
import com.clinassist.repository.AllergyRepository;
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
class AllergyServiceTest {

    @Mock
    private AllergyRepository allergyRepository;

    @Mock
    private PatientRepository patientRepository;

    private AllergyService allergyService;

    @BeforeEach
    void setUp() {
        allergyService = new AllergyService(allergyRepository, patientRepository);
    }

    @Test
    void testCreateAllergySuccess() {
        when(patientRepository.existsById("pat-1")).thenReturn(true);
        when(allergyRepository.save(any(Allergy.class))).thenAnswer(inv -> {
            Allergy a = inv.getArgument(0);
            a.setId("all-1");
            return a;
        });

        AllergyRequestDto request = new AllergyRequestDto("Penicillin", "Rash and itching", SymptomSeverity.SEVERE, "Avoid beta-lactam antibiotics");

        AllergyResponseDto response = allergyService.createAllergy("pat-1", request);

        assertNotNull(response);
        assertEquals("all-1", response.getId());
        assertEquals("Penicillin", response.getAllergen());
    }

    @Test
    void testGetAllergyByIdOwnershipMismatchThrowsException() {
        when(patientRepository.existsById("pat-B")).thenReturn(true);
        when(allergyRepository.findByIdAndPatientId("all-A", "pat-B")).thenReturn(Optional.empty());

        assertThrows(ClinicalRecordNotFoundException.class, () -> allergyService.getAllergyById("pat-B", "all-A"));
    }
}
