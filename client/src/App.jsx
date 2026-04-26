import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PropertiesPage from './pages/PropertiesPage';
import TenantsPage from './pages/TenantsPage';
import PaymentsPage from './pages/PaymentsPage';
import LeasePage from './pages/LeasePage';
import MaintenancePage from './pages/MaintenancePage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.some(role => role.toLowerCase() === (user.role || '').toLowerCase())) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {user && <Sidebar />}
      
      <main className={`flex-1 overflow-y-auto ${user ? 'h-screen' : ''}`}>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          <Route 
            path="/properties" 
            element={
              <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                <PropertiesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tenants" 
            element={
              <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                <TenantsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/payments" 
            element={
              <ProtectedRoute allowedRoles={['Owner', 'Tenant']}>
                <PaymentsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/leases" 
            element={
              <ProtectedRoute allowedRoles={['Owner', 'Tenant', 'Manager']}>
                <LeasePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/maintenance" 
            element={
              <ProtectedRoute>
                <MaintenancePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;