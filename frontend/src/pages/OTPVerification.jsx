import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://chemy-lms.onrender.com/api'}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        // Navigate to reset password after 2 seconds
        setTimeout(() => {
          navigate('/reset-password', { state: { email, otp: otpCode } });
        }, 2000);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setIsLoading(true);
    setTimeLeft(120);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://chemy-lms.onrender.com/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setError('New OTP sent to your email');
      } else {
        setError('Failed to resend OTP. Please try again.');
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
            <h1 className="auth-title">Verify OTP</h1>
            <p className="auth-subtitle">Enter the 6-digit code sent to your email</p>
          </div>

          {isVerified ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>OTP Verified</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                  Redirecting to password reset page...
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  backgroundColor: error.includes('sent') ? '#efe' : '#fee',
                  border: error.includes('sent') ? '1px solid #cfc' : '1px solid #fcc',
                  color: error.includes('sent') ? '#3c3' : '#c33',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    maxLength="1"
                    whileFocus={{ scale: 1.1 }}
                    transition={{ type: 'spring' }}
                    disabled={isLoading}
                  />
                ))}
              </div>

              <div className="otp-timer">
                Time remaining: <strong>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</strong>
                <br />
                {timeLeft < 120 && timeLeft > 0 && (
                  <span>
                    Didn't receive the code?{' '}
                    <span
                      className="resend"
                      onClick={handleResend}
                      style={{ cursor: timeLeft > 0 ? 'pointer' : 'not-allowed', opacity: timeLeft > 0 ? 1 : 0.5 }}
                    >
                      Resend OTP
                    </span>
                  </span>
                )}
                {timeLeft <= 0 && (
                  <span>
                    Code expired?{' '}
                    <span
                      className="resend"
                      onClick={handleResend}
                      style={{ cursor: 'pointer' }}
                    >
                      Resend OTP
                    </span>
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
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
