import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AddUserModal from '../components/AddUserModal';
import { adminAPI, authAPI, coursesAPI } from '../services/api';
import '../styles/DashboardGlass.css';

const getRoleBadgeMeta = (role) => {
  if (role === 'admin') {
    return {
      label: 'Адмін',
      tone: { bg: '#fff2eb', color: '#f97316' },
    };
  }

  if (role === 'instructor') {
    return {
      label: 'Інструктор',
      tone: { bg: '#fff8dd', color: '#ca8a04' },
    };
  }

  return {
    label: 'Студент',
    tone: { bg: '#eaf3ff', color: '#2563eb' },
  };
};

const getStatusBadgeMeta = (status) => {
  if (status === 'active') {
    return {
      label: 'Активний',
      tone: { bg: '#edfdf2', color: '#16a34a' },
    };
  }

  return {
    label: 'Неактивний',
    tone: { bg: '#fef2f2', color: '#dc2626' },
  };
};

function Dashboard() {
  const savedUser = localStorage.getItem('user');
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  const [loading, setLoading] = useState(!savedUser);
  const [stats, setStats] = useState({ users: 0, courses: 0 });
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        const freshUser = response.data.data.user;
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      }
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const [coursesRes, usersRes] = await Promise.allSettled([
        coursesAPI.getAll(),
        adminAPI.getUsers({ per_page: 1 }),
      ]);

      setStats({
        courses:
          coursesRes.status === 'fulfilled'
            ? coursesRes.value.data.data?.total || 0
            : 0,
        users:
          usersRes.status === 'fulfilled'
            ? usersRes.value.data.data?.total ||
              usersRes.value.data.data?.length ||
              0
            : 0,
      });
    } catch {}
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await adminAPI.getUsers({ per_page: 10 });
      if (res.data.success) {
        setUsers(res.data.data.data || res.data.data || []);
      }
    } catch {
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUserData, fetchUsers]);

  const handleUserSaved = () => {
    setShowAddUser(false);
    navigate('/users');
  };

  if (loading) {
    return (
      <Layout
        headerTitle="Панель адміністратора"
        headerSubtitle="Тут ви керуєте курсами, користувачами, сертифікатами та основними процесами платформи."
      >
        <div className="dashboard-loading">Завантаження...</div>
      </Layout>
    );
  }

  if (!user) return null;

  const statCards = [
    {
      icon: '👥',
      value: stats.users || '—',
      label: 'Користувачів',
      sub: '↑ реальні дані',
      subColor: '#10b981',
      iconBg: 'linear-gradient(135deg, #7c6cff, #a78bfa)',
    },
    {
      icon: '📚',
      value: stats.courses,
      label: 'Активних курсів',
      sub: '↑ реальні дані',
      subColor: '#10b981',
      iconBg: 'linear-gradient(135deg, #67e8f9, #60a5fa)',
    },
    {
      icon: '⭐',
      value: '—',
      label: 'Відгуків',
      sub: 'буде в наступній версії',
      subColor: '#94a3b8',
      iconBg: 'linear-gradient(135deg, #fde68a, #f9a8d4)',
    },
    {
      icon: '💰',
      value: '—',
      label: 'Дохід',
      sub: 'буде в наступній версії',
      subColor: '#94a3b8',
      iconBg: 'linear-gradient(135deg, #86efac, #67e8f9)',
    },
  ];

  const quickActions = [
    {
      icon: '👤',
      label: 'Додати користувача',
      onClick: () => setShowAddUser(true),
    },
    {
      icon: '📊',
      label: 'Переглянути звіти',
      onClick: () => navigate('/analytics'),
    },
    {
      icon: '📧',
      label: 'Розсилка',
      onClick: () => {},
    },
    {
      icon: '🎓',
      label: 'Сертифікати',
      onClick: () => navigate('/certificates'),
    },
  ];

  return (
    <Layout
      headerTitle="Панель адміністратора"
      headerSubtitle="Тут ви керуєте курсами, користувачами, сертифікатами та основними процесами платформи."
    >
      {showAddUser && (
        <AddUserModal onClose={() => setShowAddUser(false)} onSaved={handleUserSaved} />
      )}

      <div className="dashboard-page">
        <section className="dashboard-actions-grid">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="dashboard-action-card glass-card"
            >
              <span className="dashboard-action-icon">{action.icon}</span>
              <span className="dashboard-action-label">{action.label}</span>
            </button>
          ))}
        </section>

        <section className="dashboard-stats-grid">
          {statCards.map((card) => (
            <div key={card.label} className="dashboard-stat-card glass-card">
              <div
                className="dashboard-stat-icon"
                style={{ '--stat-icon-bg': card.iconBg }}
              >
                {card.icon}
              </div>
              <div className="dashboard-stat-value">{card.value}</div>
              <div className="dashboard-stat-label">{card.label}</div>
              <div
                className="dashboard-stat-sub"
                style={{ color: card.subColor }}
              >
                {card.sub}
              </div>
            </div>
          ))}
        </section>

        <section className="dashboard-table-panel glass-panel">
          <div className="dashboard-table-header">
            <div>
              <h2 className="dashboard-table-title">Останні користувачі</h2>
              <p className="dashboard-table-subtitle">
                Швидкий огляд нових профілів та їхнього статусу.
              </p>
            </div>

            <button
              onClick={() => navigate('/users')}
              className="dashboard-link-button"
            >
              Всі користувачі →
            </button>
          </div>

          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  {["ІМ'Я", 'EMAIL', 'РОЛЬ', 'СТАТУС', 'ДАТА РЕЄСТРАЦІЇ', 'ДІЇ'].map(
                    (col) => (
                      <th key={col}>{col}</th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan="6" className="dashboard-table-empty">
                      Завантаження...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="dashboard-table-empty">
                      Користувачів не знайдено
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const roleMeta = getRoleBadgeMeta(u.role);
                    const statusMeta = getStatusBadgeMeta(u.status);

                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="dashboard-user-cell">
                            <div className="dashboard-user-avatar">
                              {u.first_name?.[0]}
                              {u.last_name?.[0]}
                            </div>
                            <span className="dashboard-user-name">
                              {u.full_name || `${u.first_name} ${u.last_name}`}
                            </span>
                          </div>
                        </td>
                        <td className="dashboard-muted-cell">{u.email}</td>
                        <td>
                          <span
                            className="dashboard-badge"
                            style={{
                              '--badge-bg': roleMeta.tone.bg,
                              '--badge-color': roleMeta.tone.color,
                            }}
                          >
                            {roleMeta.label}
                          </span>
                        </td>
                        <td>
                          <span
                            className="dashboard-badge"
                            style={{
                              '--badge-bg': statusMeta.tone.bg,
                              '--badge-color': statusMeta.tone.color,
                            }}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="dashboard-muted-cell">
                          {u.registration_date
                            ? new Date(u.registration_date).toLocaleDateString('uk-UA')
                            : new Date(u.created_at).toLocaleDateString('uk-UA')}
                        </td>
                        <td>
                          <button
                            onClick={() => navigate('/users')}
                            className="dashboard-row-button"
                          >
                            Переглянути
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Dashboard;
