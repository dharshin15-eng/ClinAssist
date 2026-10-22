package com.clinassist.dto;

import org.springframework.core.io.Resource;

/**
 * Wrapper for diagnostic report file resource and content metadata.
 */
public class ReportFileResource {

    private final Resource resource;
    private final String fileName;
    private final String contentType;
    private final long fileSize;

    public ReportFileResource(Resource resource, String fileName, String contentType, long fileSize) {
        this.resource = resource;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
    }

    public Resource getResource() {
        return resource;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public long getFileSize() {
        return fileSize;
    }
}
