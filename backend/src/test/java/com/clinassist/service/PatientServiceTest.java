package com.clinassist.service;

import com.clinassist.dto.PatientRequestDto;
import com.clinassist.dto.PatientResponseDto;
import com.clinassist.entity.Patient;
import com.clinassist.exception.DuplicatePatientIdException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    private PatientService patientService;

    @BeforeEach
    void setUp() {
        patientService = new PatientService(patientRepository);
    }

    @Test
    void testCreatePatientAutoGeneratesUniquePatientId() {
        PatientRequestDto request = new PatientRequestDto(
                null,
                "Jane Doe",
                LocalDate.of(1990, 5, 15),
                "FEMALE",
                "9876543210",
                "jane@example.com",
                "123 Main St",
                "O+"
        );

        when(patientRepository.existsByPatientId(anyString())).thenReturn(false);
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> {
            Patient p = inv.getArgument(0);
            p.setId("mongo-id-1");
            return p;
        });

        PatientResponseDto response = patientService.createPatient(request);

        assertNotNull(response);
        assertNotNull(response.getPatientId());
        assertTrue(response.getPatientId().startsWith("PAT-"));
        assertEquals("Jane Doe", response.getFullName());
        verify(patientRepository).save(any(Patient.class));
    }

    @Test
    void testCreatePatientWithCustomPatientIdSuccess() {
        PatientRequestDto request = new PatientRequestDto(
                "PAT-9999",
                "John Smith",
                LocalDate.of(1985, 8, 20),
                "MALE",
                "9876543211",
                "john@example.com",
                "456 Oak St",
                "A+"
        );

        when(patientRepository.existsByPatientId("PAT-9999")).thenReturn(false);
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> {
            Patient p = inv.getArgument(0);
            p.setId("mongo-id-2");
            return p;
        });

        PatientResponseDto response = patientService.createPatient(request);

        assertNotNull(response);
        assertEquals("PAT-9999", response.getPatientId());
    }

    @Test
    void testCreatePatientWithDuplicatePatientIdThrowsDuplicatePatientIdException() {
        PatientRequestDto request = new PatientRequestDto(
                "PAT-DUP",
                "Duplicate Patient",
                LocalDate.of(1992, 1, 1),
                "OTHER",
                "9876543212",
                "dup@example.com",
                "Street",
                "B+"
        );

        when(patientRepository.existsByPatientId("PAT-DUP")).thenReturn(true);

        DuplicatePatientIdException ex = assertThrows(
                DuplicatePatientIdException.class,
                () -> patientService.createPatient(request)
        );

        assertEquals("Patient ID already exists: PAT-DUP", ex.getMessage());
        verify(patientRepository, never()).save(any());
    }

    @Test
    void testGetPatientByIdSuccess() {
        Patient patient = new Patient("mongo-1", "PAT-100", "Alice Brown", LocalDate.of(1995, 3, 10), "FEMALE", "1122334455", "alice@test.com", "City", "AB+", LocalDateTime.now(), LocalDateTime.now());
        when(patientRepository.findById("mongo-1")).thenReturn(Optional.of(patient));

        PatientResponseDto response = patientService.getPatientById("mongo-1");

        assertNotNull(response);
        assertEquals("mongo-1", response.getId());
        assertEquals("PAT-100", response.getPatientId());
    }

    @Test
    void testGetPatientByIdNotFoundThrowsPatientNotFoundException() {
        when(patientRepository.findById("missing-id")).thenReturn(Optional.empty());

        PatientNotFoundException ex = assertThrows(
                PatientNotFoundException.class,
                () -> patientService.getPatientById("missing-id")
        );

        assertEquals("Patient not found with ID: missing-id", ex.getMessage());
    }

    @Test
    void testUpdatePatientSuccess() {
        Patient patient = new Patient("mongo-1", "PAT-100", "Alice Old", LocalDate.of(1995, 3, 10), "FEMALE", "1122334455", "old@test.com", "Old Addr", "AB+", LocalDateTime.now(), LocalDateTime.now());
        when(patientRepository.findById("mongo-1")).thenReturn(Optional.of(patient));
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

        PatientRequestDto updateRequest = new PatientRequestDto(
                "PAT-100",
                "Alice Updated",
                LocalDate.of(1995, 3, 10),
                "FEMALE",
                "9988776655",
                "updated@test.com",
                "New Addr",
                "AB+"
        );

        PatientResponseDto response = patientService.updatePatient("mongo-1", updateRequest);

        assertNotNull(response);
        assertEquals("Alice Updated", response.getFullName());
        assertEquals("9988776655", response.getPhone());
        assertEquals("new addr", response.getAddress().toLowerCase());
    }

    @Test
    void testDeletePatientSuccess() {
        Patient patient = new Patient("mongo-del", "PAT-DEL", "To Delete", LocalDate.of(1990, 1, 1), "MALE", "0000000000", "del@test.com", "Addr", "O-", LocalDateTime.now(), LocalDateTime.now());
        when(patientRepository.findById("mongo-del")).thenReturn(Optional.of(patient));

        patientService.deletePatient("mongo-del");

        verify(patientRepository).deleteById("mongo-del");
    }

    @Test
    void testDeletePatientNotFoundThrowsPatientNotFoundException() {
        when(patientRepository.findById("missing-del")).thenReturn(Optional.empty());

        assertThrows(
                PatientNotFoundException.class,
                () -> patientService.deletePatient("missing-del")
        );

        verify(patientRepository, never()).deleteById(anyString());
    }

    @Test
    void testGetAllPatients() {
        Patient p1 = new Patient("m-1", "PAT-1", "P One", LocalDate.of(1990, 1, 1), "MALE", "111", "e1@test.com", "A1", "A+", LocalDateTime.now(), LocalDateTime.now());
        Patient p2 = new Patient("m-2", "PAT-2", "P Two", LocalDate.of(1992, 2, 2), "FEMALE", "222", "e2@test.com", "A2", "B+", LocalDateTime.now(), LocalDateTime.now());
        when(patientRepository.findAll()).thenReturn(List.of(p1, p2));

        List<PatientResponseDto> results = patientService.getAllPatients();

        assertEquals(2, results.size());
    }
}
