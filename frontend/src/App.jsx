import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CitizenHome from './pages/CitizenHome';
import LodgeGrievance from './pages/LodgeGrievance';
import ViewStatus from './pages/ViewStatus';
import Guidelines from './pages/Guidelines';
import ContactUs from './pages/ContactUs';
import OfficerLogin from './pages/OfficerLogin';
import OfficerDashboard from './pages/OfficerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  console.log("App component rendering...");
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
        <Route path="/officer-login" element={<OfficerLogin />} />
        <Route path="/officer-dashboard" element={
          <ProtectedRoute>
            <OfficerDashboard />
          </ProtectedRoute>
        } />
        <Route element={<Layout />}>
          <Route path="/" element={<CitizenHome />} />
          <Route path="/lodge" element={<LodgeGrievance />} />
          <Route path="/status" element={<ViewStatus />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/contact" element={<ContactUs />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
