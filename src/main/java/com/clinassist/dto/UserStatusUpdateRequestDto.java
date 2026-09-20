package com.clinassist.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object for Admin updating user status (enabled/disabled).
 */
public class UserStatusUpdateRequestDto {

    @NotNull(message = "Enabled status is required")
    private Boolean enabled;

    public UserStatusUpdateRequestDto() {
    }

    public UserStatusUpdateRequestDto(Boolean enabled) {
        this.enabled = enabled;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}
