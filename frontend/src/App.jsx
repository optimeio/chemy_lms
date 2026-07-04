import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy } from 'react';
import './App.css';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentSignup from './pages/StudentSignup';
import TrainerSignup from './pages/TrainerSignup';
import CompanySignup from './pages/CompanySignup';
import About from './pages/About';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import OTPVerification from './pages/OTPVerification';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminPortal from './pages/AdminPortal';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardShell from './components/DashboardShell';
import DashboardLanding from './pages/DashboardLanding';

const StudentDashboard = lazy(() => import('./pages/dashboards/StudentDashboard'));
const TrainerDashboard = lazy(() => import('./pages/dashboards/TrainerDashboard'));
const SpocDashboard = lazy(() => import('./pages/dashboards/SpocDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/dashboards/SuperAdminDashboard'));

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/student" element={<StudentSignup />} />
        <Route path="/register/trainer" element={<TrainerSignup />} />
        <Route path="/register/company" element={<CompanySignup />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardLanding />} />
          <Route path="a" element={<StudentDashboard />} />
          <Route path="b" element={<TrainerDashboard />} />
          <Route path="c" element={<SpocDashboard />} />
          <Route path="d" element={<SuperAdminDashboard />} />
        </Route>
        <Route path="*" element={<div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-primary)' }}>Page not found</div>} />
      </Routes>
    </Router>
  );
}