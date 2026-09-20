import React, { useState } from 'react';
import { MOCK_PATIENTS } from '../data/mockData';
import { EmptyState } from '../components/EmptyState';
import { 
  Users, 
  Search, 
  ChevronRight, 
  Phone, 
  Mail, 
  Filter
} from 'lucide-react';

interface PatientsPageProps {
  onSelectPatient: (patientId: string) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({ onSelectPatient }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBloodFilter, setSelectedBloodFilter] = useState<string>('ALL');

  const filteredPatients = MOCK_PATIENTS.filter((p) => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBlood = selectedBloodFilter === 'ALL' || p.bloodGroup === selectedBloodFilter;

    return matchesSearch && matchesBlood;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Patient Records Directory
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Search and select registered patient clinical records.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: 'var(--emerald-light)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          fontSize: '12px',
          color: 'var(--emerald)',
          fontWeight: 600
        }}>
          <Users size={14} />
          <span>{MOCK_PATIENTS.length} Registered Patients</span>
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
            placeholder="Search by name, hospital ID (PAT-XXXX), or email..."
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
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="AB+">AB+</option>
          </select>
        </div>

      </div>

      {/* Patient List Table */}
      {filteredPatients.length > 0 ? (
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
                          {p.patientId}
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
                        {p.bloodGroup}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={12} color="var(--text-subtle)" />
                          <span>{p.phone}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={12} color="var(--text-subtle)" />
                          <span>{p.email}</span>
                        </div>
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
          title="No Matching Patients Found"
          message={`No patient records matched search query "${searchQuery}".`}
        />
      )}

    </div>
  );
};
