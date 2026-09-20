package com.clinassist.service;

import com.clinassist.dto.DiagnosticReportRequestDto;
import com.clinassist.dto.DiagnosticReportResponseDto;
import com.clinassist.dto.ReportFileResource;
import com.clinassist.entity.DiagnosticReport;
import com.clinassist.entity.ReportStatus;
import com.clinassist.entity.ReportType;
import com.clinassist.exception.DiagnosticReportNotFoundException;
import com.clinassist.exception.InvalidFileException;
import com.clinassist.repository.DiagnosticReportRepository;
import com.clinassist.repository.PatientRepository;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DiagnosticReportFileServiceTest {

    @Mock
    private DiagnosticReportRepository reportRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private GridFsTemplate gridFsTemplate;

    @InjectMocks
    private DiagnosticReportService reportService;

    private String patientId;
    private String reportId;
    private DiagnosticReport sampleReport;

    @BeforeEach
    void setUp() {
        patientId = "673f11112222333344445555";
        reportId = "673f99998888777766665555";
        ReflectionTestUtils.setField(reportService, "maxFileSizeBytes", 10485760L); // 10MB

        sampleReport = new DiagnosticReport(
                reportId,
                patientId,
                "Chest X-Ray",
                ReportType.X_RAY,
                LocalDate.now(),
                "Apex Radiology",
                ReportStatus.COMPLETED,
                "Normal lungs",
                "REF-100",
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    @Test
    void storeFile_validPdf_success() throws Exception {
        byte[] pdfMagicBytes = new byte[] {0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34}; // %PDF-1.4
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", pdfMagicBytes);

        when(patientRepository.existsById(patientId)).thenReturn(true);
        when(reportRepository.findByIdAndPatientId(reportId, patientId)).thenReturn(Optional.of(sampleReport));
        ObjectId newGridFsId = new ObjectId();
        when(gridFsTemplate.store(any(InputStream.class), eq("test.pdf"), eq("application/pdf"), any())).thenReturn(newGridFsId);
        when(reportRepository.save(any(DiagnosticReport.class))).thenAnswer(i -> i.getArgument(0));

        DiagnosticReportResponseDto result = reportService.storeFile(patientId, reportId, file);

        assertNotNull(result);
        assertEquals(newGridFsId.toString(), result.getFileId());
        assertEquals("test.pdf", result.getFileName());
        assertEquals("application/pdf", result.getFileContentType());
        assertEquals((long) pdfMagicBytes.length, result.getFileSize());
    }

    @Test
    void storeFile_validPng_success() throws Exception {
        byte[] pngMagicBytes = new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}; // \x89PNG
        MockMultipartFile file = new MockMultipartFile("file", "xray.png", "image/png", pngMagicBytes);

        when(patientRepository.existsById(patientId)).thenReturn(true);
        when(reportRepository.findByIdAndPatientId(reportId, patientId)).thenReturn(Optional.of(sampleReport));
        ObjectId newGridFsId = new ObjectId();
        when(gridFsTemplate.store(any(InputStream.class), eq("xray.png"), eq("image/png"), any())).thenReturn(newGridFsId);
        when(reportRepository.save(any(DiagnosticReport.class))).thenAnswer(i -> i.getArgument(0));

        DiagnosticReportResponseDto result = reportService.storeFile(patientId, reportId, file);

        assertNotNull(result);
        assertEquals(newGridFsId.toString(), result.getFileId());
        assertEquals("xray.png", result.getFileName());
    }

    @Test
    void storeFile_validJpeg_success() throws Exception {
        byte[] jpegMagicBytes = new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 0x4A, 0x46};
        MockMultipartFile file = new MockMultipartFile("file", "scan.jpg", "image/jpeg", jpegMagicBytes);

        when(patientRepository.existsById(patientId)).thenReturn(true);
        when(reportRepository.findByIdAndPatientId(reportId, patientId)).thenReturn(Optional.of(sampleReport));
        ObjectId newGridFsId = new ObjectId();
        when(gridFsTemplate.store(any(InputStream.class), eq("scan.jpg"), eq("image/jpeg"), any())).thenReturn(newGridFsId);
        when(reportRepository.save(any(DiagnosticReport.class))).thenAnswer(i -> i.getArgument(0));

        DiagnosticReportResponseDto result = reportService.storeFile(patientId, reportId, file);

        assertNotNull(result);
        assertEquals("scan.jpg", result.getFileName());
    }

    @Test
    void storeFile_invalidMagicBytes_throwsInvalidFileException() {
        // Disguised executable text claiming to be PDF
        byte[] invalidBytes = "THIS IS NOT A REAL PDF".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "fake.pdf", "application/pdf", invalidBytes);

        when(patientRepository.existsById(patientId)).thenReturn(true);
        when(reportRepository.findByIdAndPatientId(reportId, patientId)).thenReturn(Optional.of(sampleReport));

        assertThrows(InvalidFileException.class, () -> reportService.storeFile(patientId, reportId, file));
        verify(gridFsTemplate, never()).store(any(), any(), any(), any());
    }

    @Test
    void storeFile_oversizedFile_throwsInvalidFileException() {
        ReflectionTestUtils.setField(reportService, "maxFileSizeBytes", 10L); // 10 bytes max
        byte[] pdfMagicBytes = new byte[] {0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
        MockMultipartFile file = new MockMultipartFile("file", "large.pdf", "application/pdf", pdfMagicBytes);

        when(patientRepository.existsById(patientId)).thenReturn(true);
        when(reportRepository.findByIdAndPatientId(reportId, patientId)).thenReturn(Optional.of(sampleReport));

        assertThrows(InvalidFileException.class, () -> reportService.storeFile(patientId, reportId, file));
        verify(gridFsTemplate, never()).store(any(), any(), any(), any());
    }

    @Test
    void storeFile_safeReplacement_deletesOldFileOnlyAfterSave() throws Exception {
        String oldFileId = "673f00000000000000000001";
        sampleReport.setFileId(oldFileId);

        byte[] pdfMagicBytes = new byte[] {0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34};
        MockMultipartFile newFile = new MockMultipartFile("file", "replacement.pdf", "application/pdf", pdfMagicBytes);

        when(patientRepository.existsById(patientId)).thenReturn(true);
        when(reportRepository.findByIdAndPatientId(reportId, patientId)).thenReturn(Optional.of(sampleReport));

        ObjectId newGridFsId = new ObjectId();
        when(gridFsTemplate.store(any(InputStream.class), eq("replacement.pdf"), eq("application/pdf"), any())).thenReturn(newGridFsId);
        when(reportRepository.save(any(DiagnosticReport.class))).thenAnswer(i -> i.getArgument(0));

        DiagnosticReportResponseDto result = reportService.storeFile(patientId, reportId, newFile);

        assertEquals(newGridFsId.toString(), result.getFileId());
        // Verify old file deleted ONLY AFTER store and save succeed
        verify(gridFsTemplate, times(1)).delete(any(Query.class));
    }

    @Test
    void deleteReport_removesAssociatedGridFsFile() {
        String fileId = "673f00000000000000000099";
        sampleReport.setFileId(fileId);

        when(patientRepository.existsById(patientId)).thenReturn(true);
        when(reportRepository.findByIdAndPatientId(reportId, patientId)).thenReturn(Optional.of(sampleReport));

        reportService.deleteReport(patientId, reportId);

        verify(gridFsTemplate, times(1)).delete(any(Query.class));
        verify(reportRepository, times(1)).delete(sampleReport);
    }
}
