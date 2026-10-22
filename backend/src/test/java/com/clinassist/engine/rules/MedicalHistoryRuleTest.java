package com.clinassist.engine.rules;

import com.clinassist.engine.RuleEvaluationContext;
import com.clinassist.entity.AssessmentFinding;
import com.clinassist.entity.FindingCategory;
import com.clinassist.entity.HistoryStatus;
import com.clinassist.entity.MedicalHistory;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MedicalHistoryRuleTest {

    private final MedicalHistoryRule rule = new MedicalHistoryRule();

    @Test
    void testEvaluateMedicalHistorySuccess() {
        MedicalHistory history = new MedicalHistory("pat-1", "Type 2 Diabetes", "Diagnosed 5 years ago", null, HistoryStatus.ACTIVE);
        RuleEvaluationContext context = new RuleEvaluationContext(null, List.of(), List.of(history), List.of(), List.of(), List.of());

        List<AssessmentFinding> findings = rule.evaluate(context);

        assertNotNull(findings);
        assertEquals(1, findings.size());
        assertEquals(FindingCategory.MEDICAL_HISTORY, findings.get(0).getCategory());
        assertTrue(findings.get(0).getDescription().contains("Type 2 Diabetes"));
    }
}
