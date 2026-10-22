package com.clinassist.engine;

import com.clinassist.entity.AssessmentFinding;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Deterministic Decision-Support Rule Engine that executes modular rules against a patient evaluation context.
 */
@Component
public class RuleEngine {

    private final List<DecisionRule> rules;

    public RuleEngine(List<DecisionRule> rules) {
        this.rules = rules != null ? rules : List.of();
    }

    /**
     * Executes all registered decision rules and aggregates their findings.
     *
     * @param context patient evaluation context containing clinical records
     * @return combined list of evaluated assessment findings
     */
    public List<AssessmentFinding> evaluateRules(RuleEvaluationContext context) {
        List<AssessmentFinding> aggregatedFindings = new ArrayList<>();
        if (context == null) {
            return aggregatedFindings;
        }

        for (DecisionRule rule : rules) {
            List<AssessmentFinding> findings = rule.evaluate(context);
            if (findings != null && !findings.isEmpty()) {
                aggregatedFindings.addAll(findings);
            }
        }
        return aggregatedFindings;
    }
}
