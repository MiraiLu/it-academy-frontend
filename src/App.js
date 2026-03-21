import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import StudentCabinet from './pages/StudentCabinet';


function App() {
  const getUser = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch { return null; }
  };

  const isAuthenticated = () => localStorage.getItem('auth_token') !== null;

  // Після логіну — редирект залежно від ролі
  const RoleRedirect = () => {
    const user = getUser();
    if (!isAuthenticated()) return <Navigate to="/login" />;
    if (user && ['admin', 'instructor'].includes(user.role)) {
      return <Navigate to="/dashboard" />;
    }
    return <Navigate to="/cabinet" />;
  };

  const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }) => {
    const user = getUser();
    if (!isAuthenticated()) return <Navigate to="/login" />;
    if (!user || !['admin', 'instructor'].includes(user.role)) {
      return <Navigate to="/cabinet" />;
    }
    return children;
  };

  const StudentRoute = ({ children }) => {
    const user = getUser();
    if (!isAuthenticated()) return <Navigate to="/login" />;
    if (user && ['admin', 'instructor'].includes(user.role)) {
      return <Navigate to="/dashboard" />;
    }
    return children;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          {/* Адмін / Викладач */}
          <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/courses" element={<AdminRoute><Courses /></AdminRoute>} />
          <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />

          {/* Студент / Батьки */}
          <Route path="/cabinet" element={<StudentRoute><StudentCabinet /></StudentRoute>} />
          <Route path="/cabinet/course/:id" element={<StudentRoute><StudentCabinet /></StudentRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;