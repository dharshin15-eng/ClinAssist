package com.clinassist.service;

import com.clinassist.dto.MedicalHistoryRequestDto;
import com.clinassist.dto.MedicalHistoryResponseDto;
import com.clinassist.entity.HistoryStatus;
import com.clinassist.entity.MedicalHistory;
import com.clinassist.exception.ClinicalRecordNotFoundException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.MedicalHistoryRepository;
import com.clinassist.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicalHistoryServiceTest {

    @Mock
    private MedicalHistoryRepository historyRepository;

    @Mock
    private PatientRepository patientRepository;

    private MedicalHistoryService historyService;

    @BeforeEach
    void setUp() {
        historyService = new MedicalHistoryService(historyRepository, patientRepository);
    }

    @Test
    void testCreateMedicalHistorySuccess() {
        when(patientRepository.existsById("pat-1")).thenReturn(true);
        when(historyRepository.save(any(MedicalHistory.class))).thenAnswer(inv -> {
            MedicalHistory h = inv.getArgument(0);
            h.setId("hist-1");
            return h;
        });

        MedicalHistoryRequestDto request = new MedicalHistoryRequestDto("Diabetes", "Type 2", LocalDate.of(2020, 1, 1), HistoryStatus.ACTIVE);

        MedicalHistoryResponseDto response = historyService.createMedicalHistory("pat-1", request);

        assertNotNull(response);
        assertEquals("hist-1", response.getId());
        assertEquals("Diabetes", response.getCondition());
    }

    @Test
    void testGetMedicalHistoryByIdOwnershipMismatchThrowsException() {
        when(patientRepository.existsById("pat-B")).thenReturn(true);
        when(historyRepository.findByIdAndPatientId("hist-A", "pat-B")).thenReturn(Optional.empty());

        assertThrows(ClinicalRecordNotFoundException.class, () -> historyService.getMedicalHistoryById("pat-B", "hist-A"));
    }
}
