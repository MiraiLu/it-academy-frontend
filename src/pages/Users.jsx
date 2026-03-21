import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, authAPI } from '../services/api';
import '../styles/Dashboard.css';

function Users() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'student', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [viewUser, setViewUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers({ per_page: 50 });
      if (res.data.success) {
        setUsers(res.data.data.data || res.data.data || []);
      }
    } catch (err) {
      console.error('fetchUsers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filtered = users.filter(u => {
    const matchSearch = search === '' ||
      (u.full_name || `${u.first_name} ${u.last_name}`).toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === '' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Завантаження...</p>
      </div>
    </div>
  );

    const openModal = (u) => {
    if (u) {
        setEditUser(u);
        setForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, password: '', role: u.role, status: u.status });
    } else {
        setEditUser(null);
        setForm({ first_name: '', last_name: '', email: '', password: '', role: 'student', status: 'active' });
    }
    setFormError('');
    setModal(true);
    };

    const closeModal = () => { setModal(false); setEditUser(null); setFormError(''); };

    const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.email) {
        setFormError("Ім'я, прізвище та email обов'язкові");
        return;
    }
    if (!editUser && !form.password) {
        setFormError('Пароль обов\'язковий для нового користувача');
        return;
    }
    setSaving(true);
    try {
        if (editUser) {
        const data = { ...form };
        if (!data.password) delete data.password;
        await adminAPI.updateUser(editUser.id, data);
        } else {
        await adminAPI.createUser(form);
        }
        await fetchUsers();
        closeModal();
    } catch (err) {
        setFormError(err.response?.data?.message || 'Помилка збереження');
    } finally {
        setSaving(false);
    }
    };

    const openView = (u) => setViewUser(u);
    const closeView = () => setViewUser(null);

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">IT</div>
            <span className="logo-text">IT Academy</span>
            {user?.role === 'admin' && <span className="admin-badge">ADMIN</span>}
          </div>
          <div className="header-controls">
            <div className="user-menu-wrap" style={{ position: 'relative' }}>
              <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: 'pointer' }}>
                <div className="user-avatar">{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
                <span style={{ fontWeight: 500 }}>{user?.full_name}</span>
                <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>▾</span>
              </div>
              {dropdownOpen && (
                <>
                  <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                  <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '8px 0', minWidth: 200, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                    <div style={{ padding: '8px 16px 10px', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#2c3e50' }}>{user?.full_name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email}</div>
                    </div>
                    {[{ icon: '👤', label: 'Профіль' }, { icon: '⚙️', label: 'Налаштування' }].map(item => (
                      <button key={item.label} onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#2c3e50' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <span>{item.icon}</span> {item.label}
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid #f0f0f0', margin: '4px 0' }} />
                    <button onClick={() => { setDropdownOpen(false); handleLogout(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#e53e3e' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <span>🚪</span> Вийти
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Головне</h3>
            <ul className="sidebar-menu">
              <li onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}>
                  <span className="sidebar-icon">📊</span> Dashboard
                </span>
              </li>
              <li onClick={() => navigate('/courses')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}>
                  <span className="sidebar-icon">📚</span> Курси
                </span>
              </li>
              <li style={{ cursor: 'pointer' }}>
                <span className="active" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}>
                  <span className="sidebar-icon">👥</span> Користувачі
                </span>
              </li>
              <li onClick={() => navigate('/enrollments')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}>
                  <span className="sidebar-icon">📝</span> Записи на курси
                </span>
              </li>
            </ul>
          </div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Контент</h3>
            <ul className="sidebar-menu">
              {[['📖', 'Уроки', '/lessons'], ['❓', 'Тести', '/quizzes'], ['📄', 'Завдання', '/assignments'], ['🎓', 'Сертифікати', '/certificates']].map(([icon, label, path]) => (
                <li key={path} onClick={() => navigate(path)} style={{ cursor: 'pointer' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}>
                    <span className="sidebar-icon">{icon}</span> {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Налаштування</h3>
            <ul className="sidebar-menu">
              {[['🏷️', 'Категорії', '/categories'], ['📈', 'Аналітика', '/analytics'], ['⚙️', 'Налаштування', '/settings']].map(([icon, label, path]) => (
                <li key={path} onClick={() => navigate(path)} style={{ cursor: 'pointer' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}>
                    <span className="sidebar-icon">{icon}</span> {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">
        <div className="page-header" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="page-title">Користувачі</h1>
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', width: 'auto', flexShrink: 0 }} onClick={() => openModal(null)}>
            ➕ Додати користувача
          </button>
        </div>  

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Всього', count: users.length, color: '#6366f1' },
              { label: 'Студентів', count: users.filter(u => u.role === 'student').length, color: '#3b82f6' },
              { label: 'Викладачів', count: users.filter(u => u.role === 'instructor').length, color: '#f59e0b' },
              { label: 'Адмінів', count: users.filter(u => u.role === 'admin').length, color: '#10b981' },
            ].map(item => (
              <div key={item.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: item.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {item.label === 'Всього' ? '👥' : item.label === 'Студентів' ? '🎓' : item.label === 'Викладачів' ? '👨‍🏫' : '⚙️'}
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#2c3e50' }}>{item.count}</div>
                  <div style={{ fontSize: 13, color: '#5a6c7d' }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="data-table fade-in">
            <div className="table-header">
              <h2 className="table-title">Всі користувачі ({filtered.length})</h2>
              <div className="table-filters">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Пошук по імені або email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  <option value="">Всі ролі</option>
                  <option value="student">Студенти</option>
                  <option value="instructor">Викладачі</option>
                  <option value="admin">Адміни</option>
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
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                    {search || roleFilter ? 'Нікого не знайдено' : 'Користувачів немає'}
                  </td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
                          {u.first_name?.[0]}{u.last_name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{u.full_name || `${u.first_name} ${u.last_name}`}</div>
                          {u.phone && <div style={{ fontSize: 12, color: '#94a3b8' }}>{u.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: u.role === 'admin' ? '#fff5f0' : u.role === 'instructor' ? '#fefce8' : '#eff6ff',
                        color: u.role === 'admin' ? '#ff6b35' : u.role === 'instructor' ? '#ca8a04' : '#3b82f6'
                      }}>
                        {u.role === 'admin' ? 'Адмін' : u.role === 'instructor' ? 'Викладач' : 'Студент'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                        {u.status === 'active' ? 'Активний' : 'Неактивний'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: '#5a6c7d' }}>
                      {u.registration_date
                        ? new Date(u.registration_date).toLocaleDateString('uk-UA')
                        : new Date(u.created_at).toLocaleDateString('uk-UA')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                          onClick={() => openView(u)}
                        >
                          👁 Деталі
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                          onClick={() => openModal(u)}
                        >
                          ✏️ Змінити
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      {/* Modal */}
        {modal && (
        <>
            <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} />
            <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: '#fff', borderRadius: 16, padding: 28, width: 480, maxWidth: '90vw',
            zIndex: 201, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto'
            }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#2c3e50' }}>
                {editUser ? '✏️ Редагувати користувача' : '➕ Новий користувач'}
            </h2>

            {formError && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {formError}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                <label style={{ fontSize: 12, color: '#5a6c7d', marginBottom: 4, display: 'block' }}>Ім'я *</label>
                <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
                    placeholder="Ім'я" />
                </div>
                <div>
                <label style={{ fontSize: 12, color: '#5a6c7d', marginBottom: 4, display: 'block' }}>Прізвище *</label>
                <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
                    placeholder="Прізвище" />
                </div>
            </div>

            <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#5a6c7d', marginBottom: 4, display: 'block' }}>Email *</label>
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
                placeholder="email@example.com" type="email" />
            </div>

            <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#5a6c7d', marginBottom: 4, display: 'block' }}>
                Пароль {editUser ? '(залиш порожнім щоб не змінювати)' : '*'}
                </label>
                <input value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
                placeholder="••••••••" type="password" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                <div>
                <label style={{ fontSize: 12, color: '#5a6c7d', marginBottom: 4, display: 'block' }}>Роль</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                    <option value="student">Студент</option>
                    <option value="instructor">Викладач</option>
                    <option value="admin">Адмін</option>
                </select>
                </div>
                <div>
                <label style={{ fontSize: 12, color: '#5a6c7d', marginBottom: 4, display: 'block' }}>Статус</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                    <option value="active">Активний</option>
                    <option value="inactive">Неактивний</option>
                    <option value="blocked">Заблокований</option>
                </select>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={closeModal} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
                Скасувати
                </button>
                <button onClick={handleSave} className="btn btn-primary" style={{ padding: '10px 20px' }} disabled={saving}>
                {saving ? 'Збереження...' : editUser ? 'Зберегти зміни' : 'Створити'}
                </button>
            </div>
            </div>
        </>
        )}

        {/* View User Card */}
        {viewUser && (
        <>
            <div onClick={closeView} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} />
            <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: '#fff', borderRadius: 16, padding: 28, width: 520, maxWidth: '90vw',
            zIndex: 201, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto'
            }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 24, fontWeight: 700
                }}>
                    {viewUser.first_name?.[0]}{viewUser.last_name?.[0]}
                </div>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2c3e50', margin: 0 }}>
                    {viewUser.full_name || `${viewUser.first_name} ${viewUser.last_name}`}
                    </h2>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{viewUser.email}</div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                    <span style={{
                        padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: viewUser.role === 'admin' ? '#fff5f0' : viewUser.role === 'instructor' ? '#fefce8' : '#eff6ff',
                        color: viewUser.role === 'admin' ? '#ff6b35' : viewUser.role === 'instructor' ? '#ca8a04' : '#3b82f6'
                    }}>
                        {viewUser.role === 'admin' ? 'Адмін' : viewUser.role === 'instructor' ? 'Викладач' : 'Студент'}
                    </span>
                    <span style={{
                        padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: viewUser.status === 'active' ? '#f0fdf4' : '#fef2f2',
                        color: viewUser.status === 'active' ? '#16a34a' : '#dc2626'
                    }}>
                        {viewUser.status === 'active' ? '● Активний' : '● Неактивний'}
                    </span>
                    </div>
                </div>
                </div>
                <button onClick={closeView} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8', padding: 4 }}>✕</button>
            </div>

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                { icon: '📅', label: 'Дата реєстрації', value: viewUser.registration_date ? new Date(viewUser.registration_date).toLocaleDateString('uk-UA') : new Date(viewUser.created_at).toLocaleDateString('uk-UA') },
                { icon: '🔐', label: 'Останній вхід', value: viewUser.last_login ? new Date(viewUser.last_login).toLocaleDateString('uk-UA') : 'Ще не входив' },
                { icon: '📱', label: 'Телефон', value: viewUser.phone || 'Не вказано' },
                { icon: '🌐', label: 'Мова', value: viewUser.language === 'uk' ? '🇺🇦 Українська' : viewUser.language || 'Не вказано' },
                { icon: '✉️', label: 'Email підтвержено', value: viewUser.email_verified ? '✅ Так' : '❌ Ні' },
                { icon: '📞', label: 'Телефон підтвержено', value: viewUser.phone_verified ? '✅ Так' : '❌ Ні' },
                ].map(item => (
                <div key={item.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{item.icon} {item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#2c3e50' }}>{item.value}</div>
                </div>
                ))}
            </div>

            {/* Bio */}
            {viewUser.bio && (
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>💬 Про себе</div>
                <div style={{ fontSize: 14, color: '#2c3e50', lineHeight: 1.6 }}>{viewUser.bio}</div>
                </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                { label: 'Курсів', value: viewUser.statistics?.enrolled_courses ?? '—', color: '#6366f1' },
                { label: 'Завершено', value: viewUser.statistics?.completed_courses ?? '—', color: '#10b981' },
                { label: 'Сертифікатів', value: viewUser.statistics?.certificates ?? '—', color: '#f59e0b' },
                ].map(item => (
                <div key={item.label} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 10, padding: '14px 10px' }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{item.label}</div>
                </div>
                ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={closeView} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
                Закрити
                </button>
            </div>
            </div>
        </>
        )}
    </div>
  );
}

export default Users;