import { useState } from 'react';
import { motion } from 'framer-motion';

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/useAuth';
import '../styles/Auth.css';
import '../styles/Hero.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    role: 'Student',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'role') {
      if (!value) {
        error = 'Please select a role to continue.';
      }
    } else if (name === 'email') {
      if (!value) {
        error = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Please enter a valid email address.';
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'Password is required.';
      } else if (value.length < 8) {
        error = 'Password must be at least 8 characters.';
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val,
    }));

    const fieldError = validateField(name, val);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    // Validate role, email, and password
    const roleError = validateField('role', formData.role);
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    
    if (roleError || emailError || passwordError) {
      setErrors({ role: roleError, email: emailError, password: passwordError });
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(formData);
      setIsSuccess(true);
      setTimeout(() => {
        if (user.role === 'Super Admin') {
          navigate('/admin');
        } else {
          navigate(`/app/${user.dashboard}`);
        }
      }, 650);
    } catch (err) {
      setServerError(err.message || 'Unable to sign in. Please use your registered email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="hero" style={{ minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Top Left Branding */}
      <div style={{ position: 'absolute', top: '30px', left: '40px', display: 'flex', alignItems: 'center', gap: '2px', zIndex: 10 }}>
        <img src="/chemy2.png" alt="Chemy Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
        <h1 style={{ 
          margin: 0, 
          fontSize: '28px', 
          fontWeight: 800, 
          letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #1E3A8A 0%, #60A5FA 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3)) drop-shadow(0 0 3px rgba(59, 130, 246, 0.5))'
        }}>Chemy</h1>
      </div>

      <motion.div 
        className="hero-content" 
        style={{ width: '100%', maxWidth: '100%', marginTop: 'auto', marginBottom: 'auto' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >

        
        <div className="auth-container">
          <motion.div
            className="auth-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
          <div className="auth-header">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-header-copy">Sign in to your account to access the learning dashboard and manage your courses.</p>
          </div>

          {serverError && (
            <div style={{ background: '#fff1f2', color: '#c41e3a', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 500, border: '1px solid #fecdd3' }}>
              ⚠️ {serverError}
            </div>
          )}

          {isSuccess && (
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '15px', fontWeight: 600, textAlign: 'center', border: '1px solid #bbf7d0' }}>
              ✓ Login successful! Redirecting to home...
            </div>
          )}

          <form onSubmit={handleSubmit}>


            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper password-input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8-3.38 6.1-8.64 8.8-11 8.8"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>


          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}