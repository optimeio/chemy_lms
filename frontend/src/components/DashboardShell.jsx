import { Suspense } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/useAuth';
import styles from '../styles/DashboardShell.module.css';

const roleNavigation = {
  Student: [
    { key: 'dashboard', label: 'Dashboard', path: '/app/a' },
    { key: 'courses', label: 'My Courses' },
    { key: 'live', label: 'Live Classes' },
    { key: 'assignments', label: 'Assignments & Quiz' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'messages', label: 'Messages' },
    { key: 'profile', label: 'Profile' },
    { key: 'settings', label: 'Settings' },
    { key: 'logout', label: 'Logout', action: 'logout' },
  ],
  Trainer: [
    { key: 'dashboard', label: 'Dashboard', path: '/app/b' },
    { key: 'courses', label: 'My Courses' },
    { key: 'students', label: 'Students' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'live', label: 'Live Classes' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'materials', label: 'Study Materials' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'reports', label: 'Reports' },
    { key: 'messages', label: 'Messages' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'profile', label: 'Profile' },
    { key: 'settings', label: 'Settings' },
    { key: 'logout', label: 'Logout', action: 'logout' },
  ],
  SPOC: [
    { key: 'dashboard', label: 'Dashboard', path: '/app/c' },
    { key: 'employees', label: 'Employees' },
    { key: 'programs', label: 'Training Programs' },
    { key: 'trainers', label: 'Trainers' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'reports', label: 'Reports' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'messages', label: 'Messages' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'profile', label: 'Profile' },
    { key: 'settings', label: 'Settings' },
    { key: 'logout', label: 'Logout', action: 'logout' },
  ],
  'Super Admin': [
    { key: 'dashboard', label: 'Dashboard', path: '/app/d' },
    { key: 'users', label: 'User Management' },
    { key: 'companies', label: 'Companies' },
    { key: 'students', label: 'Students' },
    { key: 'trainers', label: 'Trainers' },
    { key: 'spoc', label: 'SPOC' },
    { key: 'courses', label: 'Course Management' },
    { key: 'categories', label: 'Categories' },
    { key: 'scheduling', label: 'Scheduling' },
    { key: 'live', label: 'Live Classes' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'reports', label: 'Reports' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'system', label: 'System Settings' },
    { key: 'documents', label: 'Document Manager' },
    { key: 'audit', label: 'Audit Logs' },
    { key: 'profile', label: 'Profile' },
    { key: 'logout', label: 'Logout', action: 'logout' },
  ],
};

export default function DashboardShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const currentSegment = location.pathname.replace(/^\/app\/?/, '').split('/')[0];
  const allowedPath = `/app/${user.dashboard}`;

  if (!currentSegment || currentSegment === '') {
    return <Navigate to={allowedPath} replace />;
  }

  if (currentSegment !== user.dashboard) {
    return <Navigate to={allowedPath} replace />;
  }

  const navItems = roleNavigation[user.role] ?? roleNavigation.Student;

  const handleSidebarAction = (action) => {
    if (action === 'logout') {
      logout();
      navigate('/login');
    }
  };

  return (
    <main className={styles.dashboardShell}>
      <aside className={styles.sidebar} aria-label="Dashboard navigation">
        <div className={styles.brandBlock}>
          <span className={styles.brandName}>CHEMY LMS</span>
          <p className={styles.roleText}>{user.role} Portal</p>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            item.path ? (
              <Link
                key={item.key}
                to={item.path}
                className={location.pathname === item.path ? styles.navLinkActive : styles.navLink}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.key}
                type="button"
                className={styles.navButton}
                onClick={() => handleSidebarAction(item.action)}
              >
                {item.label}
              </button>
            )
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div>
            <p className={styles.userHeading}>Signed in as</p>
            <p className={styles.userName}>{user.fullName}</p>
          </div>
          <button onClick={() => handleSidebarAction('logout')} className={styles.signOutButton}>
            Sign out
          </button>
        </div>
      </aside>

      <section className={styles.contentArea}>
        <header className={styles.topBar}>
          <div>
            <p className={styles.welcome}>Welcome back, {user.fullName.split(' ')[0]}.</p>
            <p className={styles.subtitle}>Your {user.role} dashboard is ready with live insights and polished workflows.</p>
          </div>
          <div className={styles.topControls}>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search courses, reports, messages..."
                aria-label="Global search"
              />
            </div>
            <button type="button" className={styles.iconButton} aria-label="View notifications">
              🔔
            </button>
          </div>
        </header>

        <Suspense fallback={<div className={styles.loading}>Loading dashboard…</div>}>
          <Outlet />
        </Suspense>
      </section>
    </main>
  );
}
