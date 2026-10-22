package com.clinassist.engine.rules;

import com.clinassist.engine.DecisionRule;
import com.clinassist.engine.RuleEvaluationContext;
import com.clinassist.entity.AssessmentFinding;
import com.clinassist.entity.DiagnosticReport;
import com.clinassist.entity.FindingCategory;
import com.clinassist.entity.FindingSeverity;
import com.clinassist.entity.FindingSource;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Rule highlighting available diagnostic/lab reports for clinical review.
 */
@Component
public class DiagnosticReportRule implements DecisionRule {

    @Override
    public List<AssessmentFinding> evaluate(RuleEvaluationContext context) {
        List<AssessmentFinding> findings = new ArrayList<>();
        if (context.getDiagnosticReports() == null || context.getDiagnosticReports().isEmpty()) {
            return findings;
        }

        for (DiagnosticReport report : context.getDiagnosticReports()) {
            if (report.getReportName() != null && !report.getReportName().isBlank()) {
                String typeStr = report.getReportType() != null ? report.getReportType().name() : "UNSPECIFIED";
                String statusStr = report.getStatus() != null ? report.getStatus().name() : "UNKNOWN";
                String summaryInfo = (report.getSummary() != null && !report.getSummary().isBlank())
                        ? " Summary: " + report.getSummary() + "."
                        : "";

                findings.add(new AssessmentFinding(
                        FindingCategory.DIAGNOSTIC_REPORT,
                        "Diagnostic Report: " + report.getReportName(),
                        "Diagnostic report '" + report.getReportName() + "' (Type: " + typeStr + ", Status: " + statusStr + ") available for review." + summaryInfo,
                        FindingSeverity.INFORMATIONAL,
                        FindingSource.RULE_ENGINE
                ));
            }
        }
        return findings;
    }
}
