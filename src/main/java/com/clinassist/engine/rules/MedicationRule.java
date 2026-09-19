package com.clinassist.engine.rules;

import com.clinassist.engine.DecisionRule;
import com.clinassist.engine.RuleEvaluationContext;
import com.clinassist.entity.AssessmentFinding;
import com.clinassist.entity.FindingCategory;
import com.clinassist.entity.FindingSeverity;
import com.clinassist.entity.FindingSource;
import com.clinassist.entity.Medication;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Rule indicating current active medications for clinical review.
 */
@Component
public class MedicationRule implements DecisionRule {

    @Override
    public List<AssessmentFinding> evaluate(RuleEvaluationContext context) {
        List<AssessmentFinding> findings = new ArrayList<>();
        if (context.getMedications() == null || context.getMedications().isEmpty()) {
            return findings;
        }

        for (Medication medication : context.getMedications()) {
            if (medication.getName() != null && !medication.getName().isBlank()) {
                String dosageInfo = (medication.getDosage() != null && !medication.getDosage().isBlank())
                        ? " Dosage: " + medication.getDosage() + "."
                        : "";
                String frequencyInfo = (medication.getFrequency() != null && !medication.getFrequency().isBlank())
                        ? " Frequency: " + medication.getFrequency() + "."
                        : "";

                findings.add(new AssessmentFinding(
                        FindingCategory.MEDICATION,
                        "Current Medication: " + medication.getName(),
                        "Patient is currently prescribed " + medication.getName() + "." + dosageInfo + frequencyInfo + " Consider during clinical evaluation.",
                        FindingSeverity.INFORMATIONAL,
                        FindingSource.RULE_ENGINE
                ));
            }
        }
        return findings;
    }
}
