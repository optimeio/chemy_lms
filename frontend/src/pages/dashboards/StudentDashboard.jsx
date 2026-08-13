import { useOutletContext } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../state/useAuth';
import { apiService } from '../../services/apiService';
import html2canvas from 'html2canvas';
import styles from '../../styles/StudentDashboard.module.css';


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
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', overflowX: 'auto' }}>
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
        <div style={{ position: 'absolute', top: '245px', left: '280px', width: '450px', fontSize: '18px', fontWeight: 'bold' }}>{user.fullName}</div>
        
        <div style={{ position: 'absolute', top: '285px', left: '80px', width: '300px', fontSize: '16px', textAlign: 'center' }}>{user.department}</div>
        <div style={{ position: 'absolute', top: '285px', left: '460px', width: '250px', fontSize: '16px', textAlign: 'center' }}>{user.college}</div>
        
        <div style={{ position: 'absolute', top: '325px', left: '50px', width: '250px', fontSize: '16px', textAlign: 'center' }}>{user.year}</div>
        <div style={{ position: 'absolute', top: '325px', left: '330px', width: '380px', fontSize: '16px', textAlign: 'center', fontWeight: 'bold' }}>{course.title}</div>
        
        <div style={{ position: 'absolute', top: '385px', left: '50px', width: '350px', fontSize: '16px', textAlign: 'center' }}>2025-2026</div>

        <div style={{ position: 'absolute', top: '445px', left: '210px', width: '200px', fontSize: '16px' }}>40 Hours</div>
        <div style={{ position: 'absolute', top: '495px', left: '150px', width: '200px', fontSize: '16px' }}>{currentDate}</div>
      </div>
      
      <button onClick={handleDownload} style={{ padding: '12px 24px', fontSize: '15px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
        Download Certificate
      </button>
    </div>
  );
};

