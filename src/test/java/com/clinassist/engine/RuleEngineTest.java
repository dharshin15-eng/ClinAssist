package com.clinassist.engine;

import com.clinassist.engine.rules.*;
import com.clinassist.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RuleEngineTest {

    private RuleEngine ruleEngine;

    @BeforeEach
    void setUp() {
        ruleEngine = new RuleEngine(List.of(
                new FeverDurationRule(),
                new AllergyRule(),
                new MedicalHistoryRule(),
                new MedicationRule(),
                new DiagnosticReportRule()
        ));
    }

    @Test
    void testEvaluateRulesWithEmptyClinicalRecordsReturnsZeroFindingsAndNoInventedInfo() {
        Patient patient = new Patient("PAT-1001", "John Doe", LocalDate.of(1990, 1, 1), "Male", "1234567890", "john@example.com", "123 St", "O+");
        RuleEvaluationContext emptyContext = new RuleEvaluationContext(patient, List.of(), List.of(), List.of(), List.of(), List.of());

        List<AssessmentFinding> findings = ruleEngine.evaluateRules(emptyContext);

        assertNotNull(findings, "Findings list should not be null");
        assertTrue(findings.isEmpty(), "Expected exactly zero findings for patient with empty clinical records");
    }

    @Test
    void testEvaluateRulesWithMultipleClinicalRecordsAggregatesAllFindings() {
        Patient patient = new Patient("PAT-1002", "Jane Doe", LocalDate.of(1985, 5, 15), "Female", "0987654321", "jane@example.com", "456 Ave", "A+");
        Symptom symptom = new Symptom("pat-1", "Fever", SymptomSeverity.SEVERE, "2 days", "High body temp");
        Allergy allergy = new Allergy("pat-1", "Penicillin", "Rash", SymptomSeverity.SEVERE, "Avoid");
        MedicalHistory history = new MedicalHistory("pat-1", "Asthma", "Active condition", null, HistoryStatus.ACTIVE);
        Medication medication = new Medication("pat-1", "Albuterol", "90mcg", "As needed", "Inhaler");
        DiagnosticReport report = new DiagnosticReport("pat-1", "Chest X-Ray", ReportType.X_RAY, LocalDate.now(), "Lab A", ReportStatus.COMPLETED, "Clear lungs", "REF-1");

        RuleEvaluationContext context = new RuleEvaluationContext(patient, List.of(symptom), List.of(history), List.of(allergy), List.of(medication), List.of(report));

        List<AssessmentFinding> findings = ruleEngine.evaluateRules(context);

        assertNotNull(findings);
        assertEquals(5, findings.size(), "Expected findings from all 5 registered rules");
    }
}
