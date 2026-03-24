import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Users from './pages/Users';
import Enrollments from './pages/Enrollments';
import Lessons from './pages/Lessons';
import Quizzes from './pages/Quizzes';
import Assignments  from './pages/Assignments';
import Certificates from './pages/Certificates';
import Categories from './pages/Categories';
import Analytics  from './pages/Analytics';
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
          <Route path="/enrollments" element={<PrivateRoute><Enrollments /></PrivateRoute>} />
          <Route path="/lessons" element={<PrivateRoute><Lessons /></PrivateRoute>} />
          <Route path="/quizzes" element={<PrivateRoute><Quizzes /></PrivateRoute>} />
          <Route path="/assignments" element={<PrivateRoute><Assignments /></PrivateRoute>} />
          <Route path="/certificates" element={<PrivateRoute><Certificates /></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
          <Route path="/analytics"  element={<PrivateRoute><Analytics /></PrivateRoute>} />


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