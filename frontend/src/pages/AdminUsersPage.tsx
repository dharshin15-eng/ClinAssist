import React, { useState, useEffect } from 'react';
import { adminUserService } from '../services/adminUserService';
import type { User, AdminCreateUserRequest, AuditLog } from '../types';
import { useAuth } from '../hooks/useAuth';
import { ApiClientError } from '../services/apiClient';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Stethoscope,
  Building2,
  Shield,
  History,
  Lock,
  Mail,
  User as UserIcon,
  RefreshCw,
  Trash2
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State for Creating User
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<AdminCreateUserRequest>({
    fullName: '',
    email: '',
    password: '',
    role: 'DOCTOR'
  });

  // Modal State for Deleting User
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const fetchedUsers = await adminUserService.getUsers();
      setUsers(fetchedUsers);
      
      const fetchedLogs = await adminUserService.getAuditLogs();
      setAuditLogs(fetchedLogs);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to load user management data.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const created = await adminUserService.createUser(formData);
      setSuccessMessage(`Successfully created user ${created.fullName} (${created.role}).`);
      setShowAddModal(false);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: 'DOCTOR'
      });
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create user account.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userToToggle: User) => {
    if (userToToggle.id === currentUser?.id) {
      setErrorMessage('You cannot disable your own active ADMIN account.');
      return;
    }

    const nextStatus = !userToToggle.enabled;
    const actionText = nextStatus ? 'enable' : 'disable';

    if (!window.confirm(`Are you sure you want to ${actionText} account for ${userToToggle.fullName}?`)) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await adminUserService.updateUserStatus(userToToggle.id, nextStatus);
      setSuccessMessage(`Account for ${updated.fullName} is now ${updated.enabled ? 'ACTIVE' : 'DISABLED'}.`);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      // Refresh audit logs
      const updatedLogs = await adminUserService.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(`Failed to ${actionText} user account.`);
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    if (currentUser?.role !== 'ADMIN') {
      setErrorMessage('ONLY an authenticated ADMIN user can delete another user account.');
      setShowDeleteModal(false);
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await adminUserService.deleteUser(userToDelete.id);
      setSuccessMessage(`User account for ${userToDelete.fullName} (${userToDelete.email}) has been permanently deleted.`);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      // Refresh audit logs to reflect the ADMIN_DELETE_USER event
      const updatedLogs = await adminUserService.getAuditLogs();
      setAuditLogs(updatedLogs);
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to delete user account. Please try again.');
      }
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--cyan)',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}>
            <Shield size={12} />
            ADMIN
          </span>
        );
      case 'DOCTOR':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            border: '1px solid var(--border-accent)'
          }}>
            <Stethoscope size={12} />
            DOCTOR
          </span>
        );
      case 'HOSPITAL_STAFF':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            background: 'var(--emerald-light)',
            color: 'var(--emerald)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <Building2 size={12} />
            HOSPITAL STAFF
          </span>
        );
      default:
        return <span>{role}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'var(--primary-light)',
              border: '1px solid var(--border-accent)',
              color: 'var(--primary)'
            }}>
              <ShieldCheck size={24} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>
              System User Management & Security Audit
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            ADMIN Portal: Manage clinical accounts, user privileges, account statuses, and view security audit logs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchData}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={() => {
              setErrorMessage(null);
              setSuccessMessage(null);
              setShowAddModal(true);
            }}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)'
            }}
          >
            <UserPlus size={16} />
            Create Clinical User
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--rose-light)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: 'var(--rose)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--emerald-light)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--emerald)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            background: activeTab === 'users' ? 'var(--primary-light)' : 'transparent',
            border: activeTab === 'users' ? '1px solid var(--border-accent)' : '1px solid transparent',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={16} />
          User Accounts ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            background: activeTab === 'audit' ? 'var(--primary-light)' : 'transparent',
            border: activeTab === 'audit' ? '1px solid var(--border-accent)' : '1px solid transparent',
            color: activeTab === 'audit' ? 'var(--primary)' : 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <History size={16} />
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} className="animate-pulse-slow" color="var(--primary)" />
        </div>
      ) : activeTab === 'users' ? (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{
                background: 'var(--primary-very-light)',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '11px',
                letterSpacing: '0.5px'
              }}>
                <th style={{ padding: '14px 20px' }}>Full Name</th>
                <th style={{ padding: '14px 20px' }}>Email Address</th>
                <th style={{ padding: '14px 20px' }}>Role</th>
                <th style={{ padding: '14px 20px' }}>Account Status</th>
                <th style={{ padding: '14px 20px' }}>Created Date</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const isUserEnabled = u.enabled !== false;

                return (
                  <tr key={u.id} style={{
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background 0.15s ease'
                  }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{u.fullName}</span>
                        {isSelf && (
                          <span style={{ fontSize: '10px', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px', color: 'var(--primary)' }}>
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-main)' }}>{u.email}</td>
                    <td style={{ padding: '14px 20px' }}>{getRoleBadge(u.role)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      {isUserEnabled ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--emerald)',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}>
                          <CheckCircle2 size={14} />
                          Active
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--rose)',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}>
                          <XCircle size={14} />
                          Disabled
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {isSelf ? (
                        <span style={{ fontSize: '11px', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                          Protected (Current User)
                        </span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              background: isUserEnabled ? 'var(--rose-light)' : 'var(--emerald-light)',
                              border: isUserEnabled ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                              color: isUserEnabled ? 'var(--rose)' : 'var(--emerald)'
                            }}
                          >
                            {isUserEnabled ? 'Disable Account' : 'Enable Account'}
                          </button>
                          {currentUser?.role === 'ADMIN' && (
                            <button
                              onClick={() => {
                                setUserToDelete(u);
                                setErrorMessage(null);
                                setSuccessMessage(null);
                                setShowDeleteModal(true);
                              }}
                              title="Delete Account"
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#EF4444',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Audit Logs View */
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{
                background: 'var(--primary-very-light)',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '11px',
                letterSpacing: '0.5px'
              }}>
                <th style={{ padding: '14px 20px' }}>Timestamp</th>
                <th style={{ padding: '14px 20px' }}>Actor</th>
                <th style={{ padding: '14px 20px' }}>Action</th>
                <th style={{ padding: '14px 20px' }}>Target User</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {log.actorEmail || 'System'}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--cyan)' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-main)' }}>
                      {log.targetUserId || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {log.success ? (
                        <span style={{ color: 'var(--emerald)', fontWeight: 600, fontSize: '11px' }}>SUCCESS</span>
                      ) : (
                        <span style={{ color: 'var(--rose)', fontWeight: 600, fontSize: '11px' }}>FAILED</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', maxWidth: '300px', wordBreak: 'break-word' }}>
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create Clinical User */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={20} color="#0ea5e9" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  Create Clinical Account
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sarah.jenkins@hospital.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                  Initial Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* Role Select (ONLY DOCTOR and HOSPITAL_STAFF allowed) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                  Assign Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'DOCTOR' | 'HOSPITAL_STAFF' })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '13px'
                  }}
                >
                  <option value="DOCTOR">DOCTOR (Clinical Practitioner)</option>
                  <option value="HOSPITAL_STAFF">HOSPITAL_STAFF (Medical Administrative Staff)</option>
                </select>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Note: Admin user creation through user management endpoints is restricted.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#0ea5e9',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-pulse-slow" /> : null}
                  <span>Create Account</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete User Confirmation */}
      {showDeleteModal && userToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '460px',
            background: '#ffffff',
            border: '1px solid #fecaca',
            boxShadow: '0 20px 40px rgba(239, 68, 68, 0.15)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#EF4444',
                flexShrink: 0
              }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Delete User Account
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            {/* User Info */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                You are about to permanently delete:
              </p>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>
                {userToDelete.fullName}
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                {userToDelete.email}
              </p>
            </div>

            {/* Warning */}
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '12px', color: '#dc2626', margin: 0, lineHeight: '1.5' }}>
                <strong>This action cannot be undone.</strong> The user account will be permanently
                removed. Clinical records, patient data, assessments, and diagnostic reports will
                not be affected.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteUser}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#EF4444',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isDeleting ? 0.7 : 1
                }}
              >
                {isDeleting ? <Loader2 size={15} className="animate-pulse-slow" /> : <Trash2 size={15} />}
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
