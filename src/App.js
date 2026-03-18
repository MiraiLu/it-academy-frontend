import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';  

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('auth_token') !== null;
  };

  const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/courses" element={<Courses />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                  <Dashboard />
              </PrivateRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;