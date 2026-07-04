
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Auth.css';

export default function Register() {
  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '900px', textAlign: 'center' }}>
          <div className="auth-header">
            <h1 className="auth-title">Create an account</h1>
            <p className="auth-header-copy">Choose the account type that best describes you and complete a short registration form.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginTop: '22px' }}>
            <Link to="/register/student" className="auth-card-cta" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '22px', borderRadius: '12px', background: 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)', border: '1px solid rgba(59,130,246,0.12)', height: '100%' }}>
                <h3 style={{ marginBottom: '8px', color: '#0F172A' }}>Student</h3>
                <p style={{ margin: 0, color: '#475569' }}>Personal learning, courses, and student dashboard access.</p>
                <div style={{ marginTop: '14px', color: '#2563EB', fontWeight: 700 }}>Sign up →</div>
              </div>
            </Link>

            <Link to="/register/trainer" className="auth-card-cta" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '22px', borderRadius: '12px', background: 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)', border: '1px solid rgba(59,130,246,0.12)' }}>
                <h3 style={{ marginBottom: '8px', color: '#0F172A' }}>Trainer</h3>
                <p style={{ margin: 0, color: '#475569' }}>Create training programs, mentor students, and manage batches.</p>
                <div style={{ marginTop: '14px', color: '#2563EB', fontWeight: 700 }}>Sign up →</div>
              </div>
            </Link>

            <Link to="/register/company" className="auth-card-cta" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '22px', borderRadius: '12px', background: 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)', border: '1px solid rgba(59,130,246,0.12)' }}>
                <h3 style={{ marginBottom: '8px', color: '#0F172A' }}>Company</h3>
                <p style={{ margin: 0, color: '#475569' }}>Team accounts, hiring drives, and company-level analytics.</p>
                <div style={{ marginTop: '14px', color: '#2563EB', fontWeight: 700 }}>Sign up →</div>
              </div>
            </Link>
          </div>

          <div className="auth-footer" style={{ marginTop: '18px' }}>
            <p>Already have an account? <Link to="/login" className="auth-footer-link">Sign in</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
