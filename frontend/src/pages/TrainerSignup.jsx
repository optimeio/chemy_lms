import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Auth.css';

function Field({ label, required, error, children }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="text-[#4338CA]">*</span>}
      </label>
      {children}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

const inputClass = 'form-input';

export default function TrainerSignup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    expertise: '',
    experience: '',
    linkedin: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full Name is required.';
        break;
      case 'email':
        if (!value) error = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address.';
        break;
      case 'phone':
        if (!value) error = 'Phone number is required.';
        else if (!/^\d{10}$/.test(value)) error = 'Enter a valid 10-digit number.';
        break;
      case 'password':
        if (!value) error = 'Password is required.';
        else if (value.length < 8) error = 'Password must be at least 8 characters.';
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password.';
        else if (value !== formData.password) error = 'Passwords do not match.';
        break;
      case 'expertise':
        if (!value) error = 'Please select an expertise area.';
        break;
      case 'experience':
        if (!value) error = 'Enter your years of experience.';
        break;
      case 'agreeTerms':
        if (!value) error = 'You must agree to continue.';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const err = validateField(key, value);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="auth-container">
          <div className="auth-card" style={{ maxWidth: '540px' }}>
            <div className="auth-header">
              <h1 className="auth-title">Registration Complete</h1>
              <p className="auth-header-copy">Thanks {formData.fullName.split(' ')[0]}, your trainer account request is received.</p>
            </div>
            <button type="button" onClick={() => setSubmitted(false)} className="auth-button" style={{ width: '100%', marginTop: '10px' }}>
              Back to registration
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '920px', padding: '0', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', minHeight: '620px' }}>
            <div style={{ padding: '36px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="auth-header" style={{ textAlign: 'left', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                    <Link to="/register/student" style={{ color: '#475569', textDecoration: 'none' }}>Student</Link>
                    <Link to="/register/trainer" style={{ fontWeight: 700, color: '#0F172A', textDecoration: 'none' }}>Trainer</Link>
                    <Link to="/register/company" style={{ color: '#475569', textDecoration: 'none' }}>Company</Link>
                  </div>
                  <span className="auth-badge" style={{ display: 'inline-block', marginBottom: '12px', padding: '8px 14px', borderRadius: '999px', background: 'rgba(59, 130, 246, 0.12)', color: '#2563EB', fontWeight: 700, fontSize: '12px' }}>
                    New Trainer
                  </span>
                  <h1 className="auth-title" style={{ fontSize: '32px', lineHeight: '1.05' }}>Create your trainer account</h1>
                  <p className="auth-header-copy" style={{ marginTop: '12px', maxWidth: '520px' }}>
                    Sign up to create courses, mentor students, and manage batches.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gap: '18px' }}>
                    <Field label="Full Name" required error={errors.fullName}>
                      <input type="text" name="fullName" className={inputClass} placeholder="Your full name" value={formData.fullName} onChange={handleChange} />
                    </Field>

                    <Field label="Expertise Area" required error={errors.expertise}>
                      <select name="expertise" className={inputClass} value={formData.expertise} onChange={handleChange}>
                        <option value="">Select expertise</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Embedded Systems">Embedded Systems</option>
                        <option value="Mobile Development">Mobile Development</option>
                      </select>
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <Field label="Years of Experience" required error={errors.experience}>
                        <input type="number" name="experience" className={inputClass} placeholder="e.g. 3" value={formData.experience} onChange={handleChange} />
                      </Field>
                      <Field label="LinkedIn (optional)" required={false} error={errors.linkedin}>
                        <input type="text" name="linkedin" className={inputClass} placeholder="https://linkedin.com/in/your-profile" value={formData.linkedin} onChange={handleChange} />
                      </Field>
                    </div>

                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>Contact & Security</h2>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        <Field label="Email Address" required error={errors.email}>
                          <input type="email" name="email" className={inputClass} placeholder="you@example.com" value={formData.email} onChange={handleChange} />
                        </Field>
                        <Field label="Phone Number" required error={errors.phone}>
                          <input type="tel" name="phone" className={inputClass} placeholder="10-digit mobile number" value={formData.phone} onChange={handleChange} />
                        </Field>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <Field label="Password" required error={errors.password}>
                            <input type="password" name="password" className={inputClass} placeholder="Min 8 chars" value={formData.password} onChange={handleChange} />
                          </Field>
                          <Field label="Confirm Password" required error={errors.confirmPassword}>
                            <input type="password" name="confirmPassword" className={inputClass} placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} />
                          </Field>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '8px' }}>
                      <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#1E3A8A', marginTop: '4px' }} />
                      <label style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>I agree to the Terms of Service & Privacy Policy of Chemy LMS.</label>
                    </div>
                    {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}

                    <button type="submit" className="auth-button" style={{ marginTop: '8px' }}>Create Trainer Account</button>
                  </div>
                </form>

                <div className="auth-footer" style={{ marginTop: '18px' }}>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>Already have an account? <Link to="/login" className="auth-footer-link">Sign in</Link></p>
                </div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)', padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>Train and Grow</h2>
                <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '14px', marginBottom: '18px' }}>Create organized courses, mentor cohorts, and track student outcomes from a dedicated trainer dashboard.</p>
                <div style={{ background: '#FFFFFF', border: '1px solid rgba(59, 130, 246, 0.12)', borderRadius: '18px', padding: '16px' }}>
                  <p style={{ color: '#2563EB', fontWeight: 700, marginBottom: '8px' }}>Why become a trainer?</p>
                  <ul style={{ paddingLeft: '18px', color: '#475569', lineHeight: 1.7, fontSize: '14px' }}>
                    <li>Publish courses and assessments</li>
                    <li>Mentor students with live sessions</li>
                    <li>Access performance analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
