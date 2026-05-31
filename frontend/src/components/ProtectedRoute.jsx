import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const officerToken = localStorage.getItem('officerToken');
  const officerInfo = localStorage.getItem('officerInfo');

  if (!officerToken || !officerInfo) {
    return <Navigate to="/officer-login" replace />;
  }

  return children;
};

export default ProtectedRoute;
