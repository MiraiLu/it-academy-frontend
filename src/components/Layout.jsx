import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ─── Пункти меню ────────────────────────────────────────────
const NAV = [
  {
    group: 'ГОЛОВНЕ',
    items: [
      { label: 'Dashboard',        path: '/dashboard',   icon: '📊' },
      { label: 'Курси',            path: '/courses',     icon: '📚' },
      { label: 'Користувачі',      path: '/users',       icon: '👥' },
      { label: 'Записи на курси',  path: '/enrollments', icon: '📝' },
    ],
  },
  {
    group: 'КОНТЕНТ',
    items: [
      { label: 'Уроки',       path: '/lessons',      icon: '📖' },
      { label: 'Тести',       path: '/quizzes',      icon: '❓' },
      { label: 'Завдання',    path: '/assignments',  icon: '📋' },
      { label: 'Сертифікати', path: '/certificates', icon: '🎓' },
    ],
  },
  {
    group: 'НАЛАШТУВАННЯ',
    items: [
      { label: 'Категорії',   path: '/categories', icon: '🏷️' },
      { label: 'Аналітика',   path: '/analytics',  icon: '📈' },
      { label: 'Налаштування',path: '/settings',   icon: '⚙️' },
    ],
  },
];

const isNavItemVisible = (userRole, isLiveOnlyInstructor, path) => {
  if (userRole === 'admin') return true;

  if (isLiveOnlyInstructor) {
    return ['/dashboard', '/courses', '/lessons'].includes(path);
  }

  return ['/dashboard', '/courses', '/lessons', '/quizzes', '/assignments', '/certificates'].includes(path);
};

// ─── Стилі ──────────────────────────────────────────────────
const S = {
  root: {
    display: 'flex',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: '#f4f5f7',
    overflow: 'hidden',
  },
  sidebar: {
    width: '220px',
    flexShrink: 0,
    background: '#fff',
    borderRight: '1px solid #e8e8ed',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    overflowY: 'auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '18px 20px',
    borderBottom: '1px solid #f0f0f5',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: '#f97316',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '15px',
  },
  logoText: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  nav: {
    padding: '12px 0',
    flex: 1,
  },
  group: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#a0a0b8',
    letterSpacing: '0.08em',
    padding: '14px 20px 6px',
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 20px',
    fontSize: '14px',
    fontWeight: active ? '600' : '400',
    color: active ? '#5a4fcf' : '#4a4a6a',
    background: active ? 'rgba(90,79,207,0.08)' : 'transparent',
    borderLeft: active ? '3px solid #5a4fcf' : '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
    userSelect: 'none',
  }),
  navIcon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center',
    flexShrink: 0,
  },
  // Хедер
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    height: '60px',
    background: '#fff',
    borderBottom: '1px solid #e8e8ed',
    flexShrink: 0,
  },
  adminBadge: {
    background: '#ef4444',
    color: 'white',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 9px',
    borderRadius: '6px',
    letterSpacing: '0.05em',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#5a4fcf',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
    flexShrink: 0,
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a2e',
  },
  // Контент
  mainWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: '28px',
    overflowY: 'auto',
    height: 0,
  },
};

// ─── Компонент ──────────────────────────────────────────────
function Layout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  // Ім'я з localStorage
  const userName  = storedUser?.full_name || localStorage.getItem('user_name') || 'Admin Academy';
  const userRole  = storedUser?.role || localStorage.getItem('user_role') || 'admin';
  const isLiveOnlyInstructor = !!storedUser?.is_live_only_instructor;
  const initials  = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const visibleNav = NAV.map(section => ({
    ...section,
    items: section.items.filter(item => isNavItemVisible(userRole, isLiveOnlyInstructor, item.path)),
  })).filter(section => section.items.length > 0);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  return (
    <div style={S.root}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside style={S.sidebar}>
        {/* Лого */}
        <div style={S.logo}>
          <div style={S.logoIcon}>IT</div>
          <span style={S.logoText}>IT Academy</span>
        </div>

        {/* Навігація */}
        <nav style={S.nav}>
          {visibleNav.map(section => (
            <div key={section.group}>
              <div style={S.group}>{section.group}</div>
              {section.items.map(item => {
                const active = location.pathname === item.path ||
                               location.pathname.startsWith(item.path + '/');
                return (
                  <div
                    key={item.path}
                    style={S.navItem(active)}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = '#f5f5fb';
                        e.currentTarget.style.color = '#5a4fcf';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#4a4a6a';
                      }
                    }}
                  >
                    <span style={S.navIcon}>{item.icon}</span>
                    {item.label}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Кнопка виходу */}
        <div
          onClick={handleLogout}
          style={{
            ...S.navItem(false),
            marginBottom: '8px',
            color: '#dc2626',
            borderTop: '1px solid #f0f0f5',
            paddingTop: '14px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={S.navIcon}>🚪</span>
          Вийти
        </div>
      </aside>

      {/* ── Права частина ───────────────────────────────── */}
      <div style={S.mainWrap}>

        {/* Хедер */}
        <header style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={S.adminBadge}>{userRole.toUpperCase()}</span>
          </div>
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <span style={S.userName}>{userName}</span>
              <div style={S.avatar}>{initials}</div>
              <span style={{ color: '#a0a0b8', fontSize: '12px' }}>▾</span>
            </div>

            {dropdownOpen && (
              <>
                {/* Клік поза меню — закриває */}
                <div
                  onClick={() => setDropdownOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                />
                <div style={{
                  position: 'absolute', top: '110%', right: 0,
                  background: '#fff', border: '1px solid #e2e8f0',
                  borderRadius: 12, padding: '8px 0',
                  minWidth: 220, zIndex: 100,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}>
                  {/* Шапка меню */}
                  <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{userName}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      {userRole === 'admin' ? 'Адміністратор' : 'Викладач'}
                    </div>
                  </div>

                  {/* Пункти меню */}
                  {[
                    { icon: '👤', label: 'Профіль',       path: '/profile'  },
                    { icon: '⚙️', label: 'Налаштування',  path: '/settings' },
                  ].map(item => (
                    <button key={item.label}
                      onClick={() => { setDropdownOpen(false); navigate(item.path); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '10px 16px',
                        border: 'none', background: 'none',
                        cursor: 'pointer', fontSize: 14, color: '#1a1a2e', textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span>{item.icon}</span> {item.label}
                    </button>
                  ))}

                  <div style={{ borderTop: '1px solid #f0f0f0', margin: '4px 0' }} />

                  {/* Вийти */}
                  <button
                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '10px 16px',
                      border: 'none', background: 'none',
                      cursor: 'pointer', fontSize: 14, color: '#e53e3e', textAlign: 'left',
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
        </header>

        {/* Вміст сторінки */}
        <main style={S.content}>
          {children}
        </main>

      </div>
    </div>
  );
}

export default Layout;
