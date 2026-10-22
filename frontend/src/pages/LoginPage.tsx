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
      setEmail('Dharshin@gmail.com');
      setPassword('Dharshin2428');
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
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3)'
          }}>
            <Activity size={32} color="#ffffff" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px', color: '#0f172a' }}>
              ClinAssist Portal
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
              AI-Powered Healthcare Decision-Support Platform
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#ffffff' }}>
          
          {/* Backend Connection Error Alert */}
          {errorMessage && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#dc2626',
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
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
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
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
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
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
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
                    color: '#64748b',
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
                background: '#0ea5e9',
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)',
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
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>
              Fill Example Credentials
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fillDemoCredentials('DOCTOR')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '6px',
                  background: '#e0f2fe',
                  border: '1px solid #bae6fd',
                  color: '#0284c7',
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
                  background: '#d1fae5',
                  border: '1px solid #a7f3d0',
                  color: '#059669',
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
                  background: '#e0f2fe',
                  border: '1px solid #bae6fd',
                  color: '#0284c7',
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
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ShieldAlert size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
            Authorized healthcare professional access only. ClinAssist decision support provides clinical insights for doctor review.
          </p>
        </div>

      </div>
    </div>
  );
};
