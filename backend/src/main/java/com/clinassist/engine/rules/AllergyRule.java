package com.clinassist.engine.rules;

import com.clinassist.engine.DecisionRule;
import com.clinassist.engine.RuleEvaluationContext;
import com.clinassist.entity.Allergy;
import com.clinassist.entity.AssessmentFinding;
import com.clinassist.entity.FindingCategory;
import com.clinassist.entity.FindingSeverity;
import com.clinassist.entity.FindingSource;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Rule highlighting documented patient allergies.
 */
@Component
public class AllergyRule implements DecisionRule {

    @Override
    public List<AssessmentFinding> evaluate(RuleEvaluationContext context) {
        List<AssessmentFinding> findings = new ArrayList<>();
        if (context.getAllergies() == null || context.getAllergies().isEmpty()) {
            return findings;
        }

        for (Allergy allergy : context.getAllergies()) {
            if (allergy.getAllergen() != null && !allergy.getAllergen().isBlank()) {
                String reactionInfo = (allergy.getReaction() != null && !allergy.getReaction().isBlank())
                        ? " Reaction: " + allergy.getReaction() + "."
                        : "";

                FindingSeverity severity = (allergy.getSeverity() != null)
                        ? mapSeverity(allergy.getSeverity().name())
                        : FindingSeverity.MEDIUM;

                findings.add(new AssessmentFinding(
                        FindingCategory.ALLERGY,
                        "Documented Allergy: " + allergy.getAllergen(),
                        "Patient has a documented allergy to " + allergy.getAllergen() + "." + reactionInfo,
                        severity,
                        FindingSource.RULE_ENGINE
                ));
            }
        }
        return findings;
    }

    private FindingSeverity mapSeverity(String allergySeverity) {
        return switch (allergySeverity.toUpperCase()) {
            case "SEVERE" -> FindingSeverity.HIGH;
            case "MODERATE" -> FindingSeverity.MEDIUM;
            case "MILD" -> FindingSeverity.LOW;
            default -> FindingSeverity.MEDIUM;
        };
    }
}
