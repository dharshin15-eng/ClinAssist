package com.clinassist.service;

import com.clinassist.dto.DiagnosticReportRequestDto;
import com.clinassist.dto.DiagnosticReportResponseDto;
import com.clinassist.dto.ReportFileResource;
import com.clinassist.entity.DiagnosticReport;
import com.clinassist.exception.DiagnosticReportNotFoundException;
import com.clinassist.exception.InvalidFileException;
import com.clinassist.exception.PatientNotFoundException;
import com.clinassist.repository.DiagnosticReportRepository;
import com.clinassist.repository.PatientRepository;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing diagnostic report CRUD business logic, GridFS binary file uploads, and ownership validation.
 */
@Service
public class DiagnosticReportService {

    private final DiagnosticReportRepository reportRepository;
    private final PatientRepository patientRepository;
    private final GridFsTemplate gridFsTemplate;

    @Value("${clinassist.reports.max-file-size-bytes:10485760}")
    private long maxFileSizeBytes;

    public DiagnosticReportService(DiagnosticReportRepository reportRepository,
                                   PatientRepository patientRepository,
                                   GridFsTemplate gridFsTemplate) {
        this.reportRepository = reportRepository;
        this.patientRepository = patientRepository;
        this.gridFsTemplate = gridFsTemplate;
    }

    public DiagnosticReportResponseDto createReport(String patientId, DiagnosticReportRequestDto dto) {
        verifyPatientExists(patientId);

        DiagnosticReport report = new DiagnosticReport(
                patientId,
                dto.getReportName(),
                dto.getReportType(),
                dto.getTestDate(),
                dto.getLabName(),
                dto.getStatus(),
                dto.getSummary(),
                dto.getReportReference()
        );

        DiagnosticReport savedReport = reportRepository.save(report);
        return mapToDto(savedReport);
    }

    public List<DiagnosticReportResponseDto> getReportsByPatientId(String patientId) {
        verifyPatientExists(patientId);

        return reportRepository.findByPatientId(patientId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DiagnosticReportResponseDto getReportById(String patientId, String reportId) {
        verifyPatientExists(patientId);

        DiagnosticReport report = reportRepository.findByIdAndPatientId(reportId, patientId)
                .orElseThrow(() -> new DiagnosticReportNotFoundException(
                        "Diagnostic report not found with id: " + reportId + " for patient: " + patientId));

        return mapToDto(report);
    }

    public DiagnosticReportResponseDto updateReport(String patientId, String reportId, DiagnosticReportRequestDto dto) {
        verifyPatientExists(patientId);

        DiagnosticReport report = reportRepository.findByIdAndPatientId(reportId, patientId)
                .orElseThrow(() -> new DiagnosticReportNotFoundException(
                        "Diagnostic report not found with id: " + reportId + " for patient: " + patientId));

        report.setReportName(dto.getReportName());
        report.setReportType(dto.getReportType());
        report.setTestDate(dto.getTestDate());
        report.setLabName(dto.getLabName());
        report.setStatus(dto.getStatus());
        report.setSummary(dto.getSummary());
        report.setReportReference(dto.getReportReference());
        report.setUpdatedAt(LocalDateTime.now());

        DiagnosticReport updatedReport = reportRepository.save(report);
        return mapToDto(updatedReport);
    }

    /**
     * Store or replace an actual diagnostic report file using GridFS.
     * Uses safe replacement: validates & saves the new file first before deleting the old file.
     */
    public DiagnosticReportResponseDto storeFile(String patientId, String reportId, MultipartFile file) {
        verifyPatientExists(patientId);

        DiagnosticReport report = reportRepository.findByIdAndPatientId(reportId, patientId)
                .orElseThrow(() -> new DiagnosticReportNotFoundException(
                        "Diagnostic report not found with id: " + reportId + " for patient: " + patientId));

        // 1. Validate the new file (size, content type, magic bytes)
        validateFile(file);

        String oldFileId = report.getFileId();

        // 2. Store the new GridFS file
        ObjectId newGridFsId;
        try {
            Document metadata = new Document();
            metadata.put("patientId", patientId);
            metadata.put("reportId", reportId);

            newGridFsId = gridFsTemplate.store(
                    file.getInputStream(),
                    file.getOriginalFilename(),
                    file.getContentType(),
                    metadata
            );
        } catch (IOException e) {
            throw new InvalidFileException("Failed to store file in GridFS: " + e.getMessage());
        }

        // 3. Save new metadata to report entity in MongoDB
        report.setFileId(newGridFsId.toString());
        report.setFileName(file.getOriginalFilename());
        report.setFileContentType(file.getContentType());
        report.setFileSize(file.getSize());
        report.setUpdatedAt(LocalDateTime.now());

        DiagnosticReport savedReport = reportRepository.save(report);

        // 4. Delete old GridFS file ONLY after successful save
        if (oldFileId != null && !oldFileId.isEmpty()) {
            try {
                gridFsTemplate.delete(new Query(Criteria.where("_id").is(oldFileId)));
            } catch (Exception e) {
                // Log warning, new file is already safe & linked
            }
        }

        return mapToDto(savedReport);
    }

    /**
     * Retrieve the GridFS file resource for an attached diagnostic report.
     */
    public ReportFileResource getFileResource(String patientId, String reportId) {
        verifyPatientExists(patientId);

        DiagnosticReport report = reportRepository.findByIdAndPatientId(reportId, patientId)
                .orElseThrow(() -> new DiagnosticReportNotFoundException(
                        "Diagnostic report not found with id: " + reportId + " for patient: " + patientId));

        if (report.getFileId() == null || report.getFileId().isEmpty()) {
            throw new DiagnosticReportNotFoundException("No file attached to report with id: " + reportId);
        }

        GridFSFile gridFsFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(report.getFileId())));
        if (gridFsFile == null) {
            throw new DiagnosticReportNotFoundException("GridFS file resource not found for fileId: " + report.getFileId());
        }

        GridFsResource resource = gridFsTemplate.getResource(gridFsFile);
        return new ReportFileResource(
                resource,
                report.getFileName() != null ? report.getFileName() : gridFsFile.getFilename(),
                report.getFileContentType() != null ? report.getFileContentType() : "application/octet-stream",
                report.getFileSize() != null ? report.getFileSize() : gridFsFile.getLength()
        );
    }

