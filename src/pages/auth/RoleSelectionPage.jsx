import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from '../../router/Router.jsx';

export function RoleSelectionPage() {
  const { activeRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const targetDashboard = `/${activeRole || 'customer'}-dashboard`;
    navigate(targetDashboard, { replace: true });
  }, [activeRole, navigate]);

  return null;
}
