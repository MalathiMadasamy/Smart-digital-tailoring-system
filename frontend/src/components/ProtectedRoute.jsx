import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from '../router/Router.jsx';

export function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, activeRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role Protection: If accessing another role's dashboard, redirect to own dashboard
  if (allowedRole && activeRole !== allowedRole) {
    const userOwnDashboard = `/${activeRole || 'customer'}-dashboard`;
    return <Navigate to={userOwnDashboard} replace />;
  }

  return children;
}
