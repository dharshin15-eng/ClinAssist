package com.clinassist.engine;

import com.clinassist.entity.AssessmentFinding;

import java.util.List;

/**
 * Common contract interface for deterministic decision-support rules.
 */
public interface DecisionRule {

    /**
     * Evaluates the patient evaluation context and returns zero or more findings.
     *
     * @param context the patient evaluation context
     * @return list of findings evaluated by this rule
     */
    List<AssessmentFinding> evaluate(RuleEvaluationContext context);
}
