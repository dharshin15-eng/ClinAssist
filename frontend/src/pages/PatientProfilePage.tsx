import React, { useState, useEffect } from 'react';
import type { Patient } from '../types';
import { patientService } from '../services/patientService';
import type { PatientRequestDto } from '../services/patientService';
import { ApiClientError } from '../services/apiClient';
import { SectionCard } from '../components/SectionCard';
import { EmptyState } from '../components/EmptyState';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Stethoscope, 
  FileText, 
  BrainCircuit, 
  Pill,
  ShieldAlert,
  Activity,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';

interface PatientProfilePageProps {
  patientId: string; // MongoDB internal ID (e.g. 673f...)
  onBack: () => void;
  onSelectAssessment: (patientId: string, assessmentId: string) => void;
}

export const PatientProfilePage: React.FC<PatientProfilePageProps> = ({
  patientId,
  onBack
}) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CLINICAL' | 'REPORTS' | 'ASSESSMENTS'>('OVERVIEW');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [editFullName, setEditFullName] = useState<string>('');
  const [editDateOfBirth, setEditDateOfBirth] = useState<string>('');
  const [editGender, setEditGender] = useState<string>('MALE');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editBloodGroup, setEditBloodGroup] = useState<string>('O+');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchPatientDetail = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsNotFound(false);
    try {
      const data = await patientService.getPatient(patientId);
      setPatient(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 404) {
          setIsNotFound(true);
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage('Failed to load patient record.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetail();
  }, [patientId]);

  const handleOpenEditModal = () => {
    if (!patient) return;
    setEditFullName(patient.fullName || '');
    setEditDateOfBirth(patient.dateOfBirth || '');
    setEditGender(patient.gender || 'MALE');
    setEditPhone(patient.phone || '');
    setEditEmail(patient.email || '');
    setEditAddress(patient.address || '');
    setEditBloodGroup(patient.bloodGroup || 'O+');
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setEditError(null);

    if (!editFullName.trim()) {
      setEditError('Full name is required.');
      return;
    }

    if (!editDateOfBirth) {
      setEditError('Date of birth is required.');
      return;
    }

    if (!editPhone.trim()) {
      setEditError('Phone number is required.');
      return;
    }

    if (editEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) {
      setEditError('Invalid email format.');
      return;
    }

    setIsSavingEdit(true);

    try {
      const payload: PatientRequestDto = {
        fullName: editFullName.trim(),
        dateOfBirth: editDateOfBirth,
        gender: editGender,
        phone: editPhone.trim(),
        email: editEmail.trim() || undefined,
        address: editAddress.trim() || undefined,
        bloodGroup: editBloodGroup || undefined
      };

      const updated = await patientService.updatePatient(patient.id, payload);
      setPatient(updated);

      setSuccessToast(`Patient details for ${updated.fullName} updated successfully.`);
      setTimeout(() => setSuccessToast(null), 4000);

      setIsEditModalOpen(false);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setEditError(err.message);
      } else if (err instanceof Error) {
        setEditError(err.message);
      } else {
        setEditError('Failed to update patient record.');
      }
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!patient) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await patientService.deletePatient(patient.id);
      setIsDeleteModalOpen(false);
      onBack(); // Redirect back to Directory
    } catch (err) {
      if (err instanceof ApiClientError) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Failed to delete patient record.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            width: 'fit-content'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Patients Directory</span>
        </button>

        <div className="glass-panel" style={{
          padding: '60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          color: 'var(--text-muted)'
        }}>
          <Loader2 size={36} className="animate-pulse-slow" color="var(--primary)" />
          <span style={{ fontSize: '15px', fontWeight: 500 }}>Loading patient profile details...</span>
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            width: 'fit-content'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Patients Directory</span>
        </button>

        <div className="glass-panel" style={{
          padding: '40px',
          borderColor: 'rgba(244, 63, 94, 0.3)',
          background: 'var(--rose-light)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
          color: 'var(--rose)'
        }}>
          <AlertCircle size={40} />
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Patient Record Not Found</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
              No patient record exists with MongoDB ID: <code style={{ color: '#a5b4fc' }}>{patientId}</code>
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary)',
              border: 'none',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Return to Patients Directory
          </button>
        </div>
      </div>
    );
  }

  if (errorMessage || !patient) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            width: 'fit-content'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Patients Directory</span>
        </button>

        <div className="glass-panel" style={{
          padding: '32px',
          borderColor: 'rgba(244, 63, 94, 0.3)',
          background: 'var(--rose-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          color: 'var(--rose)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={24} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{errorMessage || 'Failed to load patient profile.'}</span>
          </div>
          <button
            type="button"
            onClick={fetchPatientDetail}
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
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
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

      {/* Back Button & Patient Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            width: 'fit-content'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Patients Directory</span>
        </button>

        {/* Patient Demographics Hero Card */}
        <div className="glass-panel" style={{
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(18, 26, 43, 0.9) 0%, rgba(11, 15, 25, 0.9) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '24px',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
            }}>
              {patient.fullName.charAt(0)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                  {patient.fullName}
                </h2>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: 'var(--emerald-light)',
                  color: 'var(--emerald)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontFamily: 'monospace'
                }}>
                  {patient.patientId || 'PAT-RECORD'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--text-subtle)" />
                  <span>DOB: {patient.dateOfBirth} ({patient.gender})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="var(--text-subtle)" />
                  <span>Blood Group: <strong>{patient.bloodGroup || 'Unspecified'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="var(--text-subtle)" />
                  <span>{patient.phone}</span>
                </div>
                {patient.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} color="var(--text-subtle)" />
                    <span>{patient.email}</span>
                  </div>
                )}
              </div>

              {patient.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-subtle)' }}>
                  <MapPin size={14} />
                  <span>Address: {patient.address}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleOpenEditModal}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--border-accent)',
                  color: '#a5b4fc',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Edit size={14} />
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--rose-light)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--rose)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} />
                <span>Delete Patient</span>
              </button>
            </div>

            <div style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              fontSize: '11px',
              color: 'var(--text-subtle)',
              fontFamily: 'monospace'
            }}>
              <span>Internal Mongo ID:</span>
              <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{patient.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px'
      }}>
        {[
          { id: 'OVERVIEW', label: 'Overview & Summary', icon: Activity },
          { id: 'CLINICAL', label: 'Clinical Records', icon: Stethoscope },
          { id: 'REPORTS', label: 'Diagnostic Reports', icon: FileText },
          { id: 'ASSESSMENTS', label: 'Assessments', icon: BrainCircuit }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <TabIcon size={16} color={isActive ? 'var(--primary)' : 'var(--text-subtle)'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {(activeTab === 'OVERVIEW' || activeTab === 'CLINICAL') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
          
          <SectionCard title="Reported Symptoms" icon={Stethoscope} iconColor="var(--rose)">
            <EmptyState message="No symptoms recorded for this patient yet." />
          </SectionCard>

          <SectionCard title="Active Medical History" icon={Activity} iconColor="var(--amber)">
            <EmptyState message="No medical history conditions recorded." />
          </SectionCard>

          <SectionCard title="Documented Allergies" icon={ShieldAlert} iconColor="var(--rose)">
            <EmptyState message="No allergies documented for this patient." />
          </SectionCard>

          <SectionCard title="Current Medications" icon={Pill} iconColor="var(--cyan)">
            <EmptyState message="No current medications prescribed." />
          </SectionCard>

        </div>
      )}

      {(activeTab === 'OVERVIEW' || activeTab === 'REPORTS') && (
        <SectionCard title="Diagnostic & Laboratory Reports" icon={FileText} iconColor="var(--primary)">
          <EmptyState message="No diagnostic reports uploaded for this patient." />
        </SectionCard>
      )}

      {(activeTab === 'OVERVIEW' || activeTab === 'ASSESSMENTS') && (
        <SectionCard title="Clinical Decision-Support Assessments" icon={BrainCircuit} iconColor="var(--amber)">
          <EmptyState message="No decision-support assessments generated for this patient yet." />
        </SectionCard>
      )}

      {/* EDIT PATIENT MODAL */}
      {isEditModalOpen && (
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
                  <Edit size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Edit Patient Details
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Update clinical record for {patient.fullName} ({patient.patientId})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseEditModal}
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
            {editError && (
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
                <span>{editError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Full Name <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
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
                    value={editDateOfBirth}
                    onChange={(e) => setEditDateOfBirth(e.target.value)}
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
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
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
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
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
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
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
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
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
                  Residential Address
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
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
                  onClick={handleCloseEditModal}
                  disabled={isSavingEdit}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isSavingEdit ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingEdit}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isSavingEdit ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                    opacity: isSavingEdit ? 0.8 : 1
                  }}
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 size={16} className="animate-pulse-slow" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
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
            maxWidth: '460px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            borderColor: 'rgba(244, 63, 94, 0.4)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--rose-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--rose)'
              }}>
                <Trash2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                  Delete Patient Record
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {deleteError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--rose-light)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: 'var(--rose)',
                fontSize: '13px'
              }}>
                {deleteError}
              </div>
            )}

            <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete the patient record for{' '}
              <strong style={{ color: 'var(--rose)' }}>{patient.fullName}</strong> ({patient.patientId})?
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--rose)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
                  opacity: isDeleting ? 0.8 : 1
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-pulse-slow" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
