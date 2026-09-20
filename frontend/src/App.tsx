import React from 'react';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPlaceholder } from './pages/DashboardPlaceholder';

export const App: React.FC = () => {
  return (
    <MainLayout>
      <DashboardPlaceholder />
    </MainLayout>
  );
};

export default App;
