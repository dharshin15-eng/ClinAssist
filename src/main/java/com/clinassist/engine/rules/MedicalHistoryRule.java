package com.clinassist.engine.rules;

import com.clinassist.engine.DecisionRule;
import com.clinassist.engine.RuleEvaluationContext;
import com.clinassist.entity.AssessmentFinding;
import com.clinassist.entity.FindingCategory;
import com.clinassist.entity.FindingSeverity;
import com.clinassist.entity.FindingSource;
import com.clinassist.entity.HistoryStatus;
import com.clinassist.entity.MedicalHistory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Rule identifying active documented medical history conditions.
 */
@Component
public class MedicalHistoryRule implements DecisionRule {

    @Override
    public List<AssessmentFinding> evaluate(RuleEvaluationContext context) {
        List<AssessmentFinding> findings = new ArrayList<>();
        if (context.getMedicalHistories() == null || context.getMedicalHistories().isEmpty()) {
            return findings;
        }

        for (MedicalHistory history : context.getMedicalHistories()) {
            if (history.getCondition() != null && !history.getCondition().isBlank()) {
                String statusStr = history.getStatus() != null ? history.getStatus().name() : "UNKNOWN";
                FindingSeverity severity = (history.getStatus() == HistoryStatus.ACTIVE)
                        ? FindingSeverity.MEDIUM
                        : FindingSeverity.INFORMATIONAL;

                findings.add(new AssessmentFinding(
                        FindingCategory.MEDICAL_HISTORY,
                        "Medical History Condition: " + history.getCondition(),
                        "Patient has a documented medical history of " + history.getCondition() + " (Status: " + statusStr + ").",
                        severity,
                        FindingSource.RULE_ENGINE
                ));
            }
        }
        return findings;
    }
}
