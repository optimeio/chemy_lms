import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/useAuth';
import { apiService } from '../services/apiService';
import { getFullMediaUrl } from '../services/apiConfig';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Attempt to fetch course by id; if that fails, fetch all courses and find it.
      try {
        let res;
        try {
          res = await apiService.get(`/courses/${encodeURIComponent(courseId)}`);
        } catch (err) {
          // apiService may throw on network errors — fall back
          console.warn('Direct course fetch failed, will try listing all courses', err);
          res = { success: false };
        }

        if (!res || res.success === false || !res.course) {
          const all = await apiService.get('/courses');
          if (all && all.success && Array.isArray(all.courses)) {
            const found = all.courses.find(c => String(c._id) === String(courseId) || String(c.id) === String(courseId) || String(c.title) === String(courseId));
            if (found) {
              res = { success: true, course: found };
            } else {
              res = { success: false };
            }
          }
        }

        if (res && res.success && res.course) setCourse(res.course);

        if (user) {
          const prof = await apiService.get(`/users/${encodeURIComponent(user.email)}`);
          if (prof && prof.success) setUserProgress(prof.user.progress || []);
        }
      } catch (e) {
        console.error('Failed to fetch course/player data', e);
      }
    };
    fetchData();
  }, [courseId, user]);

  const getFullUrl = getFullMediaUrl;

  const courseProg = userProgress.find(p => String(p.courseId) === String(course?._id || course?.id)) || { watchedVideos: [], midCourseQuizCompleted: false, finalQuizCompleted: false };
  const watchedSet = new Set(courseProg.watchedVideos || []);
  const processedVideos = useRef(new Set());

  const handleVideoEnded = async (videoUrl) => {
    if (!course || !user) return;
    if (processedVideos.current.has(videoUrl)) return;
    processedVideos.current.add(videoUrl);

    try {
      await apiService.post(`/users/${encodeURIComponent(user.email)}/progress`, {
        courseId: course._id || course.id,
        videoUrl: videoUrl
      });
      setUserProgress(prev => {
        const newProgress = [...prev];
        let pIndex = newProgress.findIndex(p => String(p.courseId) === String(course._id || course.id));
        if (pIndex === -1) {
          newProgress.push({ courseId: course._id || course.id, watchedVideos: [videoUrl], midCourseQuizCompleted: false, finalQuizCompleted: false });
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

  const handleTimeUpdate = (e) => {
    const video = e.target;
    if (video.duration && video.currentTime / video.duration >= 0.75) {
      const currentUrl = course.videos[currentVideoIndex]?.url;
      if (currentUrl && !watchedSet.has(currentUrl)) {
        handleVideoEnded(currentUrl);
      }
    }
  };

  const handleVideoSelect = (index) => {
    if (index === 0 || index === currentVideoIndex) {
      setCurrentVideoIndex(index);
      return;
    }
    const prevUrl = course.videos[index - 1]?.url;
    if (prevUrl && watchedSet.has(prevUrl)) {
      setCurrentVideoIndex(index);
    } else {
      alert("Please watch at least 75% of the previous video to unlock this one.");
    }
  };

  if (!course) return <div style={{ padding: '20px' }}>Loading course...</div>;

  return (
    <div style={{ 
      padding: 'clamp(12px, 5vw, 30px)',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 'clamp(12px, 3vw, 20px)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(20px, 5vw, 28px)' }}>{course.title}</h2>
          <button onClick={() => navigate(-1)} style={{ padding: '8px 14px', borderRadius: 8, background: '#374151', color: '#fff', border: 'none', flexShrink: 0 }}>Back</button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(12px, 3vw, 24px)',
          alignItems: 'start'
        }}>
          <div style={{ minWidth: 0 }}>
            {course.videos && course.videos.length > 0 && course.videos[currentVideoIndex] && (
              <div style={{ background: '#0f1724', padding: 12, borderRadius: 8, overflow: 'hidden' }}>
                <video 
                  controls 
                  controlsList="nodownload" 
                  src={getFullUrl(course.videos[currentVideoIndex].url)} 
                  style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover' }} 
                  onEnded={() => handleVideoEnded(course.videos[currentVideoIndex].url)} 
                  onTimeUpdate={handleTimeUpdate}
                  key={currentVideoIndex}
                />
              </div>
            )}

            {/* Resources */}
            {course.ppts && course.ppts.length > 0 && (
              <div style={{ marginTop: 'clamp(12px, 3vw, 16px)' }}>
                <h4 style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>Resources</h4>
                {course.ppts.map((ppt, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: 'clamp(8px, 2vw, 12px)', borderRadius: 8, marginTop: 8, flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ minWidth: '0', flex: 1, wordBreak: 'break-word' }}>{ppt.name || `Presentation ${idx + 1}`}</div>
                    <a href={getFullUrl(ppt.url)} target="_blank" rel="noreferrer" download style={{ background: '#3b82f6', color: '#fff', padding: '8px 12px', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>Download PPT</a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside style={{ background: '#fff', borderRadius: 8, padding: 'clamp(8px, 2vw, 12px)', minWidth: 0 }}>
            <h4 style={{ marginTop: 0, fontSize: 'clamp(16px, 4vw, 18px)' }}>Module Checklist</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(course.videos || []).map((v, i) => {
                const isUnlocked = i === 0 || watchedSet.has(course.videos[i - 1]?.url);
                const isCurrent = i === currentVideoIndex;
                const isCompleted = watchedSet.has(v.url);
                
                return (
                  <div 
                    key={i} 
                    onClick={() => handleVideoSelect(i)}
                    style={{ 
                      padding: 'clamp(8px, 2vw, 10px)', 
                      borderRadius: 8, 
                      background: isCurrent ? '#dbeafe' : isCompleted ? '#ecfdf5' : '#f3f4f6', 
                      wordBreak: 'break-word', 
                      fontSize: 'clamp(13px, 2vw, 14px)',
                      cursor: isUnlocked ? 'pointer' : 'not-allowed',
                      border: isCurrent ? '2px solid #3b82f6' : '2px solid transparent',
                      opacity: isUnlocked ? 1 : 0.6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{v.name || `Video ${i + 1}`}</span>
                      {isCompleted && <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>✓</span>}
                      {!isUnlocked && <span style={{ fontSize: '12px', color: '#6b7280' }}>🔒</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
