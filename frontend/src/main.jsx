import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './style.css';
import { BrowserRouter, Routes, Route, Navigate } from './router/Router.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CustomerProvider } from './context/CustomerContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { NotFoundPage } from './components/NotFoundPage.jsx';

import { LoginPage } from './pages/auth/LoginPage.jsx';
import { SignupPage } from './pages/auth/SignupPage.jsx';
import { RoleSelectionPage } from './pages/auth/RoleSelectionPage.jsx';
import { CustomerDashboardPage } from './pages/dashboards/CustomerDashboardPage.jsx';
import { TailorDashboardPage } from './pages/dashboards/TailorDashboardPage.jsx';
import { AdminDashboardPage } from './pages/dashboards/AdminDashboardPage.jsx';
import { PublicGarmentTrackingPage } from './pages/public/PublicGarmentTrackingPage.jsx';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <CustomerProvider>
              <AuthProvider>
                <Routes>
                  {/* Public Authentication & QR Tracking Routes */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/track" element={<PublicGarmentTrackingPage />} />
                  <Route path="/track/:id" element={<PublicGarmentTrackingPage />} />
                  <Route path="/garment/:id" element={<PublicGarmentTrackingPage />} />

                  {/* Role Selection Workspace Route */}
                  <Route
                    path="/role-selection"
                    element={
                      <ProtectedRoute>
                        <RoleSelectionPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Customer Workspace Routes */}
                  <Route
                    path="/customer-dashboard"
                    element={
                      <ProtectedRoute allowedRole="customer">
                        <CustomerDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customer_dashboard"
                    element={
                      <ProtectedRoute allowedRole="customer">
                        <CustomerDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customer/dashboard"
                    element={
                      <ProtectedRoute allowedRole="customer">
                        <CustomerDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Tailor Workspace Routes */}
                  <Route
                    path="/tailor-dashboard"
                    element={
                      <ProtectedRoute allowedRole="tailor">
                        <TailorDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tailor/dashboard"
                    element={
                      <ProtectedRoute allowedRole="tailor">
                        <TailorDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Workspace Routes */}
                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute allowedRole="admin">
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRole="admin">
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </AuthProvider>
            </CustomerProvider>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <App />
  </GoogleOAuthProvider>
);
