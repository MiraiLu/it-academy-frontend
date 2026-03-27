import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, authAPI } from '../services/api';
import Layout from '../components/Layout';
import AddUserModal from '../components/AddUserModal';
import ModalPortal from '../components/ModalPortal';

// ─── Стилі ──────────────────────────────────────────────────
const S = {
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1a1a2e',
    margin: 0,
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    borderRadius: 50,
    padding: '11px 24px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 14px rgba(102,126,234,0.35)',
  },
  btnSecondary: {
    background: '#f4f5f7',
    color: '#4a4a6a',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  // Stat cards
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    background: '#fff',
    borderRadius: 14,
    padding: '16px 20px',
    border: '1px solid #e8e8ed',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  statIcon: (color) => ({
    width: 46,
    height: 46,
    borderRadius: 12,
    background: color + '20',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
  }),
  statCount: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1a1a2e',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 3,
  },
  // Table block
  tableBlock: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #e8e8ed',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    borderBottom: '1px solid #f0f0f5',
    flexWrap: 'wrap',
    gap: 12,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a1a2e',
    margin: 0,
  },
  filtersRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  searchInput: {
    padding: '8px 14px',
    border: '1.5px solid #e8e8ed',
    borderRadius: 10,
    fontSize: 13,
    color: '#1a1a2e',
    outline: 'none',
    width: 240,
    background: '#fafafa',
  },
  roleSelect: {
    padding: '8px 12px',
    border: '1.5px solid #e8e8ed',
    borderRadius: 10,
    fontSize: 13,
    color: '#1a1a2e',
    outline: 'none',
    background: '#fafafa',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderBottom: '1px solid #f0f0f5',
    background: '#fafafa',
  },
  td: {
    padding: '14px 24px',
    borderBottom: '1px solid #f7f7fb',
    color: '#2c3e50',
    verticalAlign: 'middle',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  roleBadge: (role) => ({
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    display: 'inline-block',
    background: role === 'admin' ? '#fff5f0' : role === 'instructor' ? '#fefce8' : '#eff6ff',
    color: role === 'admin' ? '#f97316' : role === 'instructor' ? '#ca8a04' : '#3b82f6',
  }),
  statusBadge: (active) => ({
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    display: 'inline-block',
    background: active ? '#f0fdf4' : '#fef2f2',
    color: active ? '#16a34a' : '#dc2626',
  }),
  actionsCell: {
    display: 'flex',
    gap: 6,
  },
  emptyRow: {
    textAlign: 'center',
    padding: 40,
    color: '#9ca3af',
    fontSize: 14,
  },
  // Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    backdropFilter: 'blur(4px)',
    zIndex: 200,
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    background: '#fff',
    borderRadius: 18,
    padding: 28,
    width: 480,
    maxWidth: '90vw',
    zIndex: 201,
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#5a6c7d',
    marginBottom: 5,
    display: 'block',
  },
  formInput: {
    width: '100%',
    padding: '10px 13px',
    border: '1.5px solid #e8e8ed',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    background: '#fafafa',
    boxSizing: 'border-box',
    marginBottom: 14,
    color: '#1a1a2e',
  },
  formSelect: {
    width: '100%',
    padding: '10px 13px',
    border: '1.5px solid #e8e8ed',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    background: '#fafafa',
    boxSizing: 'border-box',
    marginBottom: 14,
    cursor: 'pointer',
    color: '#1a1a2e',
  },
  errorBox: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  btnCancel: {
    background: '#f4f5f7',
    border: 'none',
    borderRadius: 10,
    padding: '10px 20px',
    fontSize: 14,
    color: '#6b7280',
    cursor: 'pointer',
  },
  btnSave: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 22px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