    public void deleteReport(String patientId, String reportId) {
        verifyPatientExists(patientId);

        DiagnosticReport report = reportRepository.findByIdAndPatientId(reportId, patientId)
                .orElseThrow(() -> new DiagnosticReportNotFoundException(
                        "Diagnostic report not found with id: " + reportId + " for patient: " + patientId));

        if (report.getFileId() != null && !report.getFileId().isEmpty()) {
            try {
                gridFsTemplate.delete(new Query(Criteria.where("_id").is(report.getFileId())));
            } catch (Exception e) {
                // Log warning if file was already removed
            }
        }

        reportRepository.delete(report);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Uploaded file is empty");
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new InvalidFileException("File size exceeds maximum allowed limit of " + maxFileSizeBytes + " bytes");
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";

        boolean validExtension = filename.endsWith(".pdf") || filename.endsWith(".png") || filename.endsWith(".jpg") || filename.endsWith(".jpeg");
        boolean validContentType = contentType.equals("application/pdf") || contentType.equals("image/png") || contentType.equals("image/jpeg") || contentType.equals("image/jpg");

        if (!validExtension || !validContentType) {
            throw new InvalidFileException("Unsupported file type. Only PDF, PNG, and JPEG files are allowed.");
        }

        // Magic Bytes Validation
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[8];
            int bytesRead = is.read(header);
            if (bytesRead < 4) {
                throw new InvalidFileException("File is truncated or corrupted");
            }

            boolean isPdf = (header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46);
            boolean isPng = (header[0] == (byte) 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47);
            boolean isJpeg = ((header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF);

            if (!isPdf && !isPng && !isJpeg) {
                throw new InvalidFileException("File signature verification failed. Only genuine PDF, PNG, and JPEG files are allowed.");
            }
        } catch (IOException e) {
            throw new InvalidFileException("Unable to inspect file contents: " + e.getMessage());
        }
    }

    private void verifyPatientExists(String patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new PatientNotFoundException("Patient not found with id: " + patientId);
        }
    }

    private DiagnosticReportResponseDto mapToDto(DiagnosticReport report) {
        return new DiagnosticReportResponseDto(
                report.getId(),
                report.getPatientId(),
                report.getReportName(),
                report.getReportType(),
                report.getTestDate(),
                report.getLabName(),
                report.getStatus(),
                report.getSummary(),
                report.getReportReference(),
                report.getFileId(),
                report.getFileName(),
                report.getFileContentType(),
                report.getFileSize(),
                report.getCreatedAt(),
                report.getUpdatedAt()
        );
    }
}
