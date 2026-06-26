import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ fullName: 'Technical Student' });
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [courses, setCourses] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchDashboardData(parsedUser.email);
    }
  }, [navigate]);

  const fetchDashboardData = async (email) => {
    try {
      setLoading(true);
      const profileRes = await fetch(`/api/users/${encodeURIComponent(email)}`);
      const profileData = await profileRes.json();
      let assigned = [];
      if (profileData.success && profileData.user) {
        setUser(profileData.user);
        assigned = profileData.user.assignedCourses || [];
        setAssignedCourses(assigned);
      }

      const coursesRes = await fetch('/api/courses');
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        const filtered = coursesData.courses.filter(c => assigned.includes(c.title));
        setCourses(filtered);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      )
    },
    {
      name: 'My Courses',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      )
    },
    {
      name: 'Live Classes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
          <polygon points="12 7 17 12 12 17 12 7"></polygon>
        </svg>
      )
    },
    {
      name: 'Assignments / Quiz',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    },
    {
      name: 'Certificates',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      )
    },
    {
      name: 'Profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    }
  ];

  const initialLetter = user.fullName ? user.fullName.trim().charAt(0).toUpperCase() : 'T';

  return (
    <div className="lms-dashboard-wrapper">
      {/* Sidebar navigation */}
      <aside className="lms-sidebar">
        <div className="lms-logo-area">
          <div className="lms-logo-icon">
            <span className="logo-accent-red"></span>
          </div>
          <div className="lms-logo-text">
            <h2>SM GROUPS</h2>
            <p>excellence online</p>
          </div>
        </div>

        <div className="lms-menu-section">
          <span className="lms-menu-title">MAIN MENU</span>
          <ul className="lms-menu-list">
            {menuItems.map(item => (
              <li key={item.name}>
                <button
                  onClick={() => setActiveTab(item.name)}
                  className={`lms-menu-item ${activeTab === item.name ? 'active' : ''}`}
                >
                  <span className="menu-icon-span">{item.icon}</span>
                  <span className="menu-text-span">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="lms-sidebar-footer">
          <button onClick={() => navigate('/login')} className="lms-back-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-icon-svg" style={{ marginRight: '2px' }}>
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Login</span>
          </button>
          <button onClick={handleSignOut} className="lms-signout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logout-icon-svg">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main panel */}
      <main className="lms-main-content">
        {/* Top header bar */}
        <header className="lms-header-bar">
          <div className="lms-header-info">
            <h1>Learning Dashboard</h1>
            <p>Empowering your technical journey in IoT & EV Engineering</p>
          </div>
          <div className="lms-user-profile">
            <div className="lms-user-avatar" title={user.fullName}>
              {initialLetter}
            </div>
          </div>
        </header>

        {/* Learning Statistics Row */}
        <section className="lms-stats-row">
          {/* Card 1 */}
          <div className="lms-stat-card">
            <div className="stat-card-icon-box icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div className="stat-card-content">
              <span className="stat-value">{courses.length}</span>
              <span className="stat-label">ENROLLED COURSES</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="lms-stat-card">
            <div className="stat-card-icon-box icon-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
                <path d="M12 2a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z"></path>
              </svg>
            </div>
            <div className="stat-card-content">
              <span className="stat-value">0</span>
              <span className="stat-label">COMPLETED</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="lms-stat-card">
            <div className="stat-card-icon-box icon-blue-light">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </div>
            <div className="stat-card-content">
              <span className="stat-value">0%</span>
              <span className="stat-label">AVG. PROGRESS</span>
            </div>
          </div>
        </section>

        {/* Tab-driven Dynamic Content */}
        {renderTabContent()}
      </main>
    </div>
  );
}
