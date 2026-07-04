import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : { fullName: 'Technical Student' };
  });
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchDashboardData = async (email) => {
    try {
      const profileRes = await fetch(`/api/users/${encodeURIComponent(email)}`);
      const profileData = await profileRes.json();
      let assigned = [];
      if (profileData.success && profileData.user) {
        setUser(profileData.user);
        assigned = profileData.user.assignedCourses || [];
      }

      const coursesRes = await fetch('/api/courses');
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        const filtered = coursesData.courses.filter((c) => assigned.includes(c.title));
        setCourses(filtered);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    if (!user?.email) {
      navigate('/login');
      return;
    }

    const load = async () => {
      await fetchDashboardData(user.email);
    };

    void load();
  }, [navigate, user?.email]);

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
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="lms-dashboard-content-tab">
            <div className="lms-banner-card">
              <div className="banner-left">
                <div className="banner-icon-box">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <div className="banner-info">
                  <h3>Upcoming Technical Workshop: EV Battery Management Systems</h3>
                  <p>Join us on Saturday at 2:00 PM for an interactive live session with industrial experts.</p>
                </div>
              </div>
              <button className="lms-banner-btn" onClick={() => setActiveTab('Live Classes')}>
                <span>View Live Schedule</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <div className="lms-progress-section">
              <div className="progress-section-header">
                <h3>My Active Courses ({courses.length})</h3>
              </div>

              {courses.length === 0 ? (
                <div className="lms-empty-state-card">
                  <div className="empty-state-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  </div>
                  <h4>No courses assigned yet</h4>
                  <p>You haven't been assigned to any courses. Please contact the administrator to get access.</p>
                </div>
              ) : (
                    <div className="lms-courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                  {courses.map((course) => (
                    <div key={course.id || course._id} className="lms-course-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{course.title}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', flexGrow: 1, lineBreak: 'anywhere' }}>{course.content}</p>
                      <button className="lms-banner-btn" style={{ padding: '8px 16px', fontSize: '13px', alignSelf: 'flex-start' }} onClick={() => { setSelectedCourse(course); setActiveTab('My Courses'); }}>
                        Start Learning
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'My Courses':
        if (selectedCourse) {
          return (
            <div className="lms-course-detail" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="lms-back-btn" style={{ width: 'auto', display: 'inline-flex', padding: '8px 12px' }} onClick={() => setSelectedCourse(null)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  <span>Back to Courses</span>
                </button>
                <span style={{ background: 'rgba(29,78,216,0.06)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>Active Course</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>{selectedCourse.title}</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{selectedCourse.content}</p>

              {/* Course Media sections */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '10px' }}>
                {selectedCourse.video && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Course Video Lecture</h4>
                    <video controls src={selectedCourse.video} style={{ width: '100%', borderRadius: '8px', background: '#000' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>File: {selectedCourse.videoName || 'Lecture Video'}</span>
                  </div>
                )}
                {selectedCourse.ppt && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Course Materials & PPT</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg)', padding: '12px', borderRadius: '8px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{selectedCourse.pptName || 'Presentation Slide'}</p>
                        <a href={selectedCourse.ppt} download className="lms-banner-btn" style={{ padding: '6px 12px', fontSize: '11px', marginTop: '6px', display: 'inline-flex' }}>Download Slides</a>
                      </div>
                    </div>
                  </div>
                )}
                {!selectedCourse.video && !selectedCourse.ppt && (
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '30px', textAlign: 'center', gridColumn: '1 / -1' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No video lectures or downloadable presentation materials are uploaded for this course yet.</p>
                  </div>
                )}
              </div>
            </div>
          );
        }
        return (
          <div className="lms-progress-section">
            <div className="progress-section-header">
              <h3>All Enrolled Courses</h3>
            </div>
            {courses.length === 0 ? (
              <div className="lms-empty-state-card">
                <div className="empty-state-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <h4>No courses assigned yet</h4>
                <p>You haven't been assigned to any courses. Please contact the administrator to get access.</p>
              </div>
            ) : (
              <div className="lms-courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {courses.map((course) => (
                  <div key={course.id || course._id} className="lms-course-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{course.title}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', flexGrow: 1, lineBreak: 'anywhere' }}>{course.content}</p>
                    <button className="lms-banner-btn" style={{ padding: '8px 16px', fontSize: '13px', alignSelf: 'flex-start' }} onClick={() => setSelectedCourse(course)}>
                      Start Learning
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'Live Classes':
        return (
          <div className="lms-empty-state-card">
            <div className="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </div>
            <h4>No Live Classes Scheduled Today</h4>
            <p>You are all caught up! There are no scheduled live sessions for today. Check back later or review materials.</p>
          </div>
        );

      case 'Assignments / Quiz':
        return (
          <div className="lms-empty-state-card">
            <div className="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <h4>No Pending Quizzes or Assignments</h4>
            <p>Great job! You have submitted all assigned materials. Contact your mentor for extra-credit quizzes.</p>
          </div>
        );

      case 'Certificates':
        return (
          <div className="lms-empty-state-card">
            <div className="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h4>No Certificates Earned Yet</h4>
            <p>Complete all modules and assignments of any assigned course to unlock and download your completion certificate.</p>
          </div>
        );

      case 'Profile':
        return (
          <div className="lms-profile-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', borderBottom: '1px solid var(--bg-section)', paddingBottom: '15px' }}>Student Profile Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', fontSize: '14px' }}>
              <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Full Name:</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.fullName || 'Technical Student'}</span>

              <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Email Address:</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.email || 'N/A'}</span>

              <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Phone Number:</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.phone || 'N/A'}</span>

              <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>College:</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.college || 'N/A'}</span>

              <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Department:</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.department || 'N/A'}</span>

              <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Year of Study:</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.year || 'N/A'}</span>

              <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Gender:</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.gender || 'N/A'}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
            <h2>CHEMY LMS</h2>
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

