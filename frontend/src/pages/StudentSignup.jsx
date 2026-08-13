import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Auth.css';

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year"];
const DISTRICTS = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Salem",
  "Tirunelveli",
  "Erode",
  "Vellore",
  "Thoothukudi",
  "Thanjavur",
];
const COLLEGES = [
  "Anna University",
  "PSG College of Technology",
  "Thiagarajar College of Engineering",
  "SSN College of Engineering",
  "Kongu Engineering College",
];
const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
];

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

const inputClass =
  "form-input";

export default function StudentSignup() {
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    year: "",
    district: "",
    college: "",
    department: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full Name is required.';
        else if (value.trim().length < 3) error = 'Name must be at least 3 characters.';
        break;
      case 'gender':
        if (!value) error = 'Gender selection is required.';
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
      case 'year':
        if (!value) error = 'Select your year.';
        break;
      case 'district':
        if (!value) error = 'Select your district.';
        break;
      case 'college':
        if (!value) error = 'Select your college.';
        break;
      case 'department':
        if (!value) error = 'Select your department.';
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

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="auth-container">
          <div className="auth-card" style={{ maxWidth: '540px' }}>
            <div className="auth-header">
              <h1 className="auth-title">Registration Complete</h1>
              <p className="auth-header-copy">Welcome to Chemy LMS, {formData.fullName.split(' ')[0]}. Your student account is ready.</p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="auth-button"
              style={{ width: '100%', marginTop: '10px' }}
            >
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
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', minHeight: '680px' }}>
            <div style={{ padding: '42px 38px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="auth-header" style={{ textAlign: 'left', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                    <Link to="/register/student" style={{ fontWeight: 700, color: '#0F172A', textDecoration: 'none' }}>Student</Link>
                  </div>
                  <span className="auth-badge" style={{ display: 'inline-block', marginBottom: '12px', padding: '8px 14px', borderRadius: '999px', background: 'rgba(59, 130, 246, 0.12)', color: '#2563EB', fontWeight: 700, fontSize: '12px' }}>
                    New Student
                  </span>
                  <h1 className="auth-title" style={{ fontSize: '34px', lineHeight: '1.05' }}>Create your student account</h1>
                  <p className="auth-header-copy" style={{ marginTop: '12px', maxWidth: '520px' }}>
                    Complete the registration form to access personalized courses, student resources, and your dashboard.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gap: '20px' }}>
                    <Field label="Full Name" required error={errors.fullName}>
                      <input
                        type="text"
                        name="fullName"
                        className={inputClass}
                        placeholder="Your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                    </Field>

                    <Field label="Gender" required error={errors.gender}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        {['Male', 'Female', 'Other'].map((option) => (
                          <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="gender"
                              value={option}
                              checked={formData.gender === option}
                              onChange={handleChange}
                              style={{ accentColor: '#1E3A8A' }}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </Field>

                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '26px', marginTop: '20px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '18px' }}>Contact & Security</h2>
                      <div style={{ display: 'grid', gap: '20px' }}>
                        <Field label="Email Address" required error={errors.email}>
                          <input
                            type="email"
                            name="email"
                            className={inputClass}
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </Field>

                        <Field label="Phone Number" required error={errors.phone}>
                          <input
                            type="tel"
                            name="phone"
                            className={inputClass}
                            placeholder="10-digit mobile number"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </Field>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <Field label="Password" required error={errors.password}>
                            <input
                              type="password"
                              name="password"
                              className={inputClass}
                              placeholder="Min 8 chars"
                              value={formData.password}
                              onChange={handleChange}
                            />
                          </Field>
                          <Field label="Confirm Password" required error={errors.confirmPassword}>
                            <input
                              type="password"
                              name="confirmPassword"
                              className={inputClass}
                              placeholder="Re-enter password"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                            />
                          </Field>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '26px', marginTop: '20px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '18px' }}>Academic Details</h2>
                      <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <Field label="Year" required error={errors.year}>
                            <select
                              name="year"
                              className={inputClass}
                              value={formData.year}
                              onChange={handleChange}
                            >
                              <option value="">Select Year</option>
                              {YEARS.map((year) => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </Field>
                          <Field label="District" required error={errors.district}>
                            <select
                              name="district"
                              className={inputClass}
                              value={formData.district}
                              onChange={handleChange}
                            >
                              <option value="">Select District</option>
                              {DISTRICTS.map((district) => (
                                <option key={district} value={district}>{district}</option>
                              ))}
                            </select>
                          </Field>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <Field label="College" required error={errors.college}>
                            <select
                              name="college"
                              className={inputClass}
                              value={formData.college}
                              onChange={handleChange}
                            >
                              <option value="">Select College</option>
                              {COLLEGES.map((college) => (
                                <option key={college} value={college}>{college}</option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Department" required error={errors.department}>
                            <select
                              name="department"
                              className={inputClass}
                              value={formData.department}
                              onChange={handleChange}
                            >
                              <option value="">Select Department</option>
                              {DEPARTMENTS.map((dept) => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </Field>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '10px' }}>
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        style={{ width: '18px', height: '18px', accentColor: '#1E3A8A', marginTop: '4px' }}
                      />
                      <label style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                        I agree to the Terms of Service & Privacy Policy of Chemy LMS.
                      </label>
                    </div>
                    {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}

                    <button type="submit" className="auth-button" style={{ marginTop: '10px' }}>
                      Create Student Account
                    </button>
                  </div>
                </form>

                <div className="auth-footer" style={{ marginTop: '22px', textAlign: 'left' }}>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
                    Already have an account? <Link to="/login" className="auth-footer-link">Sign in</Link>
                  </p>
                </div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#ffffff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)', borderRadius: '50%' }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', marginBottom: '16px', letterSpacing: '-0.5px' }}>Smart Student Journey</h2>
                <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '15px', marginBottom: '32px' }}>
                  Join Chemy LMS and access curated learning tracks, live projects, and expert support for your engineering journey.
                </p>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '20px', padding: '24px' }}>
                  <p style={{ color: '#93c5fd', fontWeight: 700, marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Why Chemy LMS?</p>
                  <ul style={{ paddingLeft: '20px', color: '#f8fafc', lineHeight: 2, fontSize: '14.5px', margin: 0 }}>
                    <li style={{ marginBottom: '8px' }}>Industry-aligned programs</li>
                    <li style={{ marginBottom: '8px' }}>Expert coaching and support</li>
                    <li>Practical training with live projects</li>
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