export default function StudentDashboard() {
  const { activeTab } = useOutletContext() || { activeTab: 'dashboard' };
  const { user, setUser } = useAuth();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    college: '',
    department: '',
    year: '',
    profileImage: ''
  });

  const [userAssignedCourses, setUserAssignedCourses] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [activeQuiz, setActiveQuiz] = useState(null); // { type, questions, title }
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileData = await apiService.get(`/users/${encodeURIComponent(user.email)}`);
        if (profileData.success) {
          const allCoursesData = await apiService.get('/courses');
          if (allCoursesData.success) {
             const assigned = allCoursesData.courses.filter(c => 
               c.status !== 'draft' && 
               (profileData.user.assignedCourses || []).includes(String(c._id || c.id || c.title))
             );
             setUserAssignedCourses(assigned);
          }
          setUserProgress(profileData.user.progress || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserData();
  }, [user.email]);

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

  if (activeTab === 'profile') {
    return (
      <div className={styles.dashboardContainer} style={{ padding: '20px' }}>
        <div className={styles.premiumCard} style={{ padding: '30px', maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0 }}>Student Profile Details</h3>
            {!isEditingProfile && (
              <button style={{ padding: '6px 16px', fontSize: '13px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }} onClick={handleEditProfile}>Edit Profile</button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f3f4f6', backgroundImage: `url(${isEditingProfile ? profileForm.profileImage : user.profileImage})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #3b82f6', overflow: 'hidden' }}>
              {!(isEditingProfile ? profileForm.profileImage : user.profileImage) && (
                <span style={{ fontSize: '36px', color: '#6b7280', fontWeight: 'bold' }}>{user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>
          </div>

          {isEditingProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Profile Image</label>
                <input type="file" accept="image/*" onChange={handleProfileImageChange} style={{ fontSize: '14px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#f9fafb' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Full Name</label>
                <input type="text" value={profileForm.fullName} onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))} style={{ fontSize: '14px', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#f9fafb' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>College</label>
                <input type="text" value={profileForm.college} onChange={(e) => setProfileForm(prev => ({ ...prev, college: e.target.value }))} style={{ fontSize: '14px', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#f9fafb' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Department</label>
                <input type="text" value={profileForm.department} onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))} style={{ fontSize: '14px', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#f9fafb' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Year of Study</label>
                <select value={profileForm.year} onChange={(e) => setProfileForm(prev => ({ ...prev, year: e.target.value }))} style={{ fontSize: '14px', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#f9fafb' }}>
                  <option value="">Select Year</option>
                  <option value="I Year">I Year</option>
                  <option value="II Year">II Year</option>
                  <option value="III Year">III Year</option>
                  <option value="IV Year">IV Year</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button style={{ flex: 1, padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleSaveProfile}>Save Changes</button>
                <button style={{ flex: 1, padding: '10px', background: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsEditingProfile(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', fontSize: '14px' }}>
              <span style={{ fontWeight: '600', color: '#6b7280' }}>Full Name:</span>
              <span style={{ fontWeight: '700', color: '#111827' }}>{user.fullName || 'Technical Student'}</span>

              <span style={{ fontWeight: '600', color: '#6b7280' }}>Email Address:</span>
              <span style={{ fontWeight: '700', color: '#111827' }}>{user.email || 'N/A'}</span>

              <span style={{ fontWeight: '600', color: '#6b7280' }}>Phone Number:</span>
              <span style={{ fontWeight: '700', color: '#111827' }}>{user.phone || 'N/A'}</span>

              <span style={{ fontWeight: '600', color: '#6b7280' }}>College:</span>
              <span style={{ fontWeight: '700', color: '#111827' }}>{user.college || 'N/A'}</span>

              <span style={{ fontWeight: '600', color: '#6b7280' }}>Department:</span>
              <span style={{ fontWeight: '700', color: '#111827' }}>{user.department || 'N/A'}</span>

              <span style={{ fontWeight: '600', color: '#6b7280' }}>Year of Study:</span>
              <span style={{ fontWeight: '700', color: '#111827' }}>{user.year || 'N/A'}</span>

              <span style={{ fontWeight: '600', color: '#6b7280' }}>Gender:</span>
              <span style={{ fontWeight: '700', color: '#111827' }}>{user.gender || 'N/A'}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'certificates') {
    const completedCourses = userAssignedCourses.filter(c => {
      const p = userProgress.find(prog => String(prog.courseId) === String(c._id || c.id || c.title));
      return p && p.finalQuizCompleted;
    });

    if (completedCourses.length === 0) {
      return (
        <div className={styles.dashboardContainer} style={{ padding: '20px' }}>
          <div className={styles.premiumCard} style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎓</div>
            <h4 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>No Certificates Earned Yet</h4>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Complete all modules and assignments of any assigned course to unlock and download your completion certificate.</p>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.dashboardContainer} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>My Certificates</h3>
          <p style={{ color: '#6b7280' }}>Note: For the certificate to render correctly, ensure `certificate-template.png` is placed in the `frontend/public` directory.</p>
        </div>
        {completedCourses.map(course => (
          <CertificateCard key={course._id || course.id || course.title} user={user} course={course} />
        ))}
      </div>
    );
  }

  const handleVideoEnded = async (videoUrl) => {
    if (!selectedCourse || !user) return;
    try {
      await apiService.post(`/users/${encodeURIComponent(user.email)}/progress`, {
        courseId: selectedCourse._id || selectedCourse.id,
        videoUrl: videoUrl
      });
      setUserProgress(prev => {
        const newProgress = [...prev];
        let pIndex = newProgress.findIndex(p => String(p.courseId) === String(selectedCourse._id || selectedCourse.id));
        if (pIndex === -1) {
          newProgress.push({ courseId: selectedCourse._id || selectedCourse.id, watchedVideos: [videoUrl], midCourseQuizCompleted: false, finalQuizCompleted: false });
        } else {
          if (!newProgress[pIndex].watchedVideos.includes(videoUrl)) {
            newProgress[pIndex].watchedVideos = [...newProgress[pIndex].watchedVideos, videoUrl];
          }
        }
        return newProgress;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const submitQuiz = async () => {
    if (!activeQuiz || !selectedCourse) return;
    const questions = activeQuiz.questions;
    let score = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctOptionIndex) {
        score++;
      }
    });
    
    const isMid = activeQuiz.type === 'mid';
    const isFinal = activeQuiz.type === 'final';
    
    try {
      await apiService.post(`/users/${encodeURIComponent(user.email)}/progress`, {
        courseId: selectedCourse._id || selectedCourse.id,
        midCourseQuizCompleted: isMid ? true : undefined,
        finalQuizCompleted: isFinal ? true : undefined
      });
      
      setUserProgress(prev => {
        const newProgress = [...prev];
        let pIndex = newProgress.findIndex(p => String(p.courseId) === String(selectedCourse._id || selectedCourse.id));
        if (pIndex !== -1) {
          if (isMid) newProgress[pIndex].midCourseQuizCompleted = true;
          if (isFinal) newProgress[pIndex].finalQuizCompleted = true;
        }
        return newProgress;
      });
      
      setQuizScore({ score, total: questions.length });
    } catch (e) {
      console.error(e);
    }
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setQuizAnswers({});
    setQuizScore(null);
  };

  if (activeTab !== 'dashboard') {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.premiumCard} style={{ marginTop: '20px', padding: '60px', textAlign: 'center' }}>
          <h2 className={styles.sectionTitle}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <p style={{ color: '#6B7280', fontSize: '16px' }}>The {activeTab} view will be available in a future update.</p>
        </div>
      </div>
    );
  }

  const renderCourseViewer = () => {
    if (!selectedCourse) return null;

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const serverBaseUrl = API_BASE_URL.replace('/api', '');

    const getFullUrl = (url) => {
      if (!url) return '';
      if (url.startsWith('http')) return url;
      return `${serverBaseUrl}${url}`;
    };

    const courseProg = userProgress.find(p => String(p.courseId) === String(selectedCourse._id || selectedCourse.id)) || { watchedVideos: [], midCourseQuizCompleted: false, finalQuizCompleted: false };
    const watchedSet = new Set(courseProg.watchedVideos);
    
    const totalVideos = selectedCourse.videos ? selectedCourse.videos.length : 0;
    const midPoint = Math.ceil(totalVideos / 2);
    
    const midQuizUnlocked = watchedSet.size >= midPoint;
    const finalQuizUnlocked = watchedSet.size >= totalVideos && courseProg.midCourseQuizCompleted;

    if (activeQuiz) {
      return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ background: '#1f2937', width: '100%', maxWidth: '800px', maxHeight: '90vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: '#fff', margin: 0 }}>{activeQuiz.title}</h2>
              <button onClick={closeQuiz} style={{ background: '#374151', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
              {quizScore !== null ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>{quizScore.score === quizScore.total ? '🏆' : '👏'}</div>
                  <h3 style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>Quiz Completed!</h3>
                  <p style={{ color: '#9ca3af', fontSize: '18px' }}>You scored {quizScore.score} out of {quizScore.total}</p>
                  <button onClick={closeQuiz} style={{ marginTop: '30px', padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>Back to Course</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {activeQuiz.questions.map((q, qIdx) => (
                    <div key={qIdx} style={{ background: '#111827', padding: '20px', borderRadius: '12px' }}>
                      <h4 style={{ color: '#f3f4f6', fontSize: '18px', marginBottom: '15px' }}>{qIdx + 1}. {q.question}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {q.options.map((opt, oIdx) => (
                          <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#d1d5db', cursor: 'pointer', padding: '10px', background: quizAnswers[qIdx] === oIdx ? '#374151' : 'transparent', borderRadius: '8px', border: '1px solid #374151' }}>
                            <input type="radio" name={`q_${qIdx}`} checked={quizAnswers[qIdx] === oIdx} onChange={() => setQuizAnswers(prev => ({...prev, [qIdx]: oIdx}))} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < activeQuiz.questions.length} style={{ padding: '16px', background: Object.keys(quizAnswers).length < activeQuiz.questions.length ? '#4b5563' : '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: Object.keys(quizAnswers).length < activeQuiz.questions.length ? 'not-allowed' : 'pointer', marginTop: '20px' }}>Submit Answers</button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '40px'
      }}>
        <div style={{
          background: '#111827', width: '100%', maxWidth: '1200px', height: '90vh',
          borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Header */}
          <div style={{ padding: '20px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '24px' }}>{selectedCourse.title}</h2>
            <button 
              onClick={() => setSelectedCourse(null)}
              style={{ background: '#374151', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}
            >
              ✕
            </button>
          </div>
          
          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '30px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* Videos */}
            {selectedCourse.videos && selectedCourse.videos.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ color: '#9ca3af', margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Course Videos</h3>
                  <span style={{ color: '#3b82f6', fontSize: '14px', fontWeight: 'bold' }}>{watchedSet.size} / {totalVideos} Watched</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                  {selectedCourse.videos.map((video, idx) => {
                    const isWatched = watchedSet.has(video.url);
                    return (
                      <div key={idx} style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', border: isWatched ? '2px solid #10b981' : '2px solid transparent' }}>
                        <video 
                          controls 
                          src={getFullUrl(video.url)}
                          controlsList="nodownload"
                          onEnded={() => handleVideoEnded(video.url)}
                          style={{ width: '100%', height: '200px', objectFit: 'cover', background: '#000' }}
                        />
                        <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ color: '#f3f4f6', margin: 0, fontSize: '16px' }}>{video.name || `Video ${idx + 1}`}</h4>
                          {isWatched && <span style={{ color: '#10b981', fontSize: '18px' }}>✅</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PPTs */}
            {selectedCourse.ppts && selectedCourse.ppts.length > 0 && (
              <div>
                <h3 style={{ color: '#9ca3af', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Presentations & Resources</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedCourse.ppts.map((ppt, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1f2937', padding: '15px 20px', borderRadius: '8px' }}>
                      <span style={{ color: '#f3f4f6', fontWeight: '500' }}>{ppt.name || `Presentation ${idx + 1}`}</span>
                      <a 
                        href={getFullUrl(ppt.url)} 
                        target="_blank" 
                        rel="noreferrer"
                        download
                        style={{ background: '#3b82f6', color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}
                      >
                        Download PPT
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quizzes */}
            <div>
              <h3 style={{ color: '#9ca3af', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Assessments</h3>
              <div style={{ display: 'flex', gap: '20px' }}>
                {selectedCourse.midCourseQuiz && selectedCourse.midCourseQuiz.length > 0 && (
                  <button 
                    disabled={!midQuizUnlocked}
                    onClick={() => setActiveQuiz({ type: 'mid', questions: selectedCourse.midCourseQuiz, title: 'Mid-Course Quiz' })}
                    style={{ flex: 1, padding: '20px', background: midQuizUnlocked ? '#374151' : '#1f2937', color: midQuizUnlocked ? '#f3f4f6' : '#6b7280', border: midQuizUnlocked ? '1px solid #4b5563' : '1px dashed #374151', borderRadius: '12px', cursor: midQuizUnlocked ? 'pointer' : 'not-allowed', textAlign: 'left', position: 'relative', overflow: 'hidden' }}
                  >
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                      Mid-Course Quiz 
                      {courseProg.midCourseQuizCompleted ? <span style={{ color: '#10b981' }}>✅ Passed</span> : (!midQuizUnlocked && <span>🔒 Locked</span>)}
                    </div>
                    <div style={{ fontSize: '14px', marginTop: '5px' }}>
                      {!midQuizUnlocked ? `Watch ${midPoint} videos to unlock.` : `${selectedCourse.midCourseQuiz.length} Questions`}
                    </div>
                  </button>
                )}
                {selectedCourse.finalAssessmentQuiz && selectedCourse.finalAssessmentQuiz.length > 0 && (
                  <button 
                    disabled={!finalQuizUnlocked}
                    onClick={() => setActiveQuiz({ type: 'final', questions: selectedCourse.finalAssessmentQuiz, title: 'Final Assessment' })}
                    style={{ flex: 1, padding: '20px', background: finalQuizUnlocked ? '#374151' : '#1f2937', color: finalQuizUnlocked ? '#f3f4f6' : '#6b7280', border: finalQuizUnlocked ? '1px solid #4b5563' : '1px dashed #374151', borderRadius: '12px', cursor: finalQuizUnlocked ? 'pointer' : 'not-allowed', textAlign: 'left', position: 'relative', overflow: 'hidden' }}
                  >
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                      Final Assessment
                      {courseProg.finalQuizCompleted ? <span style={{ color: '#10b981' }}>✅ Passed</span> : (!finalQuizUnlocked && <span>🔒 Locked</span>)}
                    </div>
                    <div style={{ fontSize: '14px', marginTop: '5px' }}>
                      {!finalQuizUnlocked ? `Watch all videos and pass Mid-Course Quiz.` : `${selectedCourse.finalAssessmentQuiz.length} Questions`}
                    </div>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      {renderCourseViewer()}
      
      {/* Hero Section */}
      <section className={styles.heroCard}>
        <div className={styles.heroBgDeco1}></div>
        <div className={styles.heroBgDeco2}></div>
        
        <div className={styles.heroContent}>
          <p className={styles.heroSubtitle}>Continue Your Learning</p>
          <h1 className={styles.heroTitle}>Master IoT, Embedded Systems and EV Engineering</h1>
          <p className={styles.heroDescription}>Dive back into your hands-on projects and continue your journey towards engineering excellence.</p>
          <button className={styles.heroButton}>
            Resume Learning <span>▶</span>
          </button>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.progressRingContainer}>
            <svg className={styles.progressRingCircle} viewBox="0 0 140 140">
              <circle className={styles.progressRingBg} cx="70" cy="70" r="64"></circle>
              <circle className={styles.progressRingProgress} cx="70" cy="70" r="64"></circle>
            </svg>
            <div className={styles.progressRingText}>
              <span className={styles.progressPercent}>72%</span>
              <span className={styles.progressLabel}>Complete</span>
            </div>
          </div>
          <img src="https://illustrations.popsy.co/blue/student-going-to-school.svg" alt="Education Illustration" className={styles.heroIllustration} />
        </div>
      </section>

      {/* Statistics */}
      <section className={styles.statsGrid}>
        <div className={`${styles.premiumCard} ${styles.statCard}`}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.iconBlue}`}>📚</div>
          </div>
          <div className={styles.statValue}>03</div>
          <div className={styles.statLabel}>Active Courses</div>
        </div>
        <div className={`${styles.premiumCard} ${styles.statCard}`}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.iconOrange}`}>🏆</div>
          </div>
          <div className={styles.statValue}>08</div>
          <div className={styles.statLabel}>Certificates</div>
        </div>
        <div className={`${styles.premiumCard} ${styles.statCard}`}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.iconIndigo}`}>⏳</div>
          </div>
          <div className={styles.statValue}>12h</div>
          <div className={styles.statLabel}>Learning Hours</div>
        </div>
        <div className={`${styles.premiumCard} ${styles.statCard}`}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.iconGreen}`}>🔥</div>
          </div>
          <div className={styles.statValue}>85%</div>
          <div className={styles.statLabel}>Overall Progress</div>
        </div>
      </section>

      {/* My Courses */}
      <section>
        <h2 className={styles.sectionTitle}>Continue Learning</h2>
        <div className={styles.coursesGrid}>
          {userAssignedCourses.length === 0 ? (
            <p style={{ color: '#6b7280' }}>You don't have any assigned courses yet.</p>
          ) : (
            userAssignedCourses.map(course => {
              const progressObj = userProgress.find(p => String(p.courseId) === String(course._id || course.id));
              const progressPercent = progressObj ? 
                (progressObj.completedVideos?.length || 0) * 10 : 0; // Simplified progress
              
              const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
              const serverBaseUrl = API_BASE_URL.replace('/api', '');
              const getFullUrl = (url) => url ? (url.startsWith('http') ? url : `${serverBaseUrl}${url}`) : '';

              return (
                <div key={course._id || course.id || course.title} className={`${styles.premiumCard} ${styles.courseCard}`}>
                  <img src={getFullUrl(course.image) || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'} alt={course.title} className={styles.courseImage} />
                  <div className={styles.courseHeader}>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <span className={styles.courseRating}>⭐ {course.rating || '4.8'}</span>
                  </div>
                  <p className={styles.courseMeta}>{course.trainerName || course.instructor || 'Instructor'}</p>
                  
                  <div className={styles.courseProgressContainer}>
                    <div className={styles.courseProgressHeader}>
                      <span className={styles.courseProgressPercent}>{progressPercent}%</span>
                      <span className={styles.courseProgressText}>Completed</span>
                    </div>
                    <div className={styles.courseProgressBar}>
                      <div className={styles.courseProgressFill} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>

                  <div className={styles.courseFooter}>
                    <button className={styles.resumeBtn} onClick={() => setSelectedCourse(course)}>Resume ▶</button>
                    <button className={styles.bookmarkBtn}>🔖</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Lower Grid */}
      <section className={styles.lowerGrid}>
        <div className={styles.colSpan2}>
          <div className={styles.premiumCard}>
            <h2 className={styles.sectionTitle}>Upcoming Live Class</h2>
            <div className={styles.liveClassItem}>
              <div className={styles.calendarDate}>
                <span className={styles.calMonth}>Today</span>
                <span className={styles.calDay}>31</span>
              </div>
              <div className={styles.liveClassInfo}>
                <h4 className={styles.liveTitle}>IoT Architecture & Sensor Integration</h4>
                <div className={styles.liveMeta}>
                  <span>🕒 2:00 PM - 4:00 PM</span>
                  <span>👨‍🏫 Dr. Alan Smith</span>
                </div>
              </div>
              <button className={styles.joinBtn}>Join Live</button>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <h2 className={styles.sectionTitle}>Assignments</h2>
            <div className={styles.assignmentList}>
              <div className={styles.assignmentItem}>
                <div className={styles.assignInfo}>
                  <div className={styles.assignIcon}>📝</div>
                  <div>
                    <h4 className={styles.assignTitle}>Embedded Systems Quiz</h4>
                    <span className={styles.assignDate}>Due: Tomorrow, 11:59 PM</span>
                  </div>
                </div>
                <span className={`${styles.assignStatus} ${styles.statusPending}`}>Pending</span>
              </div>
              <div className={styles.assignmentItem}>
                <div className={styles.assignInfo}>
                  <div className={styles.assignIcon}>✅</div>
                  <div>
                    <h4 className={styles.assignTitle}>EV Battery Management Report</h4>
                    <span className={styles.assignDate}>Submitted on: Jul 28</span>
                  </div>
                </div>
                <span className={`${styles.assignStatus} ${styles.statusSubmitted}`}>Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className={styles.premiumCard}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}>✅</div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>Assignment Submitted</div>
                  <div className={styles.timelineTime}>EV Battery Management</div>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}>🏆</div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>Quiz Completed</div>
                  <div className={styles.timelineTime}>Scored 95% in IoT Basics</div>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}>📜</div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>Certificate Earned</div>
                  <div className={styles.timelineTime}>Python Programming</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footerQuote}>
        "Consistency beats intensity."
      </footer>
    </div>
  );
}
