import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        // Navigate to OTP verification after 3 seconds
        setTimeout(() => {
          navigate('/otp-verification', { state: { email } });
        }, 3000);
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please check your connection and try again.');
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
            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtitle">
              Remember your password? <Link to="/login">Sign in</Link>
            </p>
          </div>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Check Your Email</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  We've sent an OTP to <strong>{email}</strong>
                </p>
                <p style={{ color: 'var(--border-color)', marginBottom: '30px', fontSize: '13.5px' }}>
                  If you don't see the email, check your spam folder.
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Redirecting to OTP verification...
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14.5px', lineHeight: 1.6 }}>
                Enter your email address and we'll send you an OTP to reset your password.
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
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
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
