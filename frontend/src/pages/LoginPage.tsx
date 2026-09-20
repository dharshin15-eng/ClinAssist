import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types';
import { ApiClientError } from '../services/apiClient';
import { 
  Activity, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  ShieldAlert,
  Stethoscope,
  Building2,
  ShieldCheck,
  Loader2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address format (e.g. doctor@hospital.com).');
      return false;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login({ email: email.trim(), password });
      setErrorMessage(null);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Authentication failed. Please check credentials.');
      }
    }
  };

  const fillDemoCredentials = (role: Role) => {
    setErrorMessage(null);
    if (role === 'DOCTOR') {
      setEmail('doctor@hospital.com');
      setPassword('DoctorSecret#2026');
    } else if (role === 'HOSPITAL_STAFF') {
      setEmail('staff@hospital.com');
      setPassword('StaffSecret#2026');
    } else if (role === 'ADMIN') {
      setEmail('admin@hospital.com');
      setPassword('AdminSecret#2026');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      <div className="bg-gradient-mesh" />

      <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* ClinAssist Logo & Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)'
          }}>
            <Activity size={32} color="#ffffff" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px', color: '#ffffff' }}>
              ClinAssist Portal
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              AI-Powered Healthcare Decision-Support Platform
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Backend Connection Error Alert */}
          {errorMessage && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--rose-light)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--rose)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              lineHeight: '1.4'
            }} className="animate-fade-in">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)'
                }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(11, 15, 25, 0.8)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)'
                }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(11, 15, 25, 0.8)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Real Backend Authentication Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                opacity: isLoading ? 0.8 : 1,
                transition: 'all 0.2s ease',
                marginTop: '8px'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-pulse-slow" />
                  <span>Connecting to Backend Auth...</span>
                </>
              ) : (
                <>
                  <span>Sign In to ClinAssist</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Pre-fill Demo Inputs */}
          <div style={{
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-subtle)' }}>
              Fill Example Credentials
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fillDemoCredentials('DOCTOR')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '6px',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--border-accent)',
                  color: '#a5b4fc',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Stethoscope size={12} />
                Doctor
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials('HOSPITAL_STAFF')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '6px',
                  background: 'var(--emerald-light)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--emerald)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Building2 size={12} />
                Staff
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials('ADMIN')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '6px',
                  background: 'var(--cyan-light)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: 'var(--cyan)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <ShieldCheck size={12} />
                Admin
              </button>
            </div>
          </div>

        </div>

        {/* Healthcare Safety Disclaimer Footer */}
        <div style={{
          padding: '14px 16px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(18, 26, 43, 0.4)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ShieldAlert size={18} color="var(--amber)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Authorized healthcare professional access only. ClinAssist decision support provides clinical insights for doctor review.
          </p>
        </div>

      </div>
    </div>
  );
};
