import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    showPassword: false,
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const otp = location.state?.otp || '';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain both letters and numbers');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://chemy-lms.onrender.com/api'}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        // Navigate to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">Create a new password for your account</p>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Password Reset Successful</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Redirecting to login page...
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14.5px', lineHeight: 1.6 }}>
                Please enter your new password below. Make sure it's at least 8 characters long.
              </p>

              {error && (
                <div style={{
                  backgroundColor: '#fee',
                  border: '1px solid #fcc',
                  color: '#c33',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type={formData.showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="At least 8 characters (letters + numbers)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type={formData.showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-checkbox" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="showPassword"
                    checked={formData.showPassword}
                    onChange={handleChange}
                    style={{ accentColor: '#C41E3A' }}
                    disabled={isLoading}
                  />
                  Show password
                </label>
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