const STAT_ITEMS = (users) => [
  { label: 'Всього',     count: users.length,                                 color: '#6366f1', icon: '👥' },
  { label: 'Студентів',  count: users.filter(u => u.role === 'student').length, color: '#3b82f6', icon: '🎓' },
  { label: 'Викладачів', count: users.filter(u => u.role === 'instructor').length, color: '#f59e0b', icon: '👨‍🏫' },
  { label: 'Адмінів',   count: users.filter(u => u.role === 'admin').length,  color: '#10b981', icon: '⚙️' },
];

function Users() {
  const navigate = useNavigate();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal]           = useState(false);
  const [editUser, setEditUser]     = useState(null);
  const [form, setForm]             = useState({ first_name: '', last_name: '', email: '', password: '', role: 'student', status: 'active' });
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');
  const [viewUser, setViewUser]     = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers({ per_page: 50 });
      if (res.data.success) setUsers(res.data.data.data || res.data.data || []);
    } catch (err) {
      console.error('fetchUsers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const name = (u.full_name || `${u.first_name} ${u.last_name}`).toLowerCase();
    return (!q || name.includes(q) || u.email.toLowerCase().includes(q))
      && (!roleFilter || u.role === roleFilter);
  });

  const openModal = (u) => {
    setEditUser(u || null);
    setForm(u
      ? { first_name: u.first_name, last_name: u.last_name, email: u.email, password: '', role: u.role, status: u.status }
      : { first_name: '', last_name: '', email: '', password: '', role: 'student', status: 'active' }
    );
    setFormError('');
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditUser(null); setFormError(''); };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.email) {
      setFormError("Ім'я, прізвище та email обов'язкові"); return;
    }
    if (!editUser && !form.password) {
      setFormError('Пароль обов\'язковий для нового користувача'); return;
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

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <p style={{ color: '#9ca3af' }}>Завантаження...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>

      {/* Шапка */}
      <div style={S.pageHeader}>
        <h1 style={S.pageTitle}>Користувачі</h1>
        <button style={S.btnPrimary} onClick={() => openModal(null)}>
          + Додати користувача
        </button>
      </div>

      {/* Статистика */}
      <div style={S.statsGrid}>
        {STAT_ITEMS(users).map(item => (
          <div key={item.label} style={S.statCard}>
            <div style={S.statIcon(item.color)}>{item.icon}</div>
            <div>
              <div style={S.statCount}>{item.count}</div>
              <div style={S.statLabel}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Таблиця */}
      <div style={S.tableBlock}>
        <div style={S.tableHeader}>
          <h2 style={S.tableTitle}>Всі користувачі ({filtered.length})</h2>
          <div style={S.filtersRow}>
            <input
              style={S.searchInput}
              placeholder="Пошук по імені або email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select style={S.roleSelect} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">Всі ролі</option>
              <option value="student">Студенти</option>
              <option value="instructor">Викладачі</option>
              <option value="admin">Адміни</option>
            </select>
          </div>
        </div>

        <table style={S.table}>
          <thead>
            <tr>
              {["Ім'я", 'Email', 'Роль', 'Статус', 'Дата реєстрації', 'Дії'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={S.emptyRow}>
                  {search || roleFilter ? 'Нікого не знайдено' : 'Користувачів немає'}
                </td>
              </tr>
            ) : filtered.map(u => (
              <tr key={u.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={S.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={S.avatar}>
                      {u.first_name?.[0]}{u.last_name?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {u.full_name || `${u.first_name} ${u.last_name}`}
                      </div>
                      {u.phone && <div style={{ fontSize: 12, color: '#9ca3af' }}>{u.phone}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ ...S.td, color: '#6b7280', fontSize: 13 }}>{u.email}</td>
                <td style={S.td}>
                  <span style={S.roleBadge(u.role)}>
                    {u.role === 'admin' ? 'Адмін' : u.role === 'instructor' ? 'Викладач' : 'Студент'}
                  </span>
                </td>
                <td style={S.td}>
                  <span style={S.statusBadge(u.status === 'active')}>
                    {u.status === 'active' ? '● Активний' : '● Неактивний'}
                  </span>
                </td>
                <td style={{ ...S.td, fontSize: 13, color: '#6b7280' }}>
                  {u.registration_date
                    ? new Date(u.registration_date).toLocaleDateString('uk-UA')
                    : new Date(u.created_at).toLocaleDateString('uk-UA')}
                </td>
                <td style={S.td}>
                  <div style={S.actionsCell}>
                    <button style={S.btnSecondary} onClick={() => setViewUser(u)}>
                      👁 Деталі
                    </button>
                    <button style={S.btnSecondary} onClick={() => openModal(u)}>
                      ✏️ Змінити
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal: Створення / Редагування ────────────────── */}
      {modal && (
        <AddUserModal
          onClose={closeModal}
          onSaved={() => { closeModal(); fetchUsers(); }}
          editUser={editUser}
        />
      )}

      {/* ── Modal: Деталі користувача ──────────────────────── */}
      {viewUser && (
        <ModalPortal>
          <div className="app-modal-overlay" style={S.overlay} onClick={(e) => { if (e.target === e.currentTarget) setViewUser(null); }}>
          <div className="app-modal-card app-modal-card--medium" style={{ ...S.modal, width: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ ...S.avatar, width: 60, height: 60, fontSize: 22 }}>
                  {viewUser.first_name?.[0]}{viewUser.last_name?.[0]}
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                    {viewUser.full_name || `${viewUser.first_name} ${viewUser.last_name}`}
                  </h2>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{viewUser.email}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <span style={S.roleBadge(viewUser.role)}>
                      {viewUser.role === 'admin' ? 'Адмін' : viewUser.role === 'instructor' ? 'Викладач' : 'Студент'}
                    </span>
                    <span style={S.statusBadge(viewUser.status === 'active')}>
                      {viewUser.status === 'active' ? '● Активний' : '● Неактивний'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewUser(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>✕</button>
            </div>

            <div className="app-form-grid" style={{ gap: 10, marginBottom: 18 }}>
              {[
                { icon: '📅', label: 'Дата реєстрації', value: viewUser.registration_date ? new Date(viewUser.registration_date).toLocaleDateString('uk-UA') : new Date(viewUser.created_at).toLocaleDateString('uk-UA') },
                { icon: '🔐', label: 'Останній вхід', value: viewUser.last_login ? new Date(viewUser.last_login).toLocaleDateString('uk-UA') : 'Ще не входив' },
                { icon: '📱', label: 'Телефон', value: viewUser.phone || 'Не вказано' },
                { icon: '🌐', label: 'Мова', value: viewUser.language === 'uk' ? '🇺🇦 Українська' : viewUser.language || 'Не вказано' },
                { icon: '✉️', label: 'Email підтверджено', value: viewUser.email_verified ? '✅ Так' : '❌ Ні' },
                { icon: '📞', label: 'Тел. підтверджено', value: viewUser.phone_verified ? '✅ Так' : '❌ Ні' },
              ].map(item => (
                <div key={item.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>{item.icon} {item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a2e' }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div className="app-form-grid--stats" style={{ marginBottom: 22 }}>
              {[
                { label: 'Курсів',     value: viewUser.statistics?.enrolled_courses  ?? '—', color: '#6366f1' },
                { label: 'Завершено',  value: viewUser.statistics?.completed_courses ?? '—', color: '#10b981' },
                { label: 'Сертифікатів', value: viewUser.statistics?.certificates   ?? '—', color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 10, padding: '14px 10px' }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{item.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={S.btnCancel} onClick={() => setViewUser(null)}>Закрити</button>
              <button style={S.btnSave} onClick={() => { setViewUser(null); openModal(viewUser); }}>
                ✏️ Редагувати
              </button>
            </div>
          </div>
          </div>
        </ModalPortal>
      )}

    </Layout>
  );
}

export default Users;
