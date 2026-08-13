import { Suspense, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/useAuth';
import styles from '../styles/DashboardShell.module.css';

const roleNavigation = {
  Student: [
    { key: 'dashboard', label: 'Dashboard', path: '/app/a' },
    { key: 'courses', label: 'My Courses' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'messages', label: 'Message' },
    { key: 'profile', label: 'Profile' },
  ],

  'Super Admin': [
    { key: 'dashboard', label: 'Dashboard', path: '/app/d' },
    { key: 'users', label: 'User Management' },
    { key: 'students', label: 'Students' },
    { key: 'courses', label: 'Course Management' },
    { key: 'categories', label: 'Categories' },
    { key: 'scheduling', label: 'Scheduling' },
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
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return null;
  }

  const currentSegment = location.pathname.replace(/^\/app\/?/, '').split('/')[0];
  const dashboardPath = user.dashboard || (user.role === 'Super Admin' ? 'd' : 'a');
  const allowedPath = `/app/${dashboardPath}`;

  if (!currentSegment || currentSegment === '') {
    return <Navigate to={allowedPath} replace />;
  }

  if (currentSegment !== dashboardPath) {
    return <Navigate to={allowedPath} replace />;
  }

  const navItems = roleNavigation[user.role] ?? roleNavigation.Student;

  const handleSidebarAction = (action, key) => {
    if (action === 'logout') {
      logout();
      navigate('/login');
    } else {
      setActiveTab(key);
    }
  };

  return (
    <main className={styles.dashboardShell}>
      <aside className={styles.sidebar} aria-label="Dashboard navigation">
        <div className={styles.brandBlock} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/chemy2.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          <div>
            <span className={styles.brandName}>CHEMY LMS</span>
            <p className={styles.roleText} style={{ margin: 0, fontSize: '12px' }}>{user.role} Portal</p>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activeTab === item.key ? styles.navLinkActive : styles.navButton}
              onClick={() => handleSidebarAction(item.action, item.key)}
              style={{ textAlign: 'left', width: '100%', border: 'none', background: activeTab === item.key ? '' : 'transparent', cursor: 'pointer' }}
            >
              {item.label}
            </button>
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
            <p className={styles.welcome}>Good Morning, {user.fullName.split(' ')[0]} 👋</p>
          </div>
          <div className={styles.topControls}>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search Courses"
                aria-label="Global search"
              />
            </div>
            <button type="button" className={styles.iconButton} aria-label="View notifications">
              🔔
            </button>
            <button type="button" className={styles.iconButton} aria-label="Messages">
              ✉️
            </button>
            <img 
              src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=2563EB&color=fff`} 
              alt="Profile Avatar" 
              className={styles.avatar} 
            />
          </div>
        </header>

        <Suspense fallback={<div className={styles.loading}>Loading dashboard…</div>}>
          <Outlet context={{ activeTab }} />
        </Suspense>
      </section>
    </main>
  );
}
