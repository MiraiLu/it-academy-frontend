import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/StudentCabinet.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

function StudentCabinet() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const token = localStorage.getItem('auth_token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await axios.get(`${API_URL}/my-courses`, { headers });
      setEnrollments(res.data.data || []);
    } catch (err) {
      console.error('Enrollments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    setCourseLoading(true);
    try {
      const res = await axios.get(`${API_URL}/courses/${courseId}`, { headers });
      setCourseDetails(res.data.data);
      if (res.data.data?.sections?.[0]?.lessons?.[0]) {
        setActiveLesson(res.data.data.sections[0].lessons[0]);
      }
    } catch (err) {
      console.error('Course details error:', err);
    } finally {
      setCourseLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await axios.post(`${API_URL}/auth/logout`, {}, { headers }); } catch {}
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openCourse = (enrollment) => {
  setActiveCourse(enrollment);
  setView('course');
  setSidebarOpen(false);
  
    // Шукаємо id курсу у всіх можливих місцях
    const courseId = enrollment.course?.id 
      || enrollment.course_id 
      || enrollment.id;
    
    console.log('Course ID:', courseId, 'Enrollment:', enrollment);
    
    if (courseId) {
      fetchCourseDetails(courseId);
    } else {
      console.error('Cannot find course ID in enrollment:', enrollment);
    }
  };

  const completedCount = enrollments.filter(e => e.progress_percentage === 100).length;
  const inProgressCount = enrollments.filter(e => e.progress_percentage > 0 && e.progress_percentage < 100).length;

  const getLevelLabel = (level) => {
    if (level === 'beginner') return 'Початківець';
    if (level === 'intermediate') return 'Середній';
    return 'Просунутий';
  };

  const getLessonIcon = (type) => {
    if (type === 'video') return '🎬';
    if (type === 'quiz') return '❓';
    if (type === 'assignment') return '📝';
    return '📖';
  };

  if (loading) return (
    <div className="sc-loading">
      <div className="sc-spinner"></div>
      <p>Завантаження...</p>
    </div>
  );

  return (
    <div className="sc-wrap">
      {/* HEADER */}
      <header className="sc-header">
        <div className="sc-header-left">
          <button className="sc-burger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span></span><span></span><span></span>
          </button>
          <div className="sc-logo">
            <div className="sc-logo-icon">IT</div>
            <span>IT Academy</span>
          </div>
        </div>
        <div className="sc-header-right">
          <div style={{ position: 'relative' }}>
            <div className="sc-user-pill" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: 'pointer' }}>
              <div className="sc-avatar">{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
              <span className="sc-username">{user?.full_name || user?.first_name}</span>
              <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>▾</span>
            </div>
            {dropdownOpen && (
              <>
                <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '8px 0', minWidth: 200, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                  <div style={{ padding: '8px 16px 10px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#2c3e50' }}>{user?.full_name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email}</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>
                      <span style={{ background: '#fff5f0', color: '#ff6b35', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>Студент</span>
                    </div>
                  </div>
                  {[{ icon: '👤', label: 'Профіль' }, { icon: '⚙️', label: 'Налаштування' }, { icon: '⭐', label: 'Мій рейтинг' }].map(item => (
                    <button key={item.label} onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#2c3e50', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <span>{item.icon}</span> {item.label}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid #f0f0f0', margin: '4px 0' }} />
                  <button onClick={() => { setDropdownOpen(false); handleLogout(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#e53e3e', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <span>🚪</span> Вийти
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="sc-body">
        {/* SIDEBAR */}
        <aside className={`sc-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {sidebarOpen && <div className="sc-overlay" onClick={() => setSidebarOpen(false)}></div>}
          <nav className="sc-nav">
            <button className={`sc-nav-item ${view === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setView('dashboard'); setSidebarOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Мій кабінет
            </button>
            <button className={`sc-nav-item ${view === 'course' ? 'active' : ''}`}
              onClick={() => enrollments[0] && openCourse(enrollments[0])}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Мої курси
            </button>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="sc-main">

          {/* DASHBOARD VIEW */}
          {view === 'dashboard' && (
            <div className="sc-dashboard">
              <div className="sc-welcome">
                <h1>Привіт, {user?.first_name}! 👋</h1>
                <p>Продовжуй навчання — ти молодець!</p>
              </div>
              <div className="sc-stats">
                <div className="sc-stat-card">
                  <div className="sc-stat-icon blue">📚</div>
                  <div><div className="sc-stat-num">{enrollments.length}</div><div className="sc-stat-label">Всього курсів</div></div>
                </div>
                <div className="sc-stat-card">
                  <div className="sc-stat-icon orange">🔥</div>
                  <div><div className="sc-stat-num">{inProgressCount}</div><div className="sc-stat-label">В процесі</div></div>
                </div>
                <div className="sc-stat-card">
                  <div className="sc-stat-icon green">✅</div>
                  <div><div className="sc-stat-num">{completedCount}</div><div className="sc-stat-label">Завершено</div></div>
                </div>
              </div>

              <div className="sc-section-title">Мої курси</div>
              {enrollments.length === 0 ? (
                <div className="sc-empty">
                  <div className="sc-empty-icon">🎓</div>
                  <p>Ти ще не записаний на жодний курс</p>
                </div>
              ) : (
                <div className="sc-courses-grid">
                  {enrollments.map(enrollment => (
                    <div key={enrollment.id} className="sc-course-card" onClick={() => openCourse(enrollment)}>
                      <div className="sc-course-header">
                        <div className="sc-course-badge">{getLevelLabel(enrollment.course?.level)}</div>
                        <div className="sc-course-price">
                          {enrollment.payment_status === 'paid' ? '✅ Оплачено' : '⏳ Очікує оплати'}
                        </div>
                      </div>
                      <h3 className="sc-course-title">{enrollment.course?.title_uk || enrollment.course?.title}</h3>
                      <p className="sc-course-desc">{enrollment.course?.short_description_uk || enrollment.course?.short_description}</p>
                      <div className="sc-progress-wrap">
                        <div className="sc-progress-bar">
                          <div className="sc-progress-fill" style={{ width: `${enrollment.progress_percentage || 0}%` }}></div>
                        </div>
                        <span className="sc-progress-pct">{enrollment.progress_percentage || 0}%</span>
                      </div>
                      <button className="sc-btn-continue">
                        {enrollment.progress_percentage > 0 ? 'Продовжити →' : 'Розпочати →'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COURSE VIEW */}
          {view === 'course' && activeCourse && (
            <div style={{ display: 'flex', gap: 0, height: '100%' }}>

              {/* Lesson List Sidebar */}
              <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid #e2e8f0', overflowY: 'auto', background: '#fff' }}>
                <div style={{ padding: '16px 16px 8px' }}>
                  <button className="sc-back" onClick={() => { setView('dashboard'); setActiveCourse(null); setCourseDetails(null); setActiveLesson(null); }}>
                    ← Назад до кабінету
                  </button>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#2c3e50', margin: '8px 0 4px' }}>
                    {activeCourse.course?.title_uk || activeCourse.course?.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${activeCourse.progress_percentage || 0}%`, background: 'linear-gradient(90deg,#ff6b35,#f7931e)', borderRadius: 3 }}></div>
                    </div>
                    <span style={{ fontSize: 12, color: '#ff6b35', fontWeight: 600 }}>{activeCourse.progress_percentage || 0}%</span>
                  </div>
                </div>

                {courseLoading ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>Завантаження уроків...</div>
                ) : courseDetails?.sections?.length > 0 ? (
                  courseDetails.sections.map((section, si) => (
                    <div key={section.id}>
                      <div style={{ padding: '10px 16px 6px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f8fafc', borderBottom: '1px solid #f0f0f0' }}>
                        {si + 1}. {section.title_uk || section.title}
                      </div>
                      {section.lessons?.map((lesson, li) => (
                        <div key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f8fafc',
                            background: activeLesson?.id === lesson.id ? '#fff5f0' : '#fff',
                            borderLeft: activeLesson?.id === lesson.id ? '3px solid #ff6b35' : '3px solid transparent',
                            transition: 'all 0.15s'
                          }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: activeLesson?.id === lesson.id ? '#ff6b35' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, color: activeLesson?.id === lesson.id ? '#fff' : '#5a6c7d' }}>
                            {getLessonIcon(lesson.lesson_type)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: activeLesson?.id === lesson.id ? 500 : 400, color: '#2c3e50', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {lesson.title_uk || lesson.title}
                            </div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>
                              {lesson.duration_minutes} хв
                              {lesson.is_free && <span style={{ marginLeft: 6, color: '#16a34a', fontWeight: 500 }}>● Безкоштовно</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    Уроки ще не додані
                  </div>
                )}
              </div>

              {/* Lesson Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
                {activeLesson ? (
                  <div style={{ maxWidth: 720 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{getLessonIcon(activeLesson.lesson_type)}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8', background: '#f8fafc', padding: '2px 10px', borderRadius: 20 }}>
                        {activeLesson.duration_minutes} хвилин
                      </span>
                      {activeLesson.is_free && (
                        <span style={{ fontSize: 12, color: '#16a34a', background: '#f0fdf4', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
                          Безкоштовний урок
                        </span>
                      )}
                    </div>

                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2c3e50', marginBottom: 20, lineHeight: 1.3 }}>
                      {activeLesson.title_uk || activeLesson.title}
                    </h1>

                    {activeLesson.video_url && (
                      <div style={{ background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 24, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontSize: 48 }}>▶</span>
                      </div>
                    )}

                    <div style={{ fontSize: 15, lineHeight: 1.8, color: '#374151', background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
                      {activeLesson.content_uk || activeLesson.content}
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                      <button
                        className="sc-btn-continue"
                        style={{ width: 'auto', padding: '12px 24px', background: '#f8fafc', color: '#5a6c7d', fontWeight: 500 }}
                        onClick={() => {
                          const allLessons = courseDetails.sections.flatMap(s => s.lessons);
                          const idx = allLessons.findIndex(l => l.id === activeLesson.id);
                          if (idx > 0) setActiveLesson(allLessons[idx - 1]);
                        }}
                      >
                        ← Попередній
                      </button>
                      <button
                        className="sc-btn-continue"
                        style={{ width: 'auto', padding: '12px 24px' }}
                        onClick={() => {
                          const allLessons = courseDetails.sections.flatMap(s => s.lessons);
                          const idx = allLessons.findIndex(l => l.id === activeLesson.id);
                          if (idx < allLessons.length - 1) setActiveLesson(allLessons[idx + 1]);
                        }}
                      >
                        Наступний →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: '#94a3b8' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
                    <p style={{ fontSize: 16 }}>Обери урок зі списку зліва</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default StudentCabinet;