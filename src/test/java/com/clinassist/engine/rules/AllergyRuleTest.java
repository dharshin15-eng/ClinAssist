package com.clinassist.engine.rules;

import com.clinassist.engine.RuleEvaluationContext;
import com.clinassist.entity.Allergy;
import com.clinassist.entity.AssessmentFinding;
import com.clinassist.entity.FindingCategory;
import com.clinassist.entity.SymptomSeverity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AllergyRuleTest {

    private final AllergyRule rule = new AllergyRule();

    @Test
    void testEvaluateAllergySuccess() {
        Allergy penicillin = new Allergy("pat-1", "Penicillin", "Rash and hives", SymptomSeverity.SEVERE, "Avoid beta-lactams");
        RuleEvaluationContext context = new RuleEvaluationContext(null, List.of(), List.of(), List.of(penicillin), List.of(), List.of());

        List<AssessmentFinding> findings = rule.evaluate(context);

        assertNotNull(findings);
        assertEquals(1, findings.size());
        assertEquals(FindingCategory.ALLERGY, findings.get(0).getCategory());
        assertTrue(findings.get(0).getDescription().contains("Penicillin"));
    }
}
