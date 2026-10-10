import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useNavigate } from '../../router/Router.jsx';

export function SignupPage() {
  const { signup, loginWithUserObj, isAuthenticated, activeRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // 1. useState: Form & UI state (Customer role created by default)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Google Accounts Presets
  const googleAccounts = useMemo(() => [
    {
      id: 'acc-college',
      name: 'Malathi Lakshmi',
      email: 'malathi.2023@annauniv.edu.in',
      badge: 'College ID',
      badgeClass: 'badge-college',
      avatarClass: 'college',
      initials: 'M',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 'acc-personal',
      name: 'Malathi Lakshmi',
      email: 'malathi.personal@gmail.com',
      badge: 'Personal Gmail',
      badgeClass: 'badge-personal',
      avatarClass: 'personal',
      initials: 'M',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 'acc-work',
      name: 'Malathi (Digitailor)',
      email: 'malathi.work@digitailor.com',
      badge: 'Work Atelier',
      badgeClass: 'badge-work',
      avatarClass: 'work',
      initials: 'M',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
  ], []);

  const handleGoogleAccountSelect = useCallback(async (account) => {
    setError('');
    setIsLoading(true);
    setShowGoogleModal(false);

    const targetName = account.name || 'Malathi Lakshmi';
    const targetEmail = account.email || 'malathi.personal@gmail.com';
    const targetImg = account.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

    const fallbackUser = {
      id: `google-usr-${targetEmail.split('@')[0]}`,
      name: targetName,
      username: targetEmail.split('@')[0],
      email: targetEmail,
      role: 'customer',
      defaultRole: 'customer',
      provider: 'google',
      profileImage: targetImg,
    };
    loginWithUserObj(fallbackUser);
    setSuccess(`✓ Welcome ${targetName}! Google Account authenticated (${targetEmail}).`);
    setTimeout(() => {
      navigate('/customer-dashboard');
    }, 500);
  }, [loginWithUserObj, navigate]);

  // 2. useRef: Focus on name input
  const nameRef = useRef(null);
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // 3. useEffect: Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && activeRole) {
      navigate(`/${activeRole}-dashboard`, { replace: true });
    }
  }, [isAuthenticated, activeRole, navigate]);

  // 4. useMemo: Feature highlights
  const featureHighlights = useMemo(() => [
    { icon: '📏', title: 'Smart Measurements', desc: '10-Field Fit Profile' },
    { icon: '👗', title: 'Custom Designs', desc: '2D Canvas Studio' },
    { icon: '📝', title: 'Order Tracking', desc: 'Live Stitching Status' },
    { icon: '👥', title: 'Customer Management', desc: 'Workshop Directory' },
  ], []);

  // 5. useCallback: Registration submission handler (Default role: customer)
  const handleSignupSubmit = useCallback((e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validation
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!password || password.length < 3) {
      setError('Password must be at least 3 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = signup({
        name: fullName,
        email,
        phone,
        password,
        role: 'customer', // Public signup always creates a customer account
      });

      if (res.success) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        setError(res.message || 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    }, 400);
  }, [fullName, email, phone, password, confirmPassword, signup, navigate]);

  return (
    <div className="modern-login-page">
      {/* TOP CONTROLS */}
      <div className="login-top-controls">
        <div className="lang-switcher-box">
          <span className="lang-icon">🌐</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="login-lang-select"
          >
            <option value="en">English</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-pill"
          title="Toggle Light / Dark Mode"
        >
          {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>

      <div className="login-split-container">
        {/* LEFT HERO SIDE */}
        <div className="login-hero-side">
          <div className="hero-bg-overlay" />
          <div className="hero-content">
            <div className="hero-brand">
              <span className="scissors-icon">✂️</span>
              <div className="brand-titles">
                <span className="brand-main">DigiTailor</span>
                <span className="brand-sub">{t('tagline')}</span>
              </div>
            </div>

            <div className="hero-text-block">
              <h1>
                Tailored with Precision, <br />
                <span className="gradient-pink-text">Delivered with Passion.</span>
              </h1>
              <p>
                Join DigiTailor today to experience custom tailoring, 10-field body measurements tracking, and live order tracking.
              </p>
            </div>

            <div className="hero-features-grid">
              {featureHighlights.map((feat) => (
                <div className="feature-card-box" key={feat.title}>
                  <span className="feat-icon">{feat.icon}</span>
                  <b>{feat.title}</b>
                </div>
              ))}
            </div>

            <div className="hero-quote-card">
              <span className="quote-mark">“</span>
              <p>
                Empowering tailors and boutiques to work <b>smarter</b> and serve <b>better</b>.
              </p>
              <span className="quote-author">— DigiTailor System</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIGNUP CARD SIDE */}
        <div className="login-card-side">
          <div className="login-card-inner">
            <div className="card-decor-header">
              <div className="dashed-line" />
              <span className="decor-scissors">✂️</span>
            </div>

            <div className="card-title-block">
              <h2>{t('createAccount')}</h2>
              <p>{t('createAccountSubtitle')}</p>
            </div>

            {error && <div className="auth-alert-banner error">⚠️ {error}</div>}
            {success && <div className="auth-alert-banner success">✓ {success}</div>}

            <form onSubmit={handleSignupSubmit} className="modern-login-form">
              <div className="form-field-wrap">
                <label>Full Name</label>
                <div className="input-icon-group">
                  <span className="input-icon">👤</span>
                  <input
                    ref={nameRef}
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-wrap">
                <label>Email Address</label>
                <div className="input-icon-group">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-wrap">
                <label>Phone Number</label>
                <div className="input-icon-group">
                  <span className="input-icon">📞</span>
                  <input
                    type="tel"
                    placeholder="Enter your 10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-wrap">
                <label>Password</label>
                <div className="input-icon-group">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-wrap">
                <label>Confirm Password</label>
                <div className="input-icon-group">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-primary-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : <>{t('createAccount')} <span className="btn-arrow">➔</span></>}
              </button>

              {/* SSO DIVIDER & GOOGLE BUTTON */}
              <div style={{ margin: '16px 0 10px', textTransform: 'uppercase', fontSize: '11px', color: '#888', fontWeight: 'bold' }}>
                <span>Or sign up with</span>
              </div>

              <button
                type="button"
                className="google-account-item"
                onClick={() => setShowGoogleModal(true)}
                style={{ border: '1px solid #dadce0', borderRadius: '8px', padding: '10px 14px', justifyContent: 'center', background: '#fff' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span style={{ fontWeight: 'bold', color: '#3c4043' }}>Continue with Google</span>
              </button>
            </form>

            <div className="card-footer-link">
              <p>
                {t('alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  className="signup-bold-btn"
                  onClick={() => navigate('/login')}
                >
                  {t('signIn')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="login-bottom-footer">
        <span>© 2026 DigiTailor. All rights reserved.</span>
        <div className="footer-links-row">
          <a href="#about" onClick={(e) => { e.preventDefault(); alert('DigiTailor Smart Digital Tailoring System v2.5'); }}>ℹ️ About Us</a>
          <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy: All customer fit data is encrypted.'); }}>🛡️ Privacy Policy</a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service: Standard digital tailoring license.'); }}>📄 Terms of Service</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); alert('Support Email: support@digitailor.com'); }}>✉️ Contact Us</a>
        </div>
      </footer>

      {/* GOOGLE OAUTH ACCOUNT SELECTOR MODAL */}
      {showGoogleModal && (
        <div className="google-account-modal-backdrop" onClick={() => setShowGoogleModal(false)}>
          <div className="google-account-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="google-modal-close-btn" onClick={() => setShowGoogleModal(false)}>✕</button>
            <div className="google-modal-header">
              <svg className="google-g-logo" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h3 className="google-modal-title">Sign in with Google</h3>
              <p className="google-modal-subtitle">Choose an account to continue to <b>Smart Digital Tailoring System</b></p>
            </div>

            <div className="google-account-list">
              {googleAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  className="google-account-item"
                  onClick={() => handleGoogleAccountSelect(acc)}
                >
                  <div className={`google-avatar ${acc.avatarClass}`}>{acc.initials}</div>
                  <div className="google-account-info">
                    <span className="google-account-name">
                      {acc.name} <span className={`google-account-badge ${acc.badgeClass}`}>{acc.badge}</span>
                    </span>
                    <span className="google-account-email">{acc.email}</span>
                  </div>
                </button>
              ))}
            </div>

            {showCustomGoogleInput ? (
              <div className="google-add-account-box">
                <input
                  type="email"
                  placeholder="Enter your Gmail or College Email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="google-custom-email-input"
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    style={{ flex: 1, background: '#1a73e8', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => {
                      if (customGoogleEmail && customGoogleEmail.includes('@')) {
                        const nameFromEmail = customGoogleEmail.split('@')[0];
                        handleGoogleAccountSelect({
                          name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
                          email: customGoogleEmail,
                        });
                      }
                    }}
                  >
                    Continue ➔
                  </button>
                  <button
                    type="button"
                    style={{ background: '#eee', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => setShowCustomGoogleInput(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="google-account-item"
                onClick={() => setShowCustomGoogleInput(true)}
              >
                <div className="google-avatar custom">👤</div>
                <div className="google-account-info">
                  <span className="google-account-name">Use another account</span>
                  <span className="google-account-email">Sign in with a different Gmail or College address</span>
                </div>
              </button>
            )}

            <div className="google-modal-footer">
              <span>To continue, Google will share your name, email address, and language preference with Smart Digital Tailoring System.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
