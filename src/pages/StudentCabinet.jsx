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
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'course'
  const [loading, setLoading] = useState(true);
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

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { headers });
    } catch {}
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openCourse = (enrollment) => {
    setActiveCourse(enrollment);
    setView('course');
    setSidebarOpen(false);
  };

  const completedCount = enrollments.filter(e => e.progress_percentage === 100).length;
  const inProgressCount = enrollments.filter(e => e.progress_percentage > 0 && e.progress_percentage < 100).length;

  if (loading) {
    return (
      <div className="sc-loading">
        <div className="sc-spinner"></div>
        <p>Завантаження...</p>
      </div>
    );
  }

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
      <div className="sc-avatar">
        {user?.first_name?.[0]}{user?.last_name?.[0]}
      </div>
      <span className="sc-username">{user?.full_name || user?.first_name}</span>
      <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>▾</span>
    </div>

    {dropdownOpen && (
      <>
        <div
          onClick={() => setDropdownOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
        />
        <div style={{
          position: 'absolute', top: '110%', right: 0,
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: '8px 0',
          minWidth: 200, zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}>
          <div style={{ padding: '8px 16px 10px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#2c3e50' }}>{user?.full_name}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email}</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>
              <span style={{ background: '#fff5f0', color: '#ff6b35', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                Студент
              </span>
            </div>
          </div>

          {[
            { icon: '👤', label: 'Профіль' },
            { icon: '⚙️', label: 'Налаштування' },
            { icon: '⭐', label: 'Мій рейтинг' },
          ].map(item => (
            <button key={item.label} onClick={() => setDropdownOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 16px', border: 'none',
              background: 'none', cursor: 'pointer', fontSize: 14, color: '#2c3e50',
              textAlign: 'left'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}

          <div style={{ borderTop: '1px solid #f0f0f0', margin: '4px 0' }} />

          <button onClick={() => { setDropdownOpen(false); handleLogout(); }} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '10px 16px', border: 'none',
            background: 'none', cursor: 'pointer', fontSize: 14, color: '#e53e3e',
            textAlign: 'left'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
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
            <button
              className={`sc-nav-item ${view === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setView('dashboard'); setSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Мій кабінет
            </button>
            <button
              className={`sc-nav-item ${view === 'course' ? 'active' : ''}`}
              onClick={() => enrollments[0] && openCourse(enrollments[0])}
            >
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

          {view === 'dashboard' && (
            <div className="sc-dashboard">
              <div className="sc-welcome">
                <h1>Привіт, {user?.first_name}! 👋</h1>
                <p>Продовжуй навчання — ти молодець!</p>
              </div>

              {/* Статистика */}
              <div className="sc-stats">
                <div className="sc-stat-card">
                  <div className="sc-stat-icon blue">📚</div>
                  <div>
                    <div className="sc-stat-num">{enrollments.length}</div>
                    <div className="sc-stat-label">Всього курсів</div>
                  </div>
                </div>
                <div className="sc-stat-card">
                  <div className="sc-stat-icon orange">🔥</div>
                  <div>
                    <div className="sc-stat-num">{inProgressCount}</div>
                    <div className="sc-stat-label">В процесі</div>
                  </div>
                </div>
                <div className="sc-stat-card">
                  <div className="sc-stat-icon green">✅</div>
                  <div>
                    <div className="sc-stat-num">{completedCount}</div>
                    <div className="sc-stat-label">Завершено</div>
                  </div>
                </div>
              </div>

              {/* Курси */}
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
                        <div className="sc-course-badge">
                          {enrollment.course?.level === 'beginner' ? 'Початківець' :
                           enrollment.course?.level === 'intermediate' ? 'Середній' : 'Просунутий'}
                        </div>
                        <div className="sc-course-price">
                          {enrollment.payment_status === 'paid' ? '✅ Оплачено' : '⏳ Очікує оплати'}
                        </div>
                      </div>
                      <h3 className="sc-course-title">
                        {enrollment.course?.title_uk || enrollment.course?.title}
                      </h3>
                      <p className="sc-course-desc">
                        {enrollment.course?.short_description_uk || enrollment.course?.short_description}
                      </p>
                      <div className="sc-progress-wrap">
                        <div className="sc-progress-bar">
                          <div
                            className="sc-progress-fill"
                            style={{ width: `${enrollment.progress_percentage || 0}%` }}
                          ></div>
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

          {view === 'course' && activeCourse && (
            <div className="sc-course-view">
              <button className="sc-back" onClick={() => setView('dashboard')}>
                ← Назад до кабінету
              </button>
              <h2>{activeCourse.course?.title_uk || activeCourse.course?.title}</h2>
              <div className="sc-course-info">
                <span>Рівень: {activeCourse.course?.level}</span>
                <span>Статус: {activeCourse.status}</span>
                <span>Прогрес: {activeCourse.progress_percentage || 0}%</span>
              </div>
              <div className="sc-course-placeholder">
                <div className="sc-placeholder-icon">🎬</div>
                <p>Перегляд уроків буде доступний у наступному оновленні</p>
                <p className="sc-placeholder-sub">Уроки для цього курсу ще додаються</p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default StudentCabinet;