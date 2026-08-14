import { useOutletContext, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../state/useAuth';
import { apiService } from '../../services/apiService';
import html2canvas from 'html2canvas';
import { midCourseQuizTemplate, finalAssessmentQuizTemplate } from '../../data/iotQuizTemplate';
import styles from '../../styles/StudentDashboard.module.css';


const CertificateCard = ({ user, course }) => {
  const certificateRef = useRef(null);

  const handleDownload = async () => {
    if (certificateRef.current) {
      try {
        const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${user.fullName}_${course.title}_Certificate.png`;
        link.click();
        console.log('Certificate downloaded:', link.download);
        
        // Save certificate record to backend
        try {
          await apiService.post('/certificates/save', {
            userEmail: user.email,
            userName: user.fullName,
            courseId: course._id || course.id,
            courseTitle: course.title
          });
          console.log('Certificate record saved to backend');
        } catch (apiErr) {
          console.warn('Failed to save certificate record:', apiErr);
        }
      } catch (err) {
        console.error('Error downloading certificate', err);
      }
    }
  };

  const currentDate = new Date().toLocaleDateString('en-GB');
  const yearValue = user?.year || '2026-2027';
  const studentName = user?.fullName || 'Tharaneesh K.P.';
  const departmentName = user?.department || 'CSE';
  const institutionName = user?.college || 'Sona College of Technology';
  const courseName = course?.title || 'PCB DESIGN';
  const trainingDuration = course?.duration || '00 months';
  const issueDate = currentDate || '13/08/2026';

  const certificateFieldStyle = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#111111',
    fontWeight: 700,
    fontFamily: 'serif',
    letterSpacing: '0.01em',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    pointerEvents: 'none'
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', overflowX: 'auto' }}>
      <div
        ref={certificateRef}
        style={{
          position: 'relative',
          width: '100%',
          minWidth: '800px',
          maxWidth: '1050px',
          aspectRatio: '1458 / 1024',
          background: '#fff',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <img
          src="/certificate.png"
          alt="Certificate"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        />

        <div style={{ ...certificateFieldStyle, left: '34.7%', top: '31.3%', width: '31.5%', height: '4.5%', fontSize: '22px' }}>
          {studentName}
        </div>

        <div style={{ ...certificateFieldStyle, left: '18.2%', top: '39.2%', width: '20.9%', height: '4.2%', fontSize: '17px' }}>
          {institutionName}
        </div>

        <div style={{ ...certificateFieldStyle, left: '51.3%', top: '39.2%', width: '16.9%', height: '4.2%', fontSize: '17px' }}>
          {departmentName}
        </div>

        <div style={{ ...certificateFieldStyle, left: '23.4%', top: '49.3%', width: '53.2%', height: '4.8%', fontSize: '19px' }}>
          {courseName}
        </div>

        <div style={{ ...certificateFieldStyle, left: '66.5%', top: '60.4%', width: '13.5%', height: '4.2%', fontSize: '17px' }}>
          {yearValue}
        </div>

        <div style={{ ...certificateFieldStyle, left: '35.1%', bottom: '17.4%', width: '18.4%', height: '3.6%', fontSize: '17px' }}>
          {trainingDuration}
        </div>

        <div style={{ ...certificateFieldStyle, right: '14.5%', bottom: '17.4%', width: '17.4%', height: '3.6%', fontSize: '17px' }}>
          {issueDate}
        </div>
      </div>

      <button onClick={handleDownload} style={{ padding: '12px 24px', fontSize: '15px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
        Download Certificate
      </button>
    </div>
  );
};

export default function StudentDashboard() {
  const { activeTab } = useOutletContext() || { activeTab: 'dashboard' };
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    college: '',
    department: '',
    year: '',
    profileImage: '' // preview URL only
  });
  const [profileImageFile, setProfileImageFile] = useState(null); // actual File object for upload

  const [userAssignedCourses, setUserAssignedCourses] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [activeQuiz, setActiveQuiz] = useState(null); // { type, questions, title }
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileData = await apiService.get(`/users/${encodeURIComponent(user.email)}`);
        if (profileData.success) {
          const allCoursesData = await apiService.get('/courses');
          if (allCoursesData.success) {
             const assigned = allCoursesData.courses.filter(c => 
               c.status !== 'draft' && 
               (profileData.user.assignedCourses || []).some(ac => ac === String(c._id) || ac === String(c.id) || ac === c.title)
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
    setProfileImageFile(null);
    setIsEditingProfile(true);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      // Show local preview immediately
      const previewUrl = URL.createObjectURL(file);
      setProfileForm(prev => ({ ...prev, profileImage: previewUrl }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('fullName', profileForm.fullName);
      formData.append('college', profileForm.college);
      formData.append('department', profileForm.department);
      formData.append('year', profileForm.year);
      // Append the file if a new one was selected
      if (profileImageFile) {
        formData.append('profileImageFile', profileImageFile);
      } else if (profileForm.profileImage && profileForm.profileImage.startsWith('/uploads/')) {
        // Keep existing upload path
        formData.append('profileImage', profileForm.profileImage);
      }

      const res = await apiService.put(`/users/${encodeURIComponent(user.email)}/profile`, formData);
      if (res.success) {
        // Build the base URL to resolve /uploads/ paths
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://chemy-lms.onrender.com/api';
        const serverBaseUrl = API_BASE_URL.replace('/api', '');
        const resolvedImage = res.user.profileImage
          ? (res.user.profileImage.startsWith('http') ? res.user.profileImage : `${serverBaseUrl}${res.user.profileImage}`)
          : '';

        // Merge new profile fields into existing user state (preserve role, dashboard, etc.)
        const updatedUser = {
          ...user,
          fullName: res.user.fullName || user.fullName,
          college: res.user.college || user.college,
          department: res.user.department || user.department,
          year: res.user.year || user.year,
          profileImage: resolvedImage,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setProfileImageFile(null);
        setIsEditingProfile(false);
      } else {
        alert(res.message || 'Failed to save profile. Please try again.');
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
            {(() => {
              const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://chemy-lms.onrender.com/api';
              const serverBaseUrl = API_BASE_URL.replace('/api', '');
              const rawImg = isEditingProfile ? profileForm.profileImage : user.profileImage;
              const resolvedImg = rawImg
                ? (rawImg.startsWith('http') || rawImg.startsWith('blob:') || rawImg.startsWith('data:')
                    ? rawImg
                    : `${serverBaseUrl}${rawImg}`)
                : '';
              return (
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #3b82f6', overflow: 'hidden', flexShrink: 0 }}>
                  {resolvedImg ? (
                    <img src={resolvedImg} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '36px', color: '#6b7280', fontWeight: 'bold' }}>{user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                </div>
              );
            })()}
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
      const totalVids = (c.videos && c.videos.length > 0) ? c.videos.length : 12;
      const watchedAll = (p?.watchedVideos?.length || 0) >= Math.min(12, totalVids);
      return p && p.midCourseQuizCompleted && p.finalQuizCompleted && watchedAll;
    });

    if (completedCourses.length === 0) {
      return (
        <div className={styles.dashboardContainer} style={{ padding: '20px' }}>
          <div className={styles.premiumCard} style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎓</div>
            <h4 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>No Certificates Earned Yet</h4>
            <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '600px', margin: '0 auto 20px auto' }}>
              To automatically unlock your certificate, you must watch all <strong>12 course videos</strong>, pass the <strong>Mid-Course Quiz</strong> (after Video 5), and pass the <strong>Final Assessment Quiz</strong> (after Video 12).
            </p>
            <div style={{ display: 'inline-flex', gap: '16px', background: '#f8fafc', padding: '12px 24px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#475569' }}>
              <span>1️⃣ Watch Videos 1–5</span>
              <span>➡️</span>
              <span>2️⃣ Mid Quiz</span>
              <span>➡️</span>
              <span>3️⃣ Watch Videos 6–12</span>
              <span>➡️</span>
              <span>4️⃣ Final Quiz</span>
              <span>➡️</span>
              <span>5️⃣ 🎓 Certificate</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.dashboardContainer} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '6px' }}>🏆 My Earned Certificates</h3>
          <p style={{ color: '#6b7280' }}>Congratulations on completing all 12 modules and required assessments! Download your verifiable completion certificate below.</p>
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
      if (Number(quizAnswers[idx]) === Number(q.correctOptionIndex)) {
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
        } else {
          newProgress.push({
            courseId: selectedCourse._id || selectedCourse.id,
            watchedVideos: [],
            midCourseQuizCompleted: isMid,
            finalQuizCompleted: isFinal
          });
        }
        return newProgress;
      });

      if (isFinal) {
        // Automatic Certificate Generation on Backend
        try {
          await apiService.post('/certificates/save', {
            userEmail: user.email,
            userName: user.fullName,
            courseId: selectedCourse._id || selectedCourse.id,
            courseTitle: selectedCourse.title,
            college: user.college,
            department: user.department,
            year: user.year
          });
          console.log('Certificate automatically generated and saved!');
        } catch (certErr) {
          console.warn('Auto certificate save notice:', certErr);
        }
      }
      
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

  if (activeTab !== 'dashboard' && activeTab !== 'courses') {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.premiumCard} style={{ marginTop: '20px', padding: '60px', textAlign: 'center' }}>
          <h2 className={styles.sectionTitle}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <p style={{ color: '#6B7280', fontSize: '16px' }}>The {activeTab} view will be available in a future update.</p>
        </div>
      </div>
    );
  }

  const handlePreview5s = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
    }
  };

  const handleReview5s = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5);
    }
  };

  const renderCourseViewer = () => {
    if (!selectedCourse) return null;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://chemy-lms.onrender.com/api';
    const serverBaseUrl = API_BASE_URL.replace('/api', '');

    const getFullUrl = (url) => {
      if (!url) return '';
      if (url.startsWith('http')) return url;
      return `${serverBaseUrl}${url}`;
    };

    const courseProg = userProgress.find(p => String(p.courseId) === String(selectedCourse._id || selectedCourse.id)) || { watchedVideos: [], midCourseQuizCompleted: false, finalQuizCompleted: false };
    const watchedSet = new Set(courseProg.watchedVideos || []);
    
    const totalVideos = selectedCourse.videos ? selectedCourse.videos.length : 12;
    
    // Strict progression rules:
    // 1. Videos 1 to 5 require watching in order.
    // 2. Mid quiz unlocks after 5 videos watched (index 4).
    // 3. Videos 6 to 12 are STRICTLY LOCKED until Mid Quiz is completed.
    // 4. Final quiz unlocks after Video 12 (index 11).
    // 5. Certificate auto-generated after all 12 videos watched + Mid Quiz + Final Quiz completed.
    const midQuizQuestions = selectedCourse.midCourseQuiz?.length ? selectedCourse.midCourseQuiz : midCourseQuizTemplate;
    const finalQuizQuestions = selectedCourse.finalAssessmentQuiz?.length ? selectedCourse.finalAssessmentQuiz : finalAssessmentQuizTemplate;

    const midQuizUnlocked = watchedSet.size >= 5 || (selectedCourse.videos && watchedSet.size >= Math.min(5, selectedCourse.videos.length));
    const finalQuizUnlocked = courseProg.midCourseQuizCompleted && watchedSet.size >= totalVideos;
    const courseCompleted = courseProg.midCourseQuizCompleted && courseProg.finalQuizCompleted && watchedSet.size >= totalVideos;

    if (activeQuiz) {
      return createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(5, 10, 25, 0.88)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#0f172a',
            width: '100%',
            maxWidth: '820px',
            maxHeight: '90vh',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090d16' }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '20px', fontWeight: 700 }}>{activeQuiz.title}</h2>
              <button 
                onClick={closeQuiz} 
                style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px', boxSizing: 'border-box' }}>
              {quizScore !== null ? (
                <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>{quizScore.score === quizScore.total ? '🏆' : '👏'}</div>
                  <h3 style={{ color: '#fff', fontSize: '26px', marginBottom: '8px' }}>Quiz Completed!</h3>
                  <p style={{ color: '#94a3b8', fontSize: '17px', margin: '0 0 20px 0' }}>You scored {quizScore.score} out of {quizScore.total}</p>
                  {activeQuiz.type === 'mid' && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '14px', borderRadius: '10px', color: '#34d399', fontSize: '15px', fontWeight: 'bold', marginBottom: '24px' }}>
                      🎉 Videos 6 to 12 are now UNLOCKED!
                    </div>
                  )}
                  {activeQuiz.type === 'final' && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '14px', borderRadius: '10px', color: '#34d399', fontSize: '15px', fontWeight: 'bold', marginBottom: '24px' }}>
                      🎓 Congratulations! Your official Certificate has been automatically generated.
                    </div>
                  )}
                  <button onClick={closeQuiz} style={{ padding: '12px 28px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Continue to Course
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {activeQuiz.questions.map((q, qIdx) => (
                    <div key={qIdx} style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                      <h4 style={{ color: '#f8fafc', fontSize: '16px', marginBottom: '14px', lineHeight: 1.4 }}>{qIdx + 1}. {q.question}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {q.options.map((opt, oIdx) => (
                          <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cbd5e1', cursor: 'pointer', padding: '10px 14px', background: quizAnswers[qIdx] === oIdx ? 'rgba(37,99,235,0.2)' : 'rgba(15,23,42,0.6)', borderRadius: '8px', border: quizAnswers[qIdx] === oIdx ? '1px solid #3b82f6' : '1px solid #334155', transition: 'all 0.2s ease' }}>
                            <input type="radio" name={`q_${qIdx}`} checked={quizAnswers[qIdx] === oIdx} onChange={() => setQuizAnswers(prev => ({...prev, [qIdx]: oIdx}))} />
                            <span style={{ fontSize: '14px' }}>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={submitQuiz} 
                    disabled={Object.keys(quizAnswers).length < activeQuiz.questions.length} 
                    style={{ 
                      padding: '14px', 
                      background: Object.keys(quizAnswers).length < activeQuiz.questions.length ? '#334155' : '#10b981', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '10px', 
                      fontSize: '15px', 
                      fontWeight: 'bold', 
                      cursor: Object.keys(quizAnswers).length < activeQuiz.questions.length ? 'not-allowed' : 'pointer', 
                      marginTop: '10px' 
                    }}
                  >
                    Submit Answers ({Object.keys(quizAnswers).length} / {activeQuiz.questions.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      );
    }

    const currentVideo = selectedCourse.videos && selectedCourse.videos.length > 0 ? selectedCourse.videos[currentVideoIndex] : null;

    const handleSelectVideo = (index) => {
      // Videos 6-12 (index >= 5) are locked if Mid Quiz is not completed
      if (index >= 5 && !courseProg.midCourseQuizCompleted) {
        setActiveQuiz({ type: 'mid', questions: midQuizQuestions, title: 'Mid-Course Quiz (Required to unlock Videos 6–12)' });
        return;
      }
      setCurrentVideoIndex(index);
    };

    const handleNextVideo = () => {
      // Force mid quiz after 5 videos (index 4) if not completed
      if (currentVideoIndex === 4 && !courseProg.midCourseQuizCompleted) {
        setActiveQuiz({ type: 'mid', questions: midQuizQuestions, title: 'Mid-Course Quiz (After Video 5)' });
      } else if (currentVideoIndex >= 4 && !courseProg.midCourseQuizCompleted) {
        setActiveQuiz({ type: 'mid', questions: midQuizQuestions, title: 'Mid-Course Quiz (After Video 5)' });
      } else if (currentVideoIndex < totalVideos - 1) {
        setCurrentVideoIndex(prev => prev + 1);
      }
    };

    return createPortal(
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 10, 25, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: '#0f172a',
          width: '100%',
          maxWidth: '1240px',
          height: '92vh',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090d16', gap: '16px' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '20px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedCourse.title}
              </h2>
              <p style={{ color: '#94a3b8', margin: '3px 0 0 0', fontSize: '13px' }}>
                12-Module Program • Mid Quiz after Video 5 • Final Assessment after Video 12
              </p>
            </div>
            <button 
              onClick={() => { setSelectedCourse(null); setCurrentVideoIndex(0); }}
              style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
          
          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '26px', boxSizing: 'border-box' }}>
            
            {/* Automatic Certificate Generation Display when Course is Completed */}
            {courseCompleted && (
              <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#fff', padding: '28px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 25px rgba(4,120,87,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '40px', marginBottom: '6px' }}>🎓 🏆</div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 800 }}>Congratulations! Course Completed</h2>
                <p style={{ color: '#a7f3d0', fontSize: '14.5px', maxWidth: '680px', margin: '0 auto 20px auto' }}>
                  You have successfully watched all 12 modules and passed both the Mid-Course Quiz and Final Assessment. Your official certificate is ready!
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
                  <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', width: '100%', maxWidth: '1050px' }}>
                    <CertificateCard user={user} course={selectedCourse} />
                  </div>
                </div>
              </div>
            )}

            {/* Video Player & Sequential Control */}
            {currentVideo && (
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <span style={{ background: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                      Video {currentVideoIndex + 1} of {totalVideos}
                    </span>
                    <span style={{ color: '#f8fafc', fontSize: '14.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {currentVideo.name || `Module Lecture ${currentVideoIndex + 1}`}
                    </span>
                  </div>
                  <span style={{ color: '#38bdf8', fontSize: '12.5px', fontWeight: 700, background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', padding: '4px 12px', borderRadius: '20px', flexShrink: 0 }}>
                    ✓ {watchedSet.size} / {totalVideos} Watched
                  </span>
                </div>
                
                <div style={{ background: '#020617', borderRadius: '14px', overflow: 'hidden', border: '1px solid #1e293b', boxShadow: '0 15px 30px rgba(0,0,0,0.5)' }}>
                  <video 
                    key={currentVideo.url || currentVideoIndex}
                    ref={videoRef}
                    controls 
                    playsInline
                    preload="metadata"
                    poster={getFullUrl(selectedCourse.image) || "/chemy2.png"}
                    src={getFullUrl(currentVideo.url)}
                    controlsList="nodownload"
                    onEnded={() => {
                      handleVideoEnded(currentVideo.url);
                      // Trigger Mid Quiz right after Video 5 ends
                      if (currentVideoIndex === 4 && !courseProg.midCourseQuizCompleted) {
                        setActiveQuiz({ type: 'mid', questions: midQuizQuestions, title: 'Mid-Course Quiz (After Video 5)' });
                      } 
                      // Trigger Final Quiz right after Video 12 ends
                      else if (currentVideoIndex === totalVideos - 1 && !courseProg.finalQuizCompleted) {
                        setActiveQuiz({ type: 'final', questions: finalQuizQuestions, title: 'Final Assessment Quiz (After Video 12)' });
                      }
                    }}
                    style={{ width: '100%', height: '460px', objectFit: 'contain', background: '#000', display: 'block' }}
                  />
                  
                  {/* Video Navigation Bar */}
                  <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090d16', borderTop: '1px solid #1e293b', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button onClick={handlePreview5s} style={{ padding: '8px 14px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                        ⏪ -5s
                      </button>
                      <button onClick={handleReview5s} style={{ padding: '8px 14px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                        +5s ⏩
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {/* Mid Quiz Trigger Button after Video 5 */}
                      {currentVideoIndex === 4 && !courseProg.midCourseQuizCompleted && (
                        <button
                          onClick={() => setActiveQuiz({ type: 'mid', questions: midQuizQuestions, title: 'Mid-Course Quiz (After Video 5)' })}
                          style={{ padding: '9px 18px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(217,119,6,0.3)' }}
                        >
                          📝 Take Mid-Course Quiz (Required for Video 6+)
                        </button>
                      )}

                      {/* Next Video button */}
                      {currentVideoIndex < totalVideos - 1 && (
                        <button 
                          onClick={handleNextVideo} 
                          style={{ padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                        >
                          Next Video ⏭️
                        </button>
                      )}

                      {/* Final Quiz Trigger Button at Video 12 */}
                      {currentVideoIndex === totalVideos - 1 && !courseProg.finalQuizCompleted && (
                        <button 
                          onClick={() => setActiveQuiz({ type: 'final', questions: finalQuizQuestions, title: 'Final Assessment Quiz (After Video 12)' })}
                          disabled={!courseProg.midCourseQuizCompleted}
                          style={{ padding: '9px 18px', background: courseProg.midCourseQuizCompleted ? '#059669' : '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: courseProg.midCourseQuizCompleted ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '13px', boxShadow: courseProg.midCourseQuizCompleted ? '0 4px 12px rgba(5,150,105,0.3)' : 'none' }}
                        >
                          {courseProg.midCourseQuizCompleted ? '🏆 Take Final Quiz & Unlock Certificate 📝' : '🔒 Final Quiz (Complete Mid Quiz First)'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Course 12-Module Checklist & Assessment Roadmap */}
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '14px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ color: '#f8fafc', margin: 0, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  📚 Course Modules & Assessment Milestones
                </h3>
                <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                  Progress: {watchedSet.size} of 12 Videos • Mid Quiz: {courseProg.midCourseQuizCompleted ? '✓ Passed' : 'Pending'} • Final Quiz: {courseProg.finalQuizCompleted ? '✓ Passed' : 'Pending'}
                </span>
              </div>

              {/* Module Timeline Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {Array.from({ length: 12 }).map((_, idx) => {
                  const isWatched = (selectedCourse.videos || [])[idx] ? watchedSet.has(selectedCourse.videos[idx].url) : false;
                  const isCurrent = currentVideoIndex === idx;
                  const isLocked = idx >= 5 && !courseProg.midCourseQuizCompleted;
                  
                  return (
                    <div 
                      key={idx}
                      onClick={() => !isLocked && handleSelectVideo(idx)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: isCurrent ? '#2563eb' : isWatched ? 'rgba(5, 150, 105, 0.25)' : isLocked ? '#0f172a' : '#334155',
                        color: isLocked ? '#64748b' : '#fff',
                        border: isCurrent ? '1px solid #60a5fa' : isWatched ? '1px solid #059669' : '1px solid #475569',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', fontWeight: 700 }}>
                        <span>Video #{idx + 1}</span>
                        <span>{isWatched ? '✓ Watched' : isLocked ? '🔒 Locked' : isCurrent ? '▶ Playing' : '○'}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: isLocked ? '#475569' : '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(selectedCourse.videos || [])[idx]?.name || `Lecture ${idx + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Milestones status row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: courseProg.midCourseQuizCompleted ? 'rgba(5, 150, 105, 0.2)' : '#0f172a', border: courseProg.midCourseQuizCompleted ? '1px solid #059669' : '1px solid #334155' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '3px' }}>
                    📝 Mid-Course Quiz (After Video 5)
                  </div>
                  <div style={{ fontSize: '11.5px', color: courseProg.midCourseQuizCompleted ? '#6ee7b7' : '#94a3b8' }}>
                    {courseProg.midCourseQuizCompleted ? '✓ Completed — Videos 6–12 unlocked' : 'Required to unlock Videos 6 through 12'}
                  </div>
                </div>

                <div style={{ padding: '12px 16px', borderRadius: '10px', background: courseProg.finalQuizCompleted ? 'rgba(5, 150, 105, 0.2)' : '#0f172a', border: courseProg.finalQuizCompleted ? '1px solid #059669' : '1px solid #334155' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '3px' }}>
                    🏆 Final Assessment Quiz (After Video 12)
                  </div>
                  <div style={{ fontSize: '11.5px', color: courseProg.finalQuizCompleted ? '#6ee7b7' : '#94a3b8' }}>
                    {courseProg.finalQuizCompleted ? '✓ Completed — Certificate Issued' : 'Required to generate completion certificate'}
                  </div>
                </div>

                <div style={{ padding: '12px 16px', borderRadius: '10px', background: courseCompleted ? 'rgba(5, 150, 105, 0.2)' : '#0f172a', border: courseCompleted ? '1px solid #059669' : '1px solid #334155' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '3px' }}>
                    🎓 Completion Certificate
                  </div>
                  <div style={{ fontSize: '11.5px', color: courseCompleted ? '#6ee7b7' : '#94a3b8' }}>
                    {courseCompleted ? '✓ Ready for High-Res PNG Download' : 'Auto-generated upon completing all 12 videos + quizzes'}
                  </div>
                </div>
              </div>
            </div>

            {/* PPTs & Course Resources */}
            {selectedCourse.ppts && selectedCourse.ppts.length > 0 && (
              <div>
                <h3 style={{ color: '#94a3b8', marginBottom: '12px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  📊 Course PPT Presentations & Resources
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                  {selectedCourse.ppts.map((ppt, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '12px 16px', borderRadius: '10px', border: '1px solid #334155' }}>
                      <span style={{ color: '#f8fafc', fontWeight: '500', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>
                        {ppt.name || `Presentation ${idx + 1}`}
                      </span>
                      <a 
                        href={getFullUrl(ppt.url)} 
                        target="_blank" 
                        rel="noreferrer"
                        download
                        style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}
                      >
                        Download PPT
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>,
      document.body
    );
  };

  if (activeTab === 'courses') {
    return (
      <div className={styles.dashboardContainer} style={{ padding: '20px' }}>
        {renderCourseViewer()}
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
                
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://chemy-lms.onrender.com/api';
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
      </div>
    );
  }

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

      {/* My Courses moved to its own tab */}

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
