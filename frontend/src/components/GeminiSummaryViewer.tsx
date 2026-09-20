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
          background: 'rgba(11, 15, 25, 0.75)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          maxHeight: '650px',
          overflowY: 'auto',
          fontSize: '13.5px',
          lineHeight: '1.65',
          color: 'var(--text-main)'
        }}
      >
        <ReactMarkdown
          components={{
            // Header Level 1 / Title
            h1: ({ children }) => (
              <div style={{
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--cyan)',
                borderBottom: '1px solid rgba(6, 182, 212, 0.3)',
                paddingBottom: '8px',
                marginTop: '16px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Sparkles size={18} color="var(--cyan)" />
                <span>{children}</span>
              </div>
            ),
            // Header Level 2 / Section Title
            h2: ({ children }) => (
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#ffffff',
                background: 'rgba(18, 26, 43, 0.8)',
                padding: '8px 12px',
                borderRadius: '6px',
                borderLeft: '3px solid var(--cyan)',
                marginTop: '20px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Stethoscope size={16} color="var(--cyan)" />
                <span>{children}</span>
              </div>
            ),
            // Header Level 3 / Sub-Section Title
            h3: ({ children }) => (
              <div style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--cyan)',
                marginTop: '16px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Activity size={14} color="var(--cyan)" />
                <span>{children}</span>
              </div>
            ),
            // Paragraphs
            p: ({ children }) => (
              <p style={{
                marginBottom: '12px',
                color: 'var(--text-main)',
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
                  color: isHighRisk ? '#fecdd3' : 'var(--text-main)',
                  background: isHighRisk ? 'rgba(244, 63, 94, 0.08)' : 'transparent',
                  padding: isHighRisk ? '6px 10px' : '2px 0',
                  borderRadius: isHighRisk ? '6px' : '0',
                  border: isHighRisk ? '1px solid rgba(244, 63, 94, 0.3)' : 'none',
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
                    background: 'var(--rose-light)',
                    color: 'var(--rose)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}>
                    <AlertTriangle size={12} />
                    {children}
                  </span>
                );
              }

              return (
                <strong style={{ fontWeight: 700, color: '#ffffff' }}>
                  {children}
                </strong>
              );
            },
            // Horizontal rule
            hr: () => (
              <hr style={{
                border: 'none',
                borderTop: '1px solid var(--border-color)',
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
        background: 'rgba(245, 158, 11, 0.05)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <ShieldAlert size={18} color="var(--amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.45' }}>
          <strong style={{ color: 'var(--amber)' }}>Doctor Responsibility Note:</strong> This Gemini AI summary provides decision support only. It does not replace independent physician clinical evaluation, diagnosis, prescribing, or treatment decisions.
        </span>
      </div>

    </div>
  );
};
