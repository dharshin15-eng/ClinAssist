package com.clinassist.engine.rules;

import com.clinassist.engine.RuleEvaluationContext;
import com.clinassist.entity.AssessmentFinding;
import com.clinassist.entity.FindingCategory;
import com.clinassist.entity.Medication;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MedicationRuleTest {

    private final MedicationRule rule = new MedicationRule();

    @Test
    void testEvaluateMedicationSuccess() {
        Medication medication = new Medication("pat-1", "Metformin", "500mg", "Twice daily", "Take with meals");
        RuleEvaluationContext context = new RuleEvaluationContext(null, List.of(), List.of(), List.of(), List.of(medication), List.of());

        List<AssessmentFinding> findings = rule.evaluate(context);

        assertNotNull(findings);
        assertEquals(1, findings.size());
        assertEquals(FindingCategory.MEDICATION, findings.get(0).getCategory());
        assertTrue(findings.get(0).getDescription().contains("Metformin"));
    }
}
