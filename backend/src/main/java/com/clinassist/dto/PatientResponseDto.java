package com.clinassist.dto;

import com.clinassist.entity.Patient;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for returning patient record details.
 */
public class PatientResponseDto {

    private String id;
    private String patientId;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String phone;
    private String email;
    private String address;
    private String bloodGroup;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PatientResponseDto() {
    }

    public PatientResponseDto(Patient patient) {
        this.id = patient.getId();
        this.patientId = patient.getPatientId();
        this.fullName = patient.getFullName();
        this.dateOfBirth = patient.getDateOfBirth();
        this.gender = patient.getGender();
        this.phone = patient.getPhone();
        this.email = patient.getEmail();
        this.address = patient.getAddress();
        this.bloodGroup = patient.getBloodGroup();
        this.createdAt = patient.getCreatedAt();
        this.updatedAt = patient.getUpdatedAt();
    }

    public PatientResponseDto(String id, String patientId, String fullName, LocalDate dateOfBirth, String gender, String phone, String email, String address, String bloodGroup, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.patientId = patientId;
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.bloodGroup = bloodGroup;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
