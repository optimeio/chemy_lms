import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import './App.css';
import Login from './pages/Login';



import Dashboard from './pages/Dashboard';
import AdminPortal from './pages/AdminPortal';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardShell from './components/DashboardShell';
import DashboardLanding from './pages/DashboardLanding';

const StudentDashboard = lazy(() => import('./pages/dashboards/StudentDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/dashboards/SuperAdminDashboard'));
const CoursePlayer = lazy(() => import('./pages/CoursePlayer'));

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
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
          <Route path="a/course/:courseId" element={<CoursePlayer />} />
          <Route path="d" element={<SuperAdminDashboard />} />
          <Route path="d/course/:courseId" element={<CoursePlayer />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
        <Route path="*" element={<div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-primary)' }}>Page not found</div>} />
      </Routes>
    </Router>
  );
}