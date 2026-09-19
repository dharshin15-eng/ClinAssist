package com.clinassist.engine;

import com.clinassist.entity.*;

import java.util.Collections;
import java.util.List;

/**
 * Context container holding patient clinical data for evaluation by the Rule Engine.
 */
public class RuleEvaluationContext {

    private final Patient patient;
    private final List<Symptom> symptoms;
    private final List<MedicalHistory> medicalHistories;
    private final List<Allergy> allergies;
    private final List<Medication> medications;
    private final List<DiagnosticReport> diagnosticReports;

    public RuleEvaluationContext(Patient patient,
                                 List<Symptom> symptoms,
                                 List<MedicalHistory> medicalHistories,
                                 List<Allergy> allergies,
                                 List<Medication> medications,
                                 List<DiagnosticReport> diagnosticReports) {
        this.patient = patient;
        this.symptoms = symptoms != null ? symptoms : Collections.emptyList();
        this.medicalHistories = medicalHistories != null ? medicalHistories : Collections.emptyList();
        this.allergies = allergies != null ? allergies : Collections.emptyList();
        this.medications = medications != null ? medications : Collections.emptyList();
        this.diagnosticReports = diagnosticReports != null ? diagnosticReports : Collections.emptyList();
    }

    public Patient getPatient() {
        return patient;
    }

    public List<Symptom> getSymptoms() {
        return symptoms;
    }

    public List<MedicalHistory> getMedicalHistories() {
        return medicalHistories;
    }

    public List<Allergy> getAllergies() {
        return allergies;
    }

    public List<Medication> getMedications() {
        return medications;
    }

    public List<DiagnosticReport> getDiagnosticReports() {
        return diagnosticReports;
    }
}
