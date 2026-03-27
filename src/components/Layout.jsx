import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/LayoutGlass.css';

const NAV = [
  {
    group: 'ГОЛОВНЕ',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'Курси', path: '/courses', icon: '📚' },
      { label: 'Користувачі', path: '/users', icon: '👥' },
      { label: 'Записи на курси', path: '/enrollments', icon: '📝' },
    ],
  },
  {
    group: 'КОНТЕНТ',
    items: [
      { label: 'Уроки', path: '/lessons', icon: '📖' },
      { label: 'Тести', path: '/quizzes', icon: '❓' },
      { label: 'Завдання', path: '/assignments', icon: '📋' },
      { label: 'Сертифікати', path: '/certificates', icon: '🎓' },
    ],
  },
  {
    group: 'НАЛАШТУВАННЯ',
    items: [
      { label: 'Категорії', path: '/categories', icon: '🏷️' },
      { label: 'Аналітика', path: '/analytics', icon: '📈' },
      { label: 'Налаштування', path: '/settings', icon: '⚙️' },
    ],
  },
];

const PROFILE_ACTIONS = [
  { icon: '👤', label: 'Профіль', path: '/profile' },
  { icon: '⚙️', label: 'Налаштування', path: '/settings' },
];

const isNavItemVisible = (userRole, isLiveOnlyInstructor, path) => {
  if (userRole === 'admin') return true;

  if (isLiveOnlyInstructor) {
    return ['/dashboard', '/courses', '/lessons'].includes(path);
  }

  return [
    '/dashboard',
    '/courses',
    '/lessons',
    '/quizzes',
    '/assignments',
    '/certificates',
  ].includes(path);
};

function Layout({ children, headerTitle, headerSubtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  const userName =
    storedUser?.full_name || localStorage.getItem('user_name') || 'Admin Academy';
  const userRole = storedUser?.role || localStorage.getItem('user_role') || 'admin';
  const isLiveOnlyInstructor = !!storedUser?.is_live_only_instructor;
  const initials = userName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const visibleNav = NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      isNavItemVisible(userRole, isLiveOnlyInstructor, item.path)
    ),
  })).filter((section) => section.items.length > 0);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  return (
    <div className="layout-root">
      <aside className="layout-sidebar glass-panel">
        <div className="layout-logo">
          <div className="layout-logo-icon">IT</div>
          <div className="layout-logo-copy">
            <span className="layout-logo-text">IT Academy</span>
            <span className="layout-logo-badge">{userRole.toUpperCase()}</span>
          </div>
        </div>

        <nav className="layout-nav">
          {visibleNav.map((section) => (
            <div key={section.group} className="layout-nav-section">
              <div className="layout-nav-group">{section.group}</div>

              {section.items.map((item) => {
                const active =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + '/');

                return (
                  <div
                    key={item.path}
                    className={`layout-nav-item ${active ? 'is-active' : ''}`}
                    onClick={() => navigate(item.path)}
                  >
                    <span className="layout-nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        <div onClick={handleLogout} className="layout-nav-item layout-logout">
          <span className="layout-nav-icon">🚪</span>
          <span>Вийти</span>
        </div>
      </aside>

      <div className="layout-main">
        <header className="layout-header glass-panel">
          <div className="layout-header-left">
            {headerTitle ? (
              <div className="layout-header-copy">
                <h1 className="layout-header-title">{headerTitle}</h1>
                {headerSubtitle ? (
                  <p className="layout-header-subtitle">{headerSubtitle}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="layout-user-wrap">
            <div
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="layout-user-trigger"
            >
              <span className="layout-user-name">{userName}</span>
              <div className="layout-avatar">{initials}</div>
              <span className="layout-caret">▾</span>
            </div>

            {dropdownOpen && (
              <>
                <div
                  onClick={() => setDropdownOpen(false)}
                  className="layout-dropdown-overlay"
                />

                <div className="layout-dropdown glass-dropdown">
                  <div className="layout-dropdown-head">
                    <div className="layout-dropdown-name">{userName}</div>
                    <div className="layout-dropdown-role">
                      {userRole === 'admin' ? 'Адміністратор' : 'Викладач'}
                    </div>
                  </div>

                  {PROFILE_ACTIONS.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(item.path);
                      }}
                      className="layout-dropdown-item"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}

                  <div className="layout-dropdown-divider" />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="layout-dropdown-item is-danger"
                  >
                    <span>🚪</span>
                    <span>Вийти</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="layout-content glass-panel">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
