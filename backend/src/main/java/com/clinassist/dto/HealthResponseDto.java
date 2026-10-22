package com.clinassist.dto;

/**
 * Data Transfer Object for Health Check API response.
 */
public class HealthResponseDto {

    private String status;
    private String application;

    public HealthResponseDto() {
    }

    public HealthResponseDto(String status, String application) {
        this.status = status;
        this.application = application;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getApplication() {
        return application;
    }

    public void setApplication(String application) {
        this.application = application;
    }
}
