import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, coursesAPI, adminAPI } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    reviews: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchStats();
    fetchUsers();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getProfile();
      console.log('✅ User data:', response.data);
      
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.allSettled([
        coursesAPI.getAll(),
        adminAPI.getUsers({ per_page: 1 }),
      ]);
      const coursesTotal = coursesRes.status === 'fulfilled'
        ? (coursesRes.value.data.data?.total || 0) : 0;
      const usersTotal = usersRes.status === 'fulfilled'
        ? (usersRes.value.data.data?.total || usersRes.value.data.data?.length || 0) : 0;
      setStats({ courses: coursesTotal, users: usersTotal, reviews: 0, revenue: 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await adminAPI.getUsers({ per_page: 10 });
      if (res.data.success) {
        setUsers(res.data.data.data || res.data.data || []);
      }
    } catch (err) {
      console.error('fetchUsers error:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p>Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">IT</div>
            <span className="logo-text">IT Academy</span>
            {user.role === 'admin' && (
              <span className="admin-badge">ADMIN</span>
            )}
            {user.role === 'instructor' && (
              <span className="instructor-badge">INSTRUCTOR</span>
            )}
          </div>

          <div className="header-controls">
            <button 
              className="role-switcher"
              onClick={toggleSidebar}
              style={{ display: 'none' }}
            >
              ☰ Меню
            </button>

            <div className="user-menu-wrap" style={{ position: 'relative' }}>
                  <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}style={{ cursor: 'pointer' }}>
        <div className="user-avatar">
          {user.first_name?.[0]}{user.last_name?.[0]}
        </div>
        <span style={{ fontWeight: 500 }}>{user.full_name}</span>
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
            background: 'var(--bg, #fff)',
            border: '1px solid #e2e8f0',
            borderRadius: 12, padding: '8px 0',
            minWidth: 200, zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}>
            <div style={{ padding: '8px 16px 10px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#2c3e50' }}>{user.full_name}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{user.email}</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>
                <span style={{ background: '#fff5f0', color: '#ff6b35', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                  {user.role === 'admin' ? 'Адміністратор' : 'Викладач'}
                </span>
              </div>
            </div>

            <button onClick={() => { setDropdownOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 16px', border: 'none',
              background: 'none', cursor: 'pointer', fontSize: 14, color: '#2c3e50',
              textAlign: 'left'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span>👤</span> Профіль
            </button>

            <button onClick={() => { setDropdownOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 16px', border: 'none',
              background: 'none', cursor: 'pointer', fontSize: 14, color: '#2c3e50',
              textAlign: 'left'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span>⚙️</span> Налаштування
            </button>

            <button onClick={() => { setDropdownOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 16px', border: 'none',
              background: 'none', cursor: 'pointer', fontSize: 14, color: '#2c3e50',
              textAlign: 'left'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span>⭐</span> Мій рейтинг
            </button>

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
        </div>
      </header>

      {/* Layout */}
      <div className="layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Головне</h3>
            <ul className="sidebar-menu">
              <li>
                <span className="active" style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',cursor:'pointer'}}>
                  <span className="sidebar-icon">📊</span> Dashboard
                </span>
              </li>
              <li onClick={() => navigate('/courses')} style={{cursor:'pointer'}}>
                <span style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px'}}>
                  <span className="sidebar-icon">📚</span> Курси
                </span>
              </li>
              <li onClick={() => navigate('/users')} style={{cursor:'pointer'}}>
                <span style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px'}}>
                  <span className="sidebar-icon">👥</span> Користувачі
                </span>
              </li>
              <li onClick={() => navigate('/enrollments')} style={{cursor:'pointer'}}>
                <span style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px'}}>
                  <span className="sidebar-icon">📝</span> Записи на курси
                </span>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Контент</h3>
            <ul className="sidebar-menu">
              <li onClick={() => navigate('/lessons')} style={{cursor:'pointer'}}>
                <span style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px'}}>
                  <span className="sidebar-icon">📖</span> Уроки
                </span>
              </li>
              <li onClick={() => navigate('/quizzes')} style={{cursor:'pointer'}}>
                <span style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px'}}>
                  <span className="sidebar-icon">❓</span> Тести
                </span>
              </li>
              <li onClick={() => navigate('/assignments')} style={{cursor:'pointer'}}>
                <span style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px'}}>
                  <span className="sidebar-icon">📄</span> Завдання
                </span>
              </li>
              <li onClick={() => navigate('/certificates')} style={{cursor:'pointer'}}>
                <span style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px'}}>
                  <span className="sidebar-icon">🎓</span> Сертифікати
                </span>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Налаштування</h3>
            <ul className="sidebar-menu">
              <li onClick={() => navigate('/categories')} style={{cursor:'pointer'}}>
                <span style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px'}}>
                  <span className="sidebar-icon">🏷️</span> Категорії
                </span>
              </li>
              <li onClick={() => navigate('/analytics')} style={{cursor:'pointer'}}>
                <span style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px'}}>
                  <span className="sidebar-icon">📈</span> Аналітика
                </span>
              </li>
              <li onClick={() => navigate('/settings')} style={{cursor:'pointer'}}>
                <span style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px'}}>
                  <span className="sidebar-icon">⚙️</span> Налаштування
                </span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">

        {/* Page Header */}
        <div className="page-header" style={{ marginBottom: 24 }}>
          <h1 className="page-title">Панель адміністратора</h1>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          <button className="btn btn-secondary" style={{ padding: '16px', flexDirection: 'column', fontSize: '14px', gap: 8 }}>
            <span style={{ fontSize: '28px' }}>👤</span> Додати користувача
          </button>
          <button className="btn btn-secondary" style={{ padding: '16px', flexDirection: 'column', fontSize: '14px', gap: 8 }}>
            <span style={{ fontSize: '28px' }}>📊</span> Переглянути звіти
          </button>
          <button className="btn btn-secondary" style={{ padding: '16px', flexDirection: 'column', fontSize: '14px', gap: 8 }}>
            <span style={{ fontSize: '28px' }}>📧</span> Розсилка
          </button>
          <button className="btn btn-secondary" style={{ padding: '16px', flexDirection: 'column', fontSize: '14px', gap: 8 }}>
            <span style={{ fontSize: '28px' }}>🎓</span> Сертифікати
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          <div className="stat-card fade-in">
            <div className="stat-icon users">👥</div>
            <div className="stat-value">{stats.users || '—'}</div>
            <div className="stat-label">Користувачів</div>
            <div className="stat-change positive">реальні дані</div>
          </div>
          <div className="stat-card fade-in">
            <div className="stat-icon courses">📚</div>
            <div className="stat-value">{stats.courses}</div>
            <div className="stat-label">Активних курсів</div>
            <div className="stat-change positive">реальні дані</div>
          </div>
          <div className="stat-card fade-in">
            <div className="stat-icon reviews">⭐</div>
            <div className="stat-value">—</div>
            <div className="stat-label">Відгуків</div>
            <div className="stat-change" style={{color:'#94a3b8'}}>буде в наступній версії</div>
          </div>
          <div className="stat-card fade-in">
            <div className="stat-icon revenue">💰</div>
            <div className="stat-value">—</div>
            <div className="stat-label">Дохід</div>
            <div className="stat-change" style={{color:'#94a3b8'}}>буде в наступній версії</div>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="data-table fade-in">
          <div className="table-header">
            <h2 className="table-title">Останні користувачі</h2>
            <div className="table-filters">
              <input type="text" className="filter-input" placeholder="Пошук..."/>
              <select className="filter-select">
                <option>Всі ролі</option>
                <option>Студенти</option>
                <option>Інструктори</option>
                <option>Адміни</option>
              </select>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ІМ'Я</th>
                <th>EMAIL</th>
                <th>РОЛЬ</th>
                <th>СТАТУС</th>
                <th>ДАТА РЕЄСТРАЦІЇ</th>
                <th>ДІЇ</th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>Завантаження...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>Користувачів не знайдено</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                          {u.first_name?.[0]}{u.last_name?.[0]}
                        </div>
                        {u.full_name || `${u.first_name} ${u.last_name}`}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.role === 'admin' ? 'Адмін' : u.role === 'instructor' ? 'Інструктор' : 'Студент'}</td>
                    <td>
                      <span className={`status-badge ${u.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                        {u.status === 'active' ? 'Активний' : 'Неактивний'}
                      </span>
                    </td>
                    <td>{u.registration_date ? new Date(u.registration_date).toLocaleDateString('uk-UA') : new Date(u.created_at).toLocaleDateString('uk-UA')}</td>
                    <td><button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>Переглянути</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>
      </div>
    </div>
  );
}

export default Dashboard;