package com.clinassist.engine.rules;

import com.clinassist.engine.RuleEvaluationContext;
import com.clinassist.entity.*;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FeverDurationRuleTest {

    private final FeverDurationRule rule = new FeverDurationRule();

    @Test
    void testEvaluateFeverSymptomSuccess() {
        Symptom fever = new Symptom("pat-1", "Fever", SymptomSeverity.SEVERE, "3 days", "High body temperature");
        RuleEvaluationContext context = new RuleEvaluationContext(null, List.of(fever), List.of(), List.of(), List.of(), List.of());

        List<AssessmentFinding> findings = rule.evaluate(context);

        assertNotNull(findings);
        assertEquals(1, findings.size());
        assertEquals(FindingCategory.SYMPTOM, findings.get(0).getCategory());
        assertEquals(FindingSeverity.HIGH, findings.get(0).getSeverity());
        assertTrue(findings.get(0).getDescription().contains("3 days"));
    }
}
