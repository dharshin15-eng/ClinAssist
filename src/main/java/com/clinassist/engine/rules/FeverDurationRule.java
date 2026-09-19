package com.clinassist.engine.rules;

import com.clinassist.engine.DecisionRule;
import com.clinassist.engine.RuleEvaluationContext;
import com.clinassist.entity.AssessmentFinding;
import com.clinassist.entity.FindingCategory;
import com.clinassist.entity.FindingSeverity;
import com.clinassist.entity.FindingSource;
import com.clinassist.entity.Symptom;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Rule evaluating reported symptoms and recorded durations (e.g., fever).
 */
@Component
public class FeverDurationRule implements DecisionRule {

    @Override
    public List<AssessmentFinding> evaluate(RuleEvaluationContext context) {
        List<AssessmentFinding> findings = new ArrayList<>();
        if (context.getSymptoms() == null || context.getSymptoms().isEmpty()) {
            return findings;
        }

        for (Symptom symptom : context.getSymptoms()) {
            if (symptom.getName() != null && !symptom.getName().isBlank()) {
                String durationInfo = (symptom.getDuration() != null && !symptom.getDuration().isBlank())
                        ? " recorded with duration: " + symptom.getDuration()
                        : " recorded.";

                FindingSeverity severity = (symptom.getSeverity() != null)
                        ? mapSeverity(symptom.getSeverity().name())
                        : FindingSeverity.INFORMATIONAL;

                findings.add(new AssessmentFinding(
                        FindingCategory.SYMPTOM,
                        "Symptom Consideration: " + symptom.getName(),
                        "Patient symptom '" + symptom.getName() + "'" + durationInfo + " Severity: " + (symptom.getSeverity() != null ? symptom.getSeverity() : "UNSPECIFIED") + ".",
                        severity,
                        FindingSource.RULE_ENGINE
                ));
            }
        }
        return findings;
    }

    private FindingSeverity mapSeverity(String symptomSeverity) {
        return switch (symptomSeverity.toUpperCase()) {
            case "SEVERE" -> FindingSeverity.HIGH;
            case "MODERATE" -> FindingSeverity.MEDIUM;
            case "MILD" -> FindingSeverity.LOW;
            default -> FindingSeverity.INFORMATIONAL;
        };
    }
}
