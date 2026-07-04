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

export default function CompanySignup() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companySize: '',
    website: '',
    industry: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'companyName':
        if (!value.trim()) error = 'Company name is required.';
        break;
      case 'contactPerson':
        if (!value.trim()) error = 'Contact person is required.';
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
              <p className="auth-header-copy">Thanks — your company account request for {formData.companyName} has been received.</p>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', minHeight: '640px' }}>
            <div style={{ padding: '36px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="auth-header" style={{ textAlign: 'left', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                    <Link to="/register/student" style={{ color: '#475569', textDecoration: 'none' }}>Student</Link>
                    <Link to="/register/trainer" style={{ color: '#475569', textDecoration: 'none' }}>Trainer</Link>
                    <Link to="/register/company" style={{ fontWeight: 700, color: '#0F172A', textDecoration: 'none' }}>Company</Link>
                  </div>
                  <span className="auth-badge" style={{ display: 'inline-block', marginBottom: '12px', padding: '8px 14px', borderRadius: '999px', background: 'rgba(59, 130, 246, 0.12)', color: '#2563EB', fontWeight: 700, fontSize: '12px' }}>
                    New Company
                  </span>
                  <h1 className="auth-title" style={{ fontSize: '32px', lineHeight: '1.05' }}>Create your company account</h1>
                  <p className="auth-header-copy" style={{ marginTop: '12px', maxWidth: '520px' }}>
                    Set up a company account to manage teams, hiring drives, and analytics.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gap: '18px' }}>
                    <Field label="Company Name" required error={errors.companyName}>
                      <input type="text" name="companyName" className={inputClass} placeholder="Your company" value={formData.companyName} onChange={handleChange} />
                    </Field>

                    <Field label="Contact Person" required error={errors.contactPerson}>
                      <input type="text" name="contactPerson" className={inputClass} placeholder="Full name" value={formData.contactPerson} onChange={handleChange} />
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Field label="Email Address" required error={errors.email}>
                        <input type="email" name="email" className={inputClass} placeholder="you@company.com" value={formData.email} onChange={handleChange} />
                      </Field>
                      <Field label="Phone Number" required error={errors.phone}>
                        <input type="tel" name="phone" className={inputClass} placeholder="10-digit mobile number" value={formData.phone} onChange={handleChange} />
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Field label="Password" required error={errors.password}>
                        <input type="password" name="password" className={inputClass} placeholder="Min 8 chars" value={formData.password} onChange={handleChange} />
                      </Field>
                      <Field label="Confirm Password" required error={errors.confirmPassword}>
                        <input type="password" name="confirmPassword" className={inputClass} placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} />
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Field label="Company Size" required={false} error={errors.companySize}>
                        <select name="companySize" className={inputClass} value={formData.companySize} onChange={handleChange}>
                          <option value="">Select size</option>
                          <option value="1-10">1-10</option>
                          <option value="11-50">11-50</option>
                          <option value="51-200">51-200</option>
                          <option value="200+">200+</option>
                        </select>
                      </Field>
                      <Field label="Industry" required={false} error={errors.industry}>
                        <input type="text" name="industry" className={inputClass} placeholder="e.g. Software, Manufacturing" value={formData.industry} onChange={handleChange} />
                      </Field>
                    </div>

                    <Field label="Website (optional)" required={false} error={errors.website}>
                      <input type="text" name="website" className={inputClass} placeholder="https://company.com" value={formData.website} onChange={handleChange} />
                    </Field>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '8px' }}>
                      <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#1E3A8A', marginTop: '4px' }} />
                      <label style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>I agree to the Terms of Service & Privacy Policy of Chemy LMS.</label>
                    </div>
                    {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}

                    <button type="submit" className="auth-button" style={{ marginTop: '8px' }}>Create Company Account</button>
                  </div>
                </form>

                <div className="auth-footer" style={{ marginTop: '18px' }}>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>Already have an account? <Link to="/login" className="auth-footer-link">Sign in</Link></p>
                </div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)', padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>Company access</h2>
                <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '14px', marginBottom: '18px' }}>Manage teams, create training plans, and run hiring drives with a company account.</p>
                <div style={{ background: '#FFFFFF', border: '1px solid rgba(59, 130, 246, 0.12)', borderRadius: '18px', padding: '16px' }}>
                  <p style={{ color: '#2563EB', fontWeight: 700, marginBottom: '8px' }}>Benefits</p>
                  <ul style={{ paddingLeft: '18px', color: '#475569', lineHeight: 1.7, fontSize: '14px' }}>
                    <li>Team accounts and role-based access</li>
                    <li>Schedule hiring drives</li>
                    <li>View company-level analytics</li>
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
