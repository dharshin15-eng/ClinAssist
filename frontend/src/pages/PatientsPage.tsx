import React, { useState, useEffect } from 'react';
import type { Patient } from '../types';
import { patientService } from '../services/patientService';
import type { PatientRequestDto } from '../services/patientService';
import { ApiClientError } from '../services/apiClient';
import { EmptyState } from '../components/EmptyState';
import { 
  Users, 
  Search, 
  ChevronRight, 
  Phone, 
  Mail, 
  Filter,
  UserPlus,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';

interface PatientsPageProps {
  onSelectPatient: (patientId: string) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBloodFilter, setSelectedBloodFilter] = useState<string>('ALL');

  // Register Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gender, setGender] = useState<string>('MALE');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState<string>('O+');

  const fetchPatients = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to load patient records from server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const resetForm = () => {
    setFullName('');
    setDateOfBirth('');
    setGender('MALE');
    setPhone('');
    setEmail('');
    setAddress('');
    setBloodGroup('O+');
    setModalError(null);
  };

  const handleOpenRegisterModal = () => {
    resetForm();
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
    resetForm();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    // Client-side validation
    if (!fullName.trim()) {
      setModalError('Full name is required.');
      return;
    }

    if (!dateOfBirth) {
      setModalError('Date of birth is required.');
      return;
    }

    const selectedDob = new Date(dateOfBirth);
    const today = new Date();
    if (selectedDob >= today) {
      setModalError('Date of birth must be a past date.');
      return;
    }

    if (!phone.trim()) {
      setModalError('Phone number is required.');
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setModalError('Invalid email format.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: PatientRequestDto = {
        fullName: fullName.trim(),
        dateOfBirth,
        gender,
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        bloodGroup: bloodGroup || undefined
      };

      const newPatient = await patientService.createPatient(payload);
      
      setSuccessToast(`Patient ${newPatient.fullName} successfully registered with ID ${newPatient.patientId}`);
      setTimeout(() => setSuccessToast(null), 5000);

      setIsRegisterModalOpen(false);
      resetForm();

      // Refresh list
      await fetchPatients();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setModalError(err.message);
      } else if (err instanceof Error) {
        setModalError(err.message);
      } else {
        setModalError('Failed to register patient. Please verify input data.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.patientId && p.patientId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.phone && p.phone.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesBlood = selectedBloodFilter === 'ALL' || p.bloodGroup === selectedBloodFilter;

    return matchesSearch && matchesBlood;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Toast Notification */}
      {successToast && (
        <div style={{
          padding: '14px 20px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--emerald-light)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: 'var(--emerald)',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
        }} className="animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Patient Records Directory
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Search, select, and manage registered patient clinical records.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            background: 'var(--emerald-light)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            fontSize: '13px',
            color: 'var(--emerald)',
            fontWeight: 600
          }}>
            <Users size={16} />
            <span>{patients.length} Registered Patients</span>
          </div>

          <button
            type="button"
            onClick={handleOpenRegisterModal}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={16} />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-subtle)'
          }}>
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, hospital ID (PAT-XXXX), phone, or email..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(11, 15, 25, 0.8)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {/* Blood Group Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Blood Group:</span>
          <select
            value={selectedBloodFilter}
            onChange={(e) => setSelectedBloodFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(11, 15, 25, 0.8)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Groups</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="glass-panel" style={{
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          color: 'var(--text-muted)'
        }}>
          <Loader2 size={32} className="animate-pulse-slow" color="var(--primary)" />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Fetching patient records from backend...</span>
        </div>
      ) : errorMessage ? (
        <div className="glass-panel" style={{
          padding: '24px',
          borderColor: 'rgba(244, 63, 94, 0.3)',
          background: 'var(--rose-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          color: 'var(--rose)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={22} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={fetchPatients}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--rose)',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Retry Loading
          </button>
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <th style={{ padding: '16px 20px' }}>Patient Identifier</th>
                  <th style={{ padding: '16px 20px' }}>Full Name</th>
                  <th style={{ padding: '16px 20px' }}>DOB / Age</th>
                  <th style={{ padding: '16px 20px' }}>Gender</th>
                  <th style={{ padding: '16px 20px' }}>Blood Group</th>
                  <th style={{ padding: '16px 20px' }}>Contact Information</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                          {p.patientId || 'N/A'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
                          ID: {p.id.substring(0, 8)}...
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {p.fullName}
                    </td>

                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                      {p.dateOfBirth}
                    </td>

                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                      {p.gender}
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'var(--emerald-light)',
                        color: 'var(--emerald)',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        {p.bloodGroup || 'Unspecified'}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={12} color="var(--text-subtle)" />
                          <span>{p.phone}</span>
                        </div>
                        {p.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={12} color="var(--text-subtle)" />
                            <span>{p.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => onSelectPatient(p.id)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--primary-light)',
                          border: '1px solid var(--border-accent)',
                          color: '#a5b4fc',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span>View Profile</span>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title={searchQuery ? 'No Matching Patients Found' : 'No Patient Records in System'}
          message={
            searchQuery 
              ? `No patient records matched search query "${searchQuery}".` 
              : 'There are currently no patient records stored in the MongoDB backend database.'
          }
        />
      )}

      {/* REGISTER PATIENT MODAL */}
      {isRegisterModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(5, 8, 15, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} className="animate-fade-in">
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '540px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Register New Patient
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Backend auto-generates business PAT-XXXX identifier
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseRegisterModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Banner */}
            {modalError && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--rose-light)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: 'var(--rose)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Full Name <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(11, 15, 25, 0.8)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* DOB & Gender Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                    Date of Birth <span style={{ color: 'var(--rose)' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(11, 15, 25, 0.8)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                    Gender <span style={{ color: 'var(--rose)' }}>*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(11, 15, 25, 0.8)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Phone & Blood Group Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                    Phone Number <span style={{ color: 'var(--rose)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1-555-0199"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(11, 15, 25, 0.8)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(11, 15, 25, 0.8)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john.doe@example.com"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(11, 15, 25, 0.8)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Home / Residential Address (Optional)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace, Springfield"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(11, 15, 25, 0.8)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleCloseRegisterModal}
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                    opacity: isSubmitting ? 0.8 : 1
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-pulse-slow" />
                      <span>Saving Patient...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Save Patient Record</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
