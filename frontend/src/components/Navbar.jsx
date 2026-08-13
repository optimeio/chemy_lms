import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: 'Home', to: '/' },
    { name: 'About Us', to: '/about' },
    { name: 'Contact Us', to: '/contact' },
  ];

  if (user) {
    if (user.email === 'admin@chemylms.com' || user.email === 'chemylms@gmail.com') {
      navLinks.push({ name: 'Admin Portal', to: '/admin' });
    } else {
      navLinks.push({ name: 'Dashboard', to: '/dashboard' });
    }
  }

  const isActive = (path) => path && location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span style={{ fontWeight: '800', letterSpacing: '0.5px', color: 'var(--primary)' }}>CHEMY</span>
          <span style={{ fontWeight: '400', color: 'var(--text-primary)' }}>LMS</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.name}>
              {link.href ? (
                <a href={link.href}>{link.name}</a>
              ) : (
                <Link to={link.to} className={isActive(link.to) ? 'active' : ''}>
                  {link.name}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop Auth Buttons */}
        <div className="nav-auth-buttons">
          {user ? (
            <div className="nav-user-wrap">
              <span className="nav-user-greeting">
                Hi, {user.fullName ? user.fullName.split(' ')[0] : 'Student'}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary nav-signout">
                Sign Out
              </button>
            </div>
          ) : (
              <Link to="/login" className="btn btn-secondary nav-link-button">
                Login
              </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu active">
          <ul className="mobile-menu-links">
            {navLinks.map((link) => (
              <li key={link.name}>
                {link.href ? (
                  <a href={link.href} onClick={() => setIsMobileMenuOpen(false)}>{link.name}</a>
                ) : (
                  <Link
                    to={link.to}
                    className={isActive(link.to) ? 'active' : ''}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )}
              </li>
            ))}
            {user ? (
              <li>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="mobile-signout"
                >
                  Sign Out
                </button>
              </li>
            ) : (
                <li>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}