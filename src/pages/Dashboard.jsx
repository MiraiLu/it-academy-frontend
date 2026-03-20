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
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchStats();
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
                <a href="/dashboard" className="active">
                  <span className="sidebar-icon">📊</span>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/courses">
                  <span className="sidebar-icon">📚</span>
                  Курси
                </a>
              </li>
              <li>
                <a href="/users">
                  <span className="sidebar-icon">👥</span>
                  Користувачі
                </a>
              </li>
              <li>
                <a href="/enrollments">
                  <span className="sidebar-icon">📝</span>
                  Записи на курси
                </a>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Контент</h3>
            <ul className="sidebar-menu">
              <li>
                <a href="/lessons">
                  <span className="sidebar-icon">📖</span>
                  Уроки
                </a>
              </li>
              <li>
                <a href="/quizzes">
                  <span className="sidebar-icon">❓</span>
                  Тести
                </a>
              </li>
              <li>
                <a href="/assignments">
                  <span className="sidebar-icon">📄</span>
                  Завдання
                </a>
              </li>
              <li>
                <a href="/certificates">
                  <span className="sidebar-icon">🎓</span>
                  Сертифікати
                </a>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Налаштування</h3>
            <ul className="sidebar-menu">
              <li>
                <a href="/categories">
                  <span className="sidebar-icon">🏷️</span>
                  Категорії
                </a>
              </li>
              <li>
                <a href="/analytics">
                  <span className="sidebar-icon">📈</span>
                  Аналітика
                </a>
              </li>
              <li>
                <a href="/settings">
                  <span className="sidebar-icon">⚙️</span>
                  Налаштування
                </a>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Панель адміністратора</h1>
            <div className="page-actions">
              <button className="btn btn-secondary">
                📊 Звіти
              </button>
              <button className="btn btn-primary">
                ➕ Створити курс
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
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
              <div className="stat-change positive">↑ 8% цього місяця</div>
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
                <input 
                  type="text" 
                  className="filter-input" 
                  placeholder="Пошук..."
                />
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
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                        ІП
                      </div>
                      Іван Петров
                    </div>
                  </td>
                  <td>ivan@test.com</td>
                  <td>Студент</td>
                  <td>
                    <span className="status-badge status-active">Активний</span>
                  </td>
                  <td>15.10.2025</td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Переглянути
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                        ОС
                      </div>
                      Олена Сидоренко
                    </div>
                  </td>
                  <td>olena@test.com</td>
                  <td>Студент</td>
                  <td>
                    <span className="status-badge status-active">Активний</span>
                  </td>
                  <td>18.10.2025</td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Переглянути
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                        АМ
                      </div>
                      Андрій Мельник
                    </div>
                  </td>
                  <td>andrii@test.com</td>
                  <td>Інструктор</td>
                  <td>
                    <span className="status-badge status-active">Активний</span>
                  </td>
                  <td>20.10.2025</td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Переглянути
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quick Actions */}
          <div className="data-table fade-in" style={{ marginTop: '30px' }}>
            <div className="table-header">
              <h2 className="table-title">Швидкі дії</h2>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px',
              marginTop: '20px'
            }}>
              <button className="btn btn-primary" style={{ 
                padding: '20px', 
                flexDirection: 'column',
                fontSize: '16px'
              }}>
                <span style={{ fontSize: '32px' }}>➕</span>
                Додати курс
              </button>
              
              <button className="btn btn-secondary" style={{ 
                padding: '20px', 
                flexDirection: 'column',
                fontSize: '16px'
              }}>
                <span style={{ fontSize: '32px' }}>👤</span>
                Додати користувача
              </button>
              
              <button className="btn btn-secondary" style={{ 
                padding: '20px', 
                flexDirection: 'column',
                fontSize: '16px'
              }}>
                <span style={{ fontSize: '32px' }}>📊</span>
                Переглянути звіти
              </button>
              
              <button className="btn btn-secondary" style={{ 
                padding: '20px', 
                flexDirection: 'column',
                fontSize: '16px'
              }}>
                <span style={{ fontSize: '32px' }}>📧</span>
                Розсилка
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;