package com.clinassist.engine.rules;

import com.clinassist.engine.RuleEvaluationContext;
import com.clinassist.entity.AssessmentFinding;
import com.clinassist.entity.DiagnosticReport;
import com.clinassist.entity.FindingCategory;
import com.clinassist.entity.ReportStatus;
import com.clinassist.entity.ReportType;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DiagnosticReportRuleTest {

    private final DiagnosticReportRule rule = new DiagnosticReportRule();

    @Test
    void testEvaluateDiagnosticReportSuccess() {
        DiagnosticReport report = new DiagnosticReport("pat-1", "Blood Test", ReportType.BLOOD_TEST, LocalDate.now(), "Lab A", ReportStatus.COMPLETED, "Normal count", "REF-1");
        RuleEvaluationContext context = new RuleEvaluationContext(null, List.of(), List.of(), List.of(), List.of(), List.of(report));

        List<AssessmentFinding> findings = rule.evaluate(context);

        assertNotNull(findings);
        assertEquals(1, findings.size());
        assertEquals(FindingCategory.DIAGNOSTIC_REPORT, findings.get(0).getCategory());
        assertTrue(findings.get(0).getDescription().contains("Blood Test"));
    }
}
