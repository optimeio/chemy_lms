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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      if (location.pathname !== allowedPath) {
        navigate(allowedPath);
      }
      setActiveTab(key);
      setIsMobileMenuOpen(false); // Close menu on mobile after selection
    }
  };

  return (
    <main className={styles.dashboardShell}>
      {/* Mobile Header Toggle (Only visible on small screens) */}
      <div className={styles.mobileHeader}>
        <div className={styles.brandBlock} style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <img src="/chemy2.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span className={styles.brandName} style={{ fontSize: '18px' }}>CHEMY</span>
        </div>
        <div className={styles.mobileHeaderControls}>
          <button type="button" className={styles.iconButton} aria-label="View notifications">
            🔔
          </button>
          {(() => {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://chemy-lms.onrender.com/api';
            const serverBaseUrl = API_BASE_URL.replace('/api', '');
            const rawImg = user.profileImage;
            const avatarSrc = rawImg
              ? (rawImg.startsWith('http') || rawImg.startsWith('blob:') || rawImg.startsWith('data:')
                  ? rawImg
                  : `${serverBaseUrl}${rawImg}`)
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=2563EB&color=fff`;
            return <img src={avatarSrc} alt="Profile Avatar" className={styles.avatar} style={{ width: '36px', height: '36px' }} onClick={() => handleSidebarAction(null, 'profile')} />;
          })()}
        </div>
      </div>

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`} aria-label="Dashboard navigation">
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
            {/* Desktop only controls */}
            <div className={styles.desktopControls}>
              <button type="button" className={styles.iconButton} aria-label="View notifications">
                🔔
              </button>
              <button type="button" className={styles.iconButton} aria-label="Messages">
                ✉️
              </button>
              {(() => {
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://chemy-lms.onrender.com/api';
                const serverBaseUrl = API_BASE_URL.replace('/api', '');
                const rawImg = user.profileImage;
                const avatarSrc = rawImg
                  ? (rawImg.startsWith('http') || rawImg.startsWith('blob:') || rawImg.startsWith('data:')
                      ? rawImg
                      : `${serverBaseUrl}${rawImg}`)
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=2563EB&color=fff`;
                return <img src={avatarSrc} alt="Profile Avatar" className={styles.avatar} onClick={() => handleSidebarAction(null, 'profile')} />;
              })()}
            </div>
          </div>
        </header>

        <Suspense fallback={<div className={styles.loading}>Loading dashboard…</div>}>
          <Outlet context={{ activeTab }} />
        </Suspense>
      </section>

      {/* Mobile Bottom Navigation */}
      {user.role !== 'Super Admin' && (
        <nav className={styles.mobileBottomNav}>
          <button className={activeTab === 'dashboard' ? styles.bottomNavBtnActive : styles.bottomNavBtn} onClick={() => handleSidebarAction(null, 'dashboard')}>
            <span className={styles.bottomNavIcon}>🏠</span>
            <span>Home</span>
          </button>
          <button className={activeTab === 'courses' ? styles.bottomNavBtnActive : styles.bottomNavBtn} onClick={() => handleSidebarAction(null, 'courses')}>
            <span className={styles.bottomNavIcon}>📚</span>
            <span>Courses</span>
          </button>
          <button className={activeTab === 'certificates' ? styles.bottomNavBtnActive : styles.bottomNavBtn} onClick={() => handleSidebarAction(null, 'certificates')}>
            <span className={styles.bottomNavIcon}>🎓</span>
            <span>Awards</span>
          </button>
          <button className={activeTab === 'profile' ? styles.bottomNavBtnActive : styles.bottomNavBtn} onClick={() => handleSidebarAction(null, 'profile')}>
            <span className={styles.bottomNavIcon}>👤</span>
            <span>Profile</span>
          </button>
        </nav>
      )}
    </main>
  );
}
