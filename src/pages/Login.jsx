import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));

        if (user && ['admin', 'instructor'].includes(user.role)) {
          navigate('/dashboard');
        } else {
          navigate('/cabinet');
        }
      } catch {
        // Stay on login if saved user payload is invalid.
      }
    }
  }, [navigate]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isPasswordVisible || window.innerWidth < 768) {
        return;
      }

      const allEyes = document.querySelectorAll('.eye');

      allEyes.forEach((eye) => {
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;
        const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
        const maxDistance = eyeRect.width * 0.25;
        const pupilX = Math.cos(angle) * maxDistance;
        const pupilY = Math.sin(angle) * maxDistance;

        let baseX;
        let baseY;

        if (eyeRect.width <= 10) {
          baseX = 3;
          baseY = 3;
        } else if (eyeRect.width <= 12) {
          baseX = 3.5;
          baseY = 3.5;
        } else if (eyeRect.width <= 16) {
          baseX = 4.5;
          baseY = 4.5;
        } else {
          baseX = 5;
          baseY = 5;
        }

        eye.style.setProperty('--pupil-x', `${baseX + pupilX}px`);
        eye.style.setProperty('--pupil-y', `${baseY + pupilY}px`);
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    const characters = document.querySelectorAll('.character');
    characters.forEach((char, index) => {
      char.style.opacity = '0';
      char.style.transform = 'scale(0.5)';

      setTimeout(() => {
        char.style.transition = 'all 0.5s ease';
        char.style.opacity = '1';
        char.style.transform = 'scale(1)';
      }, index * 100);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPasswordVisible]);

  const togglePassword = () => {
    setIsPasswordVisible((prev) => !prev);

    const allCharacters = document.querySelectorAll('.character');
    const shouldHideEyes = !isPasswordVisible;

    allCharacters.forEach((char) => {
      char.classList.toggle('shy', shouldHideEyes);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка входу. Перевірте email та пароль.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    alert('Вхід через Google буде реалізовано');
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <div className="characters">
          <div className="character char1">
            <div className="face">
              <div className="eyes">
                <div className="eye"></div>
                <div className="eye"></div>
              </div>
              <div className="mouth"></div>
            </div>
          </div>

          <div className="character char2">
            <div className="eyes">
              <div className="eye"></div>
              <div className="eye"></div>
            </div>
          </div>

          <div className="character char3">
            <div className="eyes">
              <div className="eye"></div>
              <div className="eye"></div>
            </div>
            <div className="mouth"></div>
          </div>

          <div className="character char4">
            <div className="eye"></div>
            <div className="mouth"></div>
          </div>

          <div className="character char5">
            <div className="eyes">
              <div className="eye"></div>
              <div className="eye"></div>
            </div>
            <div className="mouth"></div>
          </div>
        </div>
      </div>

      <div className="right-side">
        <div className="login-form">
          <div className="logo-container">
            <div className="logo-icon">IT</div>
            <div className="logo-copy">
              <div className="logo-title">IT Academy</div>
              <div className="logo-subtitle">Admin access</div>
            </div>
          </div>

          <h1>Welcome back!</h1>
          <p className="subtitle">Please enter your details to continue.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введіть ваш email"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введіть пароль"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePassword}
                  disabled={loading}
                >
                  {isPasswordVisible ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" id="remember" />
                <span>Remember for 30 days</span>
              </label>
              <button type="button" className="forgot-password">
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Завантаження...' : 'Log in'}
            </button>

            <button
              type="button"
              className="btn btn-google"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Log in with Google
            </button>
          </form>

          <div className="signup-link">
            Don&apos;t have an account? <Link to="/register">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
