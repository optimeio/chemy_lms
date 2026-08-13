import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import { apiService } from '../services/apiService';
import html2canvas from 'html2canvas';

const CertificateCard = ({ user, course }) => {
  const certificateRef = useRef(null);

  const handleDownload = async () => {
    if (certificateRef.current) {
      try {
        const canvas = await html2canvas(certificateRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${user.fullName}_${course.title}_Certificate.png`;
        link.click();
      } catch (err) {
        console.error('Error downloading certificate', err);
      }
    }
  };

  const currentDate = new Date().toLocaleDateString('en-GB');

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', overflowX: 'auto' }}>
      <div 
        ref={certificateRef}
        style={{ 
          position: 'relative', 
          width: '800px', 
          minWidth: '800px',
          height: '600px', 
          backgroundImage: 'url(/certificate-template.png)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          fontFamily: 'serif',
          color: '#000',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* These positions are estimates based on the provided template and may need adjustment */}
        <div style={{ position: 'absolute', top: '245px', left: '280px', width: '450px', fontSize: '18px', fontWeight: 'bold' }}>{user.fullName}</div>
        
        <div style={{ position: 'absolute', top: '285px', left: '80px', width: '300px', fontSize: '16px', textAlign: 'center' }}>{user.department}</div>
        <div style={{ position: 'absolute', top: '285px', left: '460px', width: '250px', fontSize: '16px', textAlign: 'center' }}>{user.college}</div>
        
        <div style={{ position: 'absolute', top: '325px', left: '50px', width: '250px', fontSize: '16px', textAlign: 'center' }}>{user.year}</div>
        <div style={{ position: 'absolute', top: '325px', left: '330px', width: '380px', fontSize: '16px', textAlign: 'center', fontWeight: 'bold' }}>{course.title}</div>
        
        <div style={{ position: 'absolute', top: '385px', left: '50px', width: '350px', fontSize: '16px', textAlign: 'center' }}>2025-2026</div>

        <div style={{ position: 'absolute', top: '445px', left: '210px', width: '200px', fontSize: '16px' }}>40 Hours</div>
        <div style={{ position: 'absolute', top: '495px', left: '150px', width: '200px', fontSize: '16px' }}>{currentDate}</div>
      </div>
      
      <button className="lms-banner-btn" onClick={handleDownload} style={{ padding: '12px 24px', fontSize: '15px' }}>
        Download Certificate
      </button>
    </div>
  );
};


export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : { fullName: 'Technical Student' };
  });
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null); // 'mid' or 'final'
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    college: '',
    department: '',
    year: '',
    profileImage: ''
  });

  const fetchDashboardData = async (email) => {
    try {
      const profileData = await apiService.get(`/users/${encodeURIComponent(email)}`);
      let assigned = [];
      if (profileData.success && profileData.user) {
        setUser(profileData.user);
        assigned = profileData.user.assignedCourses || [];
      }

      const coursesData = await apiService.get('/courses');
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

  const handleVideoEnded = async (courseId, videoUrl) => {
    try {
      const res = await apiService.post(`/users/${encodeURIComponent(user.email)}/progress`, { courseId, videoUrl });
      if (res.success) {
        setUser(prev => ({ ...prev, progress: res.progress }));
      }
    } catch (err) {
      console.error('Error updating video progress:', err);
    }
  };

  const handleQuizSubmit = async (courseId, quizType, quizData) => {
    let score = 0;
    quizData.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctOptionIndex) score++;
    });
    
    const passed = score >= Math.ceil(quizData.length / 2);
    setQuizResult({ score, total: quizData.length, passed });
    
    if (passed) {
      try {
        const payload = { courseId };
        if (quizType === 'mid') payload.midCourseQuizCompleted = true;
        if (quizType === 'final') payload.finalQuizCompleted = true;
        
        const res = await apiService.post(`/users/${encodeURIComponent(user.email)}/progress`, payload);
        if (res.success) {
          setUser(prev => ({ ...prev, progress: res.progress }));
        }
      } catch (err) {
        console.error('Error updating quiz progress:', err);
      }
    }
  };

  const handleEditProfile = () => {
    setProfileForm({
      fullName: user.fullName || '',
      college: user.college || '',
      department: user.department || '',
      year: user.year || '',
      profileImage: user.profileImage || ''
    });
    setIsEditingProfile(true);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await apiService.put(`/users/${encodeURIComponent(user.email)}/profile`, profileForm);
      if (res.success) {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
        setIsEditingProfile(false);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile details.');
    }
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
          const courseId = selectedCourse._id || selectedCourse.id;
          const courseProgress = (user.progress || []).find(p => String(p.courseId) === String(courseId)) || { watchedVideos: [], midCourseQuizCompleted: false, finalQuizCompleted: false };
          const watchedCount = courseProgress.watchedVideos.length;
          
          const showMidQuiz = watchedCount >= 5 && !courseProgress.midCourseQuizCompleted && selectedCourse.midCourseQuiz?.length > 0;
          const showFinalQuiz = watchedCount >= 9 && courseProgress.midCourseQuizCompleted && !courseProgress.finalQuizCompleted && selectedCourse.finalAssessmentQuiz?.length > 0;

          const videos = selectedCourse.videos?.length > 0 ? selectedCourse.videos : (selectedCourse.video ? [{ url: selectedCourse.video, name: selectedCourse.videoName || 'Lecture Video' }] : []);
          const ppts = selectedCourse.ppts?.length > 0 ? selectedCourse.ppts : (selectedCourse.ppt ? [{ url: selectedCourse.ppt, name: selectedCourse.pptName || 'Presentation Slide' }] : []);

          return (
            <div className="lms-course-detail" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="lms-back-btn" style={{ width: 'auto', display: 'inline-flex', padding: '8px 12px' }} onClick={() => { setSelectedCourse(null); setActiveQuiz(null); setQuizResult(null); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  <span>Back to Courses</span>
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ background: 'rgba(29,78,216,0.06)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>Active Course</span>
                  <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{watchedCount} / {videos.length} Videos Watched</span>
                </div>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>{selectedCourse.title}</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{selectedCourse.content}</p>

              {activeQuiz ? (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '30px', background: 'var(--bg-card)' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>{activeQuiz === 'mid' ? 'Mid-Course Quiz' : 'Final Assessment Quiz'}</h3>
                  {quizResult ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <h4 style={{ color: quizResult.passed ? '#10b981' : '#ef4444', fontSize: '24px', marginBottom: '10px' }}>
                        {quizResult.passed ? 'Passed!' : 'Failed'}
                      </h4>
                      <p>You scored {quizResult.score} out of {quizResult.total}.</p>
                      {quizResult.passed ? (
                        <button className="lms-banner-btn" style={{ marginTop: '20px' }} onClick={() => { setActiveQuiz(null); setQuizResult(null); setQuizAnswers({}); }}>Continue Course</button>
                      ) : (
                        <button className="lms-banner-btn" style={{ marginTop: '20px' }} onClick={() => { setQuizResult(null); setQuizAnswers({}); }}>Retry Quiz</button>
                      )}
                    </div>
                  ) : (
                    <div>
                      {(activeQuiz === 'mid' ? selectedCourse.midCourseQuiz : selectedCourse.finalAssessmentQuiz).map((q, idx) => (
                        <div key={idx} style={{ marginBottom: '20px', padding: '15px', background: 'var(--bg)', borderRadius: '8px' }}>
                          <p style={{ fontWeight: '600', marginBottom: '15px' }}>{idx + 1}. {q.question}</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {q.options.map((opt, optIdx) => (
                              <label key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input type="radio" name={`quiz-${idx}`} checked={quizAnswers[idx] === optIdx} onChange={() => setQuizAnswers(prev => ({ ...prev, [idx]: optIdx }))} />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button className="lms-banner-btn" onClick={() => handleQuizSubmit(courseId, activeQuiz, activeQuiz === 'mid' ? selectedCourse.midCourseQuiz : selectedCourse.finalAssessmentQuiz)}>
                        Submit Quiz
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {(showMidQuiz || showFinalQuiz) && (
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontWeight: '700', color: 'var(--primary-dark)', margin: '0 0 5px 0' }}>{showMidQuiz ? 'Mid-Course Quiz Unlocked!' : 'Final Assessment Quiz Unlocked!'}</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>You have watched enough videos to take the next quiz.</p>
                      </div>
                      <button className="lms-banner-btn" onClick={() => { setActiveQuiz(showMidQuiz ? 'mid' : 'final'); setQuizAnswers({}); setQuizResult(null); }}>
                        Take Quiz Now
                      </button>
                    </div>
                  )}

                  {/* Course Media sections */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                    {videos.length > 0 && (
                      <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h4 style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Course Video Lectures</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                          {videos.map((vid, idx) => {
                            const isWatched = courseProgress.watchedVideos.includes(vid.url);
                            const isLocked = !isWatched && idx > 0 && !courseProgress.watchedVideos.includes(videos[idx - 1].url);
                            return (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: isLocked ? 0.6 : 1, position: 'relative' }}>
                                <video 
                                  controls={!isLocked} 
                                  src={vid.url} 
                                  style={{ width: '100%', borderRadius: '8px', background: '#000', pointerEvents: isLocked ? 'none' : 'auto' }} 
                                  onEnded={() => handleVideoEnded(courseId, vid.url)}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{vid.name || `Lecture Video ${idx + 1}`}</span>
                                  {isWatched && <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '10px' }}>Watched</span>}
                                  {isLocked && <span style={{ fontSize: '11px', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '10px' }}>Locked</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {ppts.length > 0 && (
                      <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Course Materials & PPTs</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                          {ppts.map((p, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg)', padding: '12px', borderRadius: '8px' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                              <div style={{ flexGrow: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{p.name || `Presentation Slide ${idx + 1}`}</p>
                                <a href={p.url} download className="lms-banner-btn" style={{ padding: '6px 12px', fontSize: '11px', marginTop: '6px', display: 'inline-flex' }}>Download</a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {videos.length === 0 && ppts.length === 0 && (
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>No video lectures or downloadable presentation materials are uploaded for this course yet.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
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

      case 'Certificates': {
        const completedCourses = courses.filter(c => {
          const p = (user.progress || []).find(prog => String(prog.courseId) === String(c._id || c.id));
          return p && p.finalQuizCompleted;
        });

        if (completedCourses.length === 0) {
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
        }

        return (
          <div className="lms-certificates-section" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div className="progress-section-header">
              <h3>My Certificates</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Note: For the certificate to render correctly, ensure `certificate-template.png` is placed in the `frontend/public` directory.</p>
            {completedCourses.map(course => (
              <CertificateCard key={course._id || course.id} user={user} course={course} />
            ))}
          </div>
        );
      }

      case 'Profile':
        return (
          <div className="lms-profile-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bg-section)', paddingBottom: '15px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Student Profile Details</h3>
              {!isEditingProfile && (
                <button className="lms-banner-btn" style={{ padding: '6px 16px', fontSize: '13px' }} onClick={handleEditProfile}>Edit Profile</button>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--bg-section)', backgroundImage: `url(${isEditingProfile ? profileForm.profileImage : user.profileImage})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary)', overflow: 'hidden' }}>
                {!(isEditingProfile ? profileForm.profileImage : user.profileImage) && (
                  <span style={{ fontSize: '36px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
            </div>

            {isEditingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Profile Image</label>
                  <input type="file" accept="image/*" onChange={handleProfileImageChange} style={{ fontSize: '14px', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input type="text" value={profileForm.fullName} onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))} style={{ fontSize: '14px', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>College</label>
                  <input type="text" value={profileForm.college} onChange={(e) => setProfileForm(prev => ({ ...prev, college: e.target.value }))} style={{ fontSize: '14px', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Department</label>
                  <input type="text" value={profileForm.department} onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))} style={{ fontSize: '14px', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Year of Study</label>
                  <select value={profileForm.year} onChange={(e) => setProfileForm(prev => ({ ...prev, year: e.target.value }))} style={{ fontSize: '14px', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg)' }}>
                    <option value="">Select Year</option>
                    <option value="I Year">I Year</option>
                    <option value="II Year">II Year</option>
                    <option value="III Year">III Year</option>
                    <option value="IV Year">IV Year</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="lms-banner-btn" style={{ flex: 1, padding: '10px' }} onClick={handleSaveProfile}>Save Changes</button>
                  <button className="lms-banner-btn" style={{ flex: 1, padding: '10px', background: 'var(--bg-section)', color: 'var(--text-primary)' }} onClick={() => setIsEditingProfile(false)}>Cancel</button>
                </div>
              </div>
            ) : (
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
            )}
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

