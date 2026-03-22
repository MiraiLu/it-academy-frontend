import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, coursesAPI, adminAPI } from '../services/api';
import Layout from '../components/Layout';
import AddUserModal from '../components/AddUserModal';

function Dashboard() {
  const savedUser = localStorage.getItem('user');
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  const [loading, setLoading] = useState(!savedUser); // false якщо юзер вже є
  const [stats, setStats] = useState({ users: 0, courses: 0 });
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchStats();
    fetchUsers();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        const freshUser = response.data.data.user;
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser)); // оновлюємо кеш
      }
    } catch {
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
      setStats({
        courses: coursesRes.status === 'fulfilled'
          ? (coursesRes.value.data.data?.total || 0) : 0,
        users: usersRes.status === 'fulfilled'
          ? (usersRes.value.data.data?.total || usersRes.value.data.data?.length || 0) : 0,
      });
    } catch { /* тихо */ }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await adminAPI.getUsers({ per_page: 10 });
      if (res.data.success) {
        setUsers(res.data.data.data || res.data.data || []);
      }
    } catch { /* тихо */ }
    finally { setUsersLoading(false); }
  };

  // Після збереження нового користувача — переходимо до Users
  const handleUserSaved = () => {
    setShowAddUser(false);
    navigate('/users');
  };

  if (loading) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
        Завантаження...
      </div>
    </Layout>
  );
  
  if (!user) return null;

  const statCards = [
    { icon: '👥', value: stats.users || '—', label: 'Користувачів',   sub: '↑ реальні дані',          subColor: '#10b981', iconBg: '#ede9fe' },
    { icon: '📚', value: stats.courses,       label: 'Активних курсів', sub: '↑ реальні дані',          subColor: '#10b981', iconBg: '#dbeafe' },
    { icon: '⭐', value: '—',                 label: 'Відгуків',        sub: 'буде в наступній версії', subColor: '#94a3b8', iconBg: '#fef9c3' },
    { icon: '💰', value: '—',                 label: 'Дохід',           sub: 'буде в наступній версії', subColor: '#94a3b8', iconBg: '#dcfce7' },
  ];

  const quickActions = [
    { icon: '👤', label: 'Додати користувача', onClick: () => setShowAddUser(true) },  // ← відкриває модалку
    { icon: '📊', label: 'Переглянути звіти',  onClick: () => navigate('/analytics') },
    { icon: '📧', label: 'Розсилка',           onClick: () => {} },
    { icon: '🎓', label: 'Сертифікати',        onClick: () => navigate('/certificates') },
  ];

  return (
    <Layout>

      {/* Модалка додавання користувача */}
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSaved={handleUserSaved}
        />
      )}

      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
          Панель адміністратора
        </h1>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 14,
        marginBottom: 28,
      }}>
        {quickActions.map(action => (
          <button
            key={action.label}
            onClick={action.onClick}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 8, padding: '18px 12px',
              background: '#fff', border: '1px solid #e8e8ed',
              borderRadius: 14, cursor: 'pointer',
              fontSize: 13, color: '#4a4a6a', fontWeight: 500,
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <span style={{ fontSize: 28 }}>{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 28,
      }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            background: '#fff', border: '1px solid #e8e8ed',
            borderRadius: 14, padding: 20,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: card.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, marginBottom: 14,
            }}>
              {card.icon}
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#1a1a2e', lineHeight: 1 }}>
              {card.value}
            </div>
            <div style={{ fontSize: 13, color: '#5a6c7d', marginTop: 6 }}>{card.label}</div>
            <div style={{ fontSize: 12, color: card.subColor, marginTop: 4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Users Table */}
      <div style={{ background: '#fff', border: '1px solid #e8e8ed', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #f0f0f5', flexWrap: 'wrap', gap: 12,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
            Останні користувачі
          </h2>
          <button
            onClick={() => navigate('/users')}
            style={{
              padding: '7px 16px', background: 'none',
              border: '1px solid #e8e8ed', borderRadius: 8,
              cursor: 'pointer', fontSize: 13, color: '#5a4fcf', fontWeight: 500,
            }}
          >
            Всі користувачі →
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f5' }}>
                {["ІМ'Я", 'EMAIL', 'РОЛЬ', 'СТАТУС', 'ДАТА РЕЄСТРАЦІЇ', 'ДІЇ'].map(col => (
                  <th key={col} style={{
                    padding: '11px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 600, color: '#94a3b8',
                    letterSpacing: '0.05em', whiteSpace: 'nowrap',
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                  Завантаження...
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                  Користувачів не знайдено
                </td></tr>
              ) : users.map(u => (
                <tr key={u.id}
                  style={{ borderBottom: '1px solid #f8f8fa' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0,
                      }}>
                        {u.first_name?.[0]}{u.last_name?.[0]}
                      </div>
                      <span style={{ fontWeight: 500, color: '#1a1a2e' }}>
                        {u.full_name || `${u.first_name} ${u.last_name}`}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#5a6c7d' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: u.role === 'admin' ? '#fff5f0' : u.role === 'instructor' ? '#fefce8' : '#eff6ff',
                      color: u.role === 'admin' ? '#ff6b35' : u.role === 'instructor' ? '#ca8a04' : '#3b82f6',
                    }}>
                      {u.role === 'admin' ? 'Адмін' : u.role === 'instructor' ? 'Інструктор' : 'Студент'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: u.status === 'active' ? '#f0fdf4' : '#fef2f2',
                      color: u.status === 'active' ? '#16a34a' : '#dc2626',
                    }}>
                      {u.status === 'active' ? 'Активний' : 'Неактивний'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#5a6c7d' }}>
                    {u.registration_date
                      ? new Date(u.registration_date).toLocaleDateString('uk-UA')
                      : new Date(u.created_at).toLocaleDateString('uk-UA')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => navigate('/users')}
                      style={{
                        padding: '6px 14px', background: '#f4f5f7',
                        border: 'none', borderRadius: 8, cursor: 'pointer',
                        fontSize: 12, fontWeight: 500, color: '#4a4a6a',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#e8e8ed'}
                      onMouseLeave={e => e.currentTarget.style.background = '#f4f5f7'}
                    >
                      Переглянути
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </Layout>
  );
}

export default Dashboard;