import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientProfilePage } from './pages/PatientProfilePage';
import { AssessmentPage } from './pages/AssessmentPage';
import { MOCK_PATIENTS } from './data/mockData';

type ViewMode = 'dashboard' | 'patients' | 'patient-profile' | 'assessment';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(MOCK_PATIENTS[0].id);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('assess-9001');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveView('patient-profile');
  };

  const handleSelectAssessment = (patientId: string, assessmentId: string) => {
    setSelectedPatientId(patientId);
    setSelectedAssessmentId(assessmentId);
    setActiveView('assessment');
  };

  const handleNavigateSidebar = (view: 'dashboard' | 'patients' | 'assessment') => {
    setActiveView(view);
  };

  return (
    <MainLayout activeView={activeView} onNavigate={handleNavigateSidebar}>
      {activeView === 'dashboard' && (
        <DashboardPage
          onNavigateToPatients={() => setActiveView('patients')}
          onSelectPatient={handleSelectPatient}
          onSelectAssessment={handleSelectAssessment}
        />
      )}

      {activeView === 'patients' && (
        <PatientsPage onSelectPatient={handleSelectPatient} />
      )}

      {activeView === 'patient-profile' && (
        <PatientProfilePage
          patientId={selectedPatientId}
          onBack={() => setActiveView('patients')}
          onSelectAssessment={handleSelectAssessment}
        />
      )}

      {activeView === 'assessment' && (
        <AssessmentPage
          patientId={selectedPatientId}
          assessmentId={selectedAssessmentId}
          onBack={() => setActiveView('patient-profile')}
        />
      )}
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
