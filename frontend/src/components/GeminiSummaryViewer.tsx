import React from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  ShieldAlert, 
  AlertTriangle, 
  Stethoscope,
  Activity
} from 'lucide-react';

interface GeminiSummaryViewerProps {
  summary: string;
}

export const GeminiSummaryViewer: React.FC<GeminiSummaryViewerProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Formatted Markdown Content Container */}
      <div 
        className="custom-scrollbar"
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-md)',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
          maxHeight: '650px',
          overflowY: 'auto',
          fontSize: '13.5px',
          lineHeight: '1.65',
          color: '#0f172a'
        }}
      >
        <ReactMarkdown
          components={{
            // Header Level 1 / Title
            h1: ({ children }) => (
              <div style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#0284c7',
                borderBottom: '1px solid #bae6fd',
                paddingBottom: '8px',
                marginTop: '16px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Sparkles size={18} color="#0284c7" />
                <span>{children}</span>
              </div>
            ),
            // Header Level 2 / Section Title
            h2: ({ children }) => (
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#0f172a',
                background: '#e0f2fe',
                padding: '8px 12px',
                borderRadius: '6px',
                borderLeft: '3px solid #0284c7',
                marginTop: '20px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Stethoscope size={16} color="#0284c7" />
                <span>{children}</span>
              </div>
            ),
            // Header Level 3 / Sub-Section Title
            h3: ({ children }) => (
              <div style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#0284c7',
                marginTop: '16px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Activity size={14} color="#0284c7" />
                <span>{children}</span>
              </div>
            ),
            // Paragraphs
            p: ({ children }) => (
              <p style={{
                marginBottom: '12px',
                color: '#0f172a',
                lineHeight: '1.65'
              }}>
                {children}
              </p>
            ),
            // Unordered Lists
            ul: ({ children }) => (
              <ul style={{
                paddingLeft: '20px',
                marginTop: '6px',
                marginBottom: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {children}
              </ul>
            ),
            // Ordered Lists
            ol: ({ children }) => (
              <ol style={{
                paddingLeft: '22px',
                marginTop: '6px',
                marginBottom: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {children}
              </ol>
            ),
            // List Items with Risk Treatment
            li: ({ children }) => {
              const textContent = String(children);
              const isHighRisk = /high|severe|allergy|alert|critical/i.test(textContent);

              return (
                <li style={{
                  color: isHighRisk ? '#dc2626' : '#0f172a',
                  background: isHighRisk ? '#fee2e2' : 'transparent',
                  padding: isHighRisk ? '6px 10px' : '2px 0',
                  borderRadius: isHighRisk ? '6px' : '0',
                  border: isHighRisk ? '1px solid #fca5a5' : 'none',
                  lineHeight: '1.6'
                }}>
                  {children}
                </li>
              );
            },
            // Strong / Bold text
            strong: ({ children }) => {
              const str = String(children);
              const isWarning = /high|severe|allergy|danger|critical/i.test(str);

              if (isWarning) {
                return (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fca5a5',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}>
                    <AlertTriangle size={12} />
                    {children}
                  </span>
                );
              }

              return (
                <strong style={{ fontWeight: 700, color: '#0f172a' }}>
                  {children}
                </strong>
              );
            },
            // Horizontal rule
            hr: () => (
              <hr style={{
                border: 'none',
                borderTop: '1px solid #e2e8f0',
                margin: '20px 0'
              }} />
            )
          }}
        >
          {summary}
        </ReactMarkdown>
      </div>

      {/* Safety Disclaimer Banner */}
      <div style={{
        padding: '12px 16px',
        borderRadius: 'var(--radius-sm)',
        background: '#fffbe6',
        border: '1px solid #fde68a',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <ShieldAlert size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span style={{ fontSize: '12px', color: '#475569', lineHeight: '1.45' }}>
          <strong style={{ color: '#d97706' }}>Doctor Responsibility Note:</strong> This Gemini AI summary provides decision support only. It does not replace independent physician clinical evaluation, diagnosis, prescribing, or treatment decisions.
        </span>
      </div>

    </div>
  );
};
