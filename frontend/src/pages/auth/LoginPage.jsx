import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useNavigate } from '../../router/Router.jsx';
import { apiFetch } from '../../services/apiClient.js';

import lehengaImg from '../../assets/dresses/lehenga/lehenga-01.png';
import blouseImg from '../../assets/dresses/blouse/blouse-01.png';
import anarkaliImg from '../../assets/dresses/anarkali/anarkali-01.png';
import sareeImg from '../../assets/dresses/saree/saree-01.png';
import heroBg from '../../assets/hero-bg.png';

export function LoginPage() {
  const { login, loginWithUserObj, forgotPassword, rememberedIdentifier, isAuthenticated, activeRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // 1. Form & Auth State
  const [identifier, setIdentifier] = useState(rememberedIdentifier || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(!!rememberedIdentifier);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ssoMessage, setSsoMessage] = useState('');

  // 2. Modals & Dialog States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showCustomStudioModal, setShowCustomStudioModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Single Template Active Tab State ('directMsg' | 'workflow' | 'artisans' | 'all')
  const [templateTab, setTemplateTab] = useState('directMsg');
  const [directMsgForm, setDirectMsgForm] = useState({ name: '', phone: '', service: 'Designer Saree Blouse', message: '' });
  const [directMsgSuccess, setDirectMsgSuccess] = useState('');

  const handleDirectMsgSubmit = async (e) => {
    e.preventDefault();
    if (!directMsgForm.name.trim() || !directMsgForm.message.trim()) {
      alert('Please enter your name and message.');
      return;
    }
    setDirectMsgSuccess('✓ Direct message sent to Shop Counter & saved in Database!');
    try {
      await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: directMsgForm.name,
          phone: directMsgForm.phone,
          service: directMsgForm.service,
          message: directMsgForm.message,
        }),
      });
    } catch (err) {
      console.warn('Direct msg API note:', err);
    }
    setTimeout(() => {
      setDirectMsgSuccess('');
      setDirectMsgForm({ name: '', phone: '', service: 'Designer Saree Blouse', message: '' });
    }, 4000);
  };

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

  // Handle Real Google OAuth client-side response
  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    setError('');
    setSsoMessage('Verifying Google credentials...');
    setIsLoading(true);

    try {
      const res = await apiFetch('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      if (res && res.success && res.token) {
        localStorage.setItem('digitailor_jwt_token', res.token);
        if (res.user) {
          localStorage.setItem('digitailor_user', JSON.stringify(res.user));
          // Use context loginWithUserObj to set state properly
          loginWithUserObj(res.user, res.token);
          setSsoMessage('✓ Authenticated via Google!');
          setTimeout(() => {
            navigate(`/${res.user.role}-dashboard`, { replace: true });
          }, 600);
        }
      } else {
        throw new Error(res?.message || 'Google verification failed.');
      }
    } catch (err) {
      console.error('[Google Login Error]', err);
      setError('Google sign-in was unsuccessful. Error: ' + err.message);
      setIsLoading(false);
      setSsoMessage('');
    }
  }, [loginWithUserObj, navigate]);

  const handleGoogleError = useCallback((errResp) => {
    console.error('GoogleLogin component onError:', errResp);
    setError('Google Sign-In widget failed to initialize or was blocked. Check if popups/third-party cookies are allowed, and verify http://localhost:5173 is in Authorized JavaScript origins.');
    setIsLoading(false);
  }, []);

  // Handle URL parameters for OAuth status or errors on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleErr = params.get('googleError');

    if (googleErr) {
      setIsLoading(false);
      setSsoMessage('');
      if (googleErr === 'cancelled') {
        setSsoMessage('Google sign-in was cancelled.');
      } else if (googleErr === 'unconfigured') {
        setError('Google OAuth is not configured yet. Please set GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET in your .env file.');
      } else {
        setError(`Google sign-in redirect failed (Status: ${googleErr}). Please use the Google Sign-In button again.`);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGoogleAccountSelect = useCallback(async (account) => {
    // Legacy mock function - users should now use the real Google Login button above
    console.log('Mock account selected:', account);
    alert('Please use the real Google Sign-In button to authenticate securely.');
  }, []);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  // Auto-focus username input when login modal opens
  const inputRef = useRef(null);
  useEffect(() => {
    if (showLoginModal) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showLoginModal]);

  // Redirect authenticated user to role-specific dashboard
  useEffect(() => {
    if (isAuthenticated && activeRole) {
      navigate(`/${activeRole}-dashboard`, { replace: true });
    }
  }, [isAuthenticated, activeRole, navigate]);

  // Women's Tailoring Categories Catalog
  const categoriesList = useMemo(() => [
    {
      id: 'saree-blouse',
      name: 'Designer Saree Blouse',
      tag: 'Aari & Cutwork',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      localImg: sareeImg,
      count: '180+ Patterns',
      price: 'From ₹800',
      desc: 'Bespoke scalloped cutwork, deep back with dori, gold zari & Aari maggam work.'
    },
    {
      id: 'pavadai-thavani',
      name: 'Pavadai Thavani & Half Saree',
      tag: 'Traditional Silk',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
      localImg: blouseImg,
      count: '120+ Sets',
      price: 'From ₹1,400',
      desc: 'Knife pleated silk skirt, choli blouse & contrast scalloped dupatta drape set.'
    },
    {
      id: 'lehenga-choli',
      name: 'Bridal Lehenga Choli',
      tag: 'Wedding Couture',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
      localImg: lehengaImg,
      count: '95+ Designs',
      price: 'From ₹2,999',
      desc: 'Full flared lehenga skirt with heavy zardosi, velvet border & customized choli.'
    },
    {
      id: 'anarkali-gown',
      name: 'Anarkali Floor Length Gown',
      tag: 'Royalty & Festivities',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      localImg: anarkaliImg,
      count: '140+ Styles',
      price: 'From ₹1,400',
      desc: '360-degree flared Dupion silk Anarkali gown with crimson threadwork hemline.'
    },
    {
      id: 'salwar-kameez',
      name: 'Chudidhar & Salwar Suit',
      tag: 'Daily & Festival',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
      localImg: blouseImg,
      count: '210+ Styles',
      price: 'From ₹900',
      desc: 'Custom kameez, Patiala pleated salwar bottom, churidar pants & dupatta set.'
    }
  ], []);

  // 6-Step Workflow List
  const workflowSteps = useMemo(() => [
    { num: '01', title: 'Bring Own Fabric', desc: 'Bring your unstitched fabric to shop or choose from our pure silk cotton stock.' },
    { num: '02', title: 'Select Dress Type', desc: 'Choose from Saree Blouse, Lehenga, Half Saree, Chudidhar, or Anarkali Gown.' },
    { num: '03', title: '10-Field Fit Profile', desc: 'Enter dress-specific measurements for bust, waist, shoulder, armhole & length.' },
    { num: '04', title: 'Custom Studio Options', desc: 'Select necklines, sleeve cuts, back patterns, Aari embroidery & tassel work.' },
    { num: '05', title: 'QR/UPI Payment', desc: 'Receive price estimate and pay either full amount or deposit advance via UPI.' },
    { num: '06', title: 'Track & Fitting Trial', desc: 'Track 14-stage live stitching, attend fitting session, request alteration & receive dress.' }
  ], []);

  // Master Artisans & Tailors List
  const masterArtisans = useMemo(() => [
    { name: 'Master Rajesh Tailor', role: 'Chief Master Tailor', spec: 'Silk Blouses & Kanchipuram Sarees', exp: '12 Yrs Exp', rating: '5.0 ⭐' },
    { name: 'Master Lakshmi Aari Crafts', role: 'Head Aari & Zardozi Artisan', spec: 'Bridal Maggam & Peacock Motifs', exp: '10 Yrs Exp', rating: '4.9 ⭐' },
    { name: 'Sri Kanchi Zari Artisans', role: 'Gold Zari Border Specialist', spec: 'Half Saree & Pavadai Thavani', exp: '15 Yrs Exp', rating: '5.0 ⭐' }
  ], []);

  // Gallery Showcase Images
  const galleryImages = useMemo(() => [
    { src: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop', title: 'Royal Silk Saree Cutwork Blouse' },
    { src: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop', title: 'Kanchipuram Pavadai Thavani Set' },
    { src: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop', title: 'Bridal Velvet Lehenga Embroidery' },
    { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop', title: 'Flared Anarkali Floor Gown' }
  ], []);

  // Common Login Submit Handler
  const handleLoginSubmit = useCallback((e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSsoMessage('');

    if (!identifier.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login({ identifier, password, rememberMe });
      if (res.success) {
        setSuccess('Authentication successful! Redirecting...');
        const detectedRole = res.role || res.user?.defaultRole || 'customer';
        setTimeout(() => {
          navigate(`/${detectedRole}-dashboard`);
        }, 400);
      } else {
        setError(res.message || 'Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    }, 400);
  }, [identifier, password, rememberMe, login, navigate]);

  // Contact Form Submit Handler (Saves message to MongoDB)
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setContactSuccess(true);
    
    try {
      await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          message: contactMsg,
        }),
      });
    } catch (err) {
      console.warn('Contact API note:', err);
    }

    setTimeout(() => {
      setContactSuccess(false);
      setShowContactModal(false);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMsg('');
      alert('Thank you! Your message has been sent to Smart Digital Tailoring System and saved to MongoDB. We will contact you shortly.');
    }, 1000);
  };

  // Smooth Scroll & Template Section Switcher
  const scrollToSection = (id) => {
    if (id === 'sdts-catalog') setTemplateTab('catalog');
    if (id === 'sdts-direct-msg') setTemplateTab('directMsg');
    if (id === 'sdts-workflow') setTemplateTab('workflow');
    if (id === 'sdts-artisans') setTemplateTab('artisans');

    const el = document.getElementById(id) || document.getElementById('sdts-template-view');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Forgot Password Submit
  const handleForgotSubmit = useCallback((e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotMsg('Please enter a valid email address.');
      return;
    }
    const res = forgotPassword(forgotEmail);
    setForgotMsg(res?.message || 'Recovery instructions sent to your email.');
  }, [forgotEmail, forgotPassword]);

  return (
    <div className="sdts-landing-wrapper" data-theme={theme} style={{ background: 'linear-gradient(135deg, #180b18 0%, #261125 50%, #160717 100%)', minHeight: '100vh', color: '#ffffff' }}>
      {/* ===================================================================
          1. TOP NAVIGATION HEADER BAR (Smart Digital Tailoring System)
         =================================================================== */}
      <header className="sdts-navbar">
        <div className="sdts-brand-box" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="sdts-logo-icon">✂️</div>
          <div className="sdts-brand-text">
            <span className="sdts-brand-name">Smart Digital Tailoring System</span>
            <span className="sdts-brand-tagline">BESPOKE WOMEN'S ATELIER & CUSTOM STUDIO</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sdts-nav-items">
          <button type="button" className={`sdts-nav-link ${templateTab === 'catalog' ? 'active' : ''}`} onClick={() => { setTemplateTab('catalog'); scrollToSection('sdts-template-view'); }}>Home / Catalog</button>
          <button type="button" className="sdts-nav-link" onClick={() => setShowCustomStudioModal(true)}>✨ AI Smart Designer</button>
          <button type="button" className={`sdts-nav-link ${templateTab === 'workflow' ? 'active' : ''}`} onClick={() => { setTemplateTab('workflow'); scrollToSection('sdts-template-view'); }}>Workflow</button>
          <button type="button" className={`sdts-nav-link ${templateTab === 'directMsg' ? 'active' : ''}`} onClick={() => { setTemplateTab('directMsg'); scrollToSection('sdts-template-view'); }}>💬 Direct Message</button>
          <button type="button" className="sdts-nav-link" onClick={() => setShowGalleryModal(true)}>Gallery</button>
          <button type="button" className="sdts-nav-link" onClick={() => setShowAboutModal(true)}>About Us</button>
        </nav>

        {/* Right Controls */}
        <div className="sdts-navbar-actions">
          {/* Language Switcher */}
          <div className="sdts-lang-select-box">
            <span className="sdts-globe">🌐</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="sdts-lang-dropdown">
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* Theme Toggle Pill */}
          <button type="button" className="sdts-theme-pill" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>

          {/* Login Button */}
          <button type="button" className="sdts-login-btn" onClick={() => setShowLoginModal(true)}>
            <span>👤</span> Login
          </button>

          {/* Sign Up Button */}
          <button type="button" className="sdts-signup-btn" onClick={() => navigate('/signup')}>
            <span>✨</span> Sign Up
          </button>
        </div>
      </header>

      {/* ===================================================================
          2. ELEGANT WIDESCREEN HERO SECTION (Clean Landscape Studio Background)
         =================================================================== */}
      <section
        className="sdts-hero-section"
        style={{
          position: 'relative',
          padding: '80px 24px 60px',
          overflow: 'hidden',
          borderRadius: '0 0 36px 36px',
          boxShadow: '0 16px 50px rgba(0,0,0,0.7)',
          background: '#120714',
        }}
      >
        {/* LIVE FASHION ATELIER VIDEO BACKGROUND LOOP */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={heroBg}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'translate(-50%, -50%) scale(1.04)',
              animation: 'heroVideoPanZoom 20s ease-in-out infinite alternate',
              filter: theme === 'light' ? 'brightness(1.05) contrast(1.05) saturate(1.1)' : 'brightness(1.02) contrast(1.08) saturate(1.15)',
            }}
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-tailor-working-with-sewing-machine-42456-large.mp4" type="video/mp4" />
            <img src={heroBg} alt="Smart Tailoring Atelier Studio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </video>
        </div>

        {/* HIGH-CLARITY THEME-AWARE DYNAMIC GRADIENT OVERLAY */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              theme === 'light'
                ? 'linear-gradient(180deg, rgba(255, 245, 248, 0.45) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 240, 245, 0.5) 100%)'
                : 'linear-gradient(180deg, rgba(16, 7, 18, 0.42) 0%, rgba(22, 9, 24, 0.3) 50%, rgba(14, 5, 16, 0.48) 100%)',
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(1px)',
            zIndex: 1,
          }}
        />

        <div
          className="sdts-hero-container"
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1280px',
            margin: '0 auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Eyebrow Badge */}
          <div
            className="sdts-hero-badge"
            style={{
              background: 'rgba(215, 101, 120, 0.3)',
              color: '#ff80ab',
              border: '1px solid rgba(255, 64, 129, 0.5)',
              padding: '8px 24px',
              borderRadius: '30px',
              fontSize: '13px',
              fontWeight: '800',
              display: 'inline-block',
              marginBottom: '20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
            }}
          >
            ✨ TRADITIONAL TOUCH • MODERN DIGITAL TECHNOLOGY
          </div>

          {/* Main Hero Title */}
          <h1
            className="sdts-hero-title"
            style={{
              fontSize: '58px',
              fontWeight: '900',
              color: theme === 'light' ? '#2e112d' : '#ffffff',
              lineHeight: 1.15,
              marginBottom: '18px',
              maxWidth: '960px',
              textShadow: theme === 'light' ? '0 2px 10px rgba(255,255,255,0.9), 0 1px 3px rgba(255,255,255,0.8)' : '0 4px 20px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.8)',
            }}
          >
            Smart Digital{' '}
            <span
              className="sdts-calligraphy-pink"
              style={{ color: '#d81b60', fontStyle: 'italic', textShadow: theme === 'light' ? '0 0 15px rgba(216,27,96,0.3)' : '0 0 25px rgba(255, 64, 129, 0.8)' }}
            >
              Tailoring
            </span>{' '}
            System
          </h1>

          {/* Subtitle Description */}
          <p
            className="sdts-hero-desc"
            style={{
              fontSize: '18px',
              color: theme === 'light' ? '#3d1c3a' : '#f3e5f5',
              margin: '0 auto 32px',
              lineHeight: 1.6,
              fontWeight: '600',
              maxWidth: '820px',
              textShadow: theme === 'light' ? '0 1px 8px rgba(255,255,255,0.9)' : '0 2px 10px rgba(0,0,0,0.9)',
            }}
          >
            Explore our premium collection or design your own bespoke outfits. Get custom-stitched saree blouses, lehengas, half sarees & gowns with 10-field precision measurement fits, traditional elegance, and live stitching updates — all in one place.
          </p>

          {/* LANDSCAPE WIDE 4-STEP BESPOKE WORKFLOW BAR */}
          <div
            style={{
              width: '100%',
              maxWidth: '1100px',
              background: theme === 'light' ? 'rgba(255, 255, 255, 0.88)' : 'rgba(22, 10, 24, 0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: theme === 'light' ? '1px solid #f8bbd0' : '1px solid rgba(255, 128, 171, 0.35)',
              borderRadius: '20px',
              padding: '18px 24px',
              marginBottom: '32px',
              boxShadow: theme === 'light' ? '0 10px 30px rgba(136, 14, 79, 0.12)' : '0 12px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '900',
                  color: '#ff80ab',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>✂️</span> BESPOKE WOMEN TAILORING WORKFLOW
              </span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #d81b60, #880e4f)',
                  color: '#ffffff',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 10px rgba(216, 27, 96, 0.4)',
                }}
              >
                ● LIVE ATELIER
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
              }}
            >
              {/* Step Box 1 */}
              <div
                onClick={() => setShowCustomStudioModal(true)}
                style={{
                  background: 'rgba(15, 6, 17, 0.82)',
                  border: '1px solid rgba(255, 64, 129, 0.4)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(216, 27, 96, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title="Click to Log Customer Fabric & Material"
              >
                <span
                  style={{
                    background: '#d81b60',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  1
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>Customer Fabric / Material</span>
              </div>

              {/* Step Box 2 */}
              <div
                onClick={() => setShowMeasurementModal(true)}
                style={{
                  background: 'rgba(15, 6, 17, 0.82)',
                  border: '1px solid rgba(255, 64, 129, 0.4)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(216, 27, 96, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title="Click to Open 10-Field Body Measurements Calculator"
              >
                <span
                  style={{
                    background: '#d81b60',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  2
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>10-Field Fit Profile</span>
              </div>

              {/* Step Box 3 */}
              <div
                onClick={() => setShowCustomStudioModal(true)}
                style={{
                  background: 'rgba(15, 6, 17, 0.82)',
                  border: '1px solid rgba(255, 64, 129, 0.4)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(216, 27, 96, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title="Click to Customize Aari & Zari Embroidery Patterns"
              >
                <span
                  style={{
                    background: '#d81b60',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  3
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>Aari Zari Customization</span>
              </div>

              {/* Step Box 4 */}
              <div
                onClick={() => setShowLoginModal(true)}
                style={{
                  background: 'rgba(15, 6, 17, 0.82)',
                  border: '1px solid rgba(255, 64, 129, 0.4)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(216, 27, 96, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title="Click to Access QR Bill & Login Workspace"
              >
                <span
                  style={{
                    background: '#d81b60',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  4
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>QR Scanner & PDF Bill</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS LANDSCAPE ROW */}
          <div
            className="sdts-hero-buttons"
            style={{
              display: 'flex',
              gap: '12px',
              justify: 'center',
              flexWrap: 'wrap',
              marginBottom: '32px',
            }}
          >
            <button
              type="button"
              className="sdts-primary-btn"
              onClick={() => scrollToSection('sdts-catalog')}
              style={{
                background: 'linear-gradient(135deg, #d81b60, #880e4f)',
                color: '#ffffff',
                padding: '14px 28px',
                borderRadius: '30px',
                fontWeight: '800',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 22px rgba(216, 27, 96, 0.5)',
              }}
            >
              🔍 Explore Catalog <span className="sdts-btn-arrow">➔</span>
            </button>

            <button
              type="button"
              className="sdts-outline-btn"
              onClick={() => setShowCustomStudioModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.14)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                padding: '14px 26px',
                borderRadius: '30px',
                fontWeight: '800',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
              }}
            >
              📐 Design Your Own
            </button>

            <button
              type="button"
              className="sdts-outline-btn"
              onClick={() => setShowGalleryModal(true)}
              style={{
                background: '#fce4ec',
                color: '#880e4f',
                border: 'none',
                padding: '14px 26px',
                borderRadius: '30px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              }}
            >
              👗 Choose Design
            </button>

            <button
              type="button"
              className="sdts-outline-btn"
              onClick={() => setShowMeasurementModal(true)}
              style={{
                background: '#fce4ec',
                color: '#880e4f',
                border: 'none',
                padding: '14px 26px',
                borderRadius: '30px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              }}
            >
              📏 Enter Fits
            </button>

            <button
              type="button"
              className="sdts-outline-btn"
              onClick={() => setShowLoginModal(true)}
              style={{
                background: 'linear-gradient(135deg, #d81b60, #880e4f)',
                color: '#ffffff',
                border: 'none',
                padding: '14px 26px',
                borderRadius: '30px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(216, 27, 96, 0.4)',
              }}
            >
              🛍️ Place Order
            </button>
          </div>

          {/* Quick Demo Credentials Access Chips Landscape Bar */}
          <div
            style={{
              paddingTop: '20px',
              borderTop: '1px dashed rgba(248, 187, 208, 0.35)',
              width: '100%',
              maxWidth: '900px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: '800',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: '#ff80ab',
                display: 'block',
                marginBottom: '12px',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              }}
            >
              🔑 ONE-CLICK DEMO LOGIN ACCOUNTS:
            </span>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('malathi');
                  setPassword('123');
                  setShowLoginModal(true);
                }}
                style={{
                  background: '#fce4ec',
                  color: '#880e4f',
                  border: '1px solid #f8bbd0',
                  padding: '10px 22px',
                  borderRadius: '24px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                }}
              >
                💃 Customer (Malathi)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('tailor');
                  setPassword('123');
                  setShowLoginModal(true);
                }}
                style={{
                  background: '#e0f2fe',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                  padding: '10px 22px',
                  borderRadius: '24px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                }}
              >
                ✂️ Master Tailor
              </button>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('admin');
                  setPassword('123');
                  setShowLoginModal(true);
                }}
                style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  padding: '10px 22px',
                  borderRadius: '24px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                }}
              >
                🛡️ Shop Admin
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          3. INTERACTIVE SINGLE TEMPLATE SWITCHER BAR
         =================================================================== */}
      <div id="sdts-template-view" style={{ background: 'rgba(15, 10, 26, 0.88)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(248, 187, 208, 0.3)', borderRadius: '24px', padding: '16px 24px', margin: '30px auto 10px', maxWidth: '1100px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
        <button
          type="button"
          onClick={() => setTemplateTab('directMsg')}
          style={{
            background: templateTab === 'directMsg' ? 'linear-gradient(135deg, #ad1457, #880e4f)' : '#fff0f5',
            color: templateTab === 'directMsg' ? '#ffffff' : '#880e4f',
            border: 'none',
            padding: '12px 22px',
            borderRadius: '14px',
            fontWeight: '800',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: templateTab === 'directMsg' ? '0 4px 14px rgba(173, 20, 87, 0.3)' : 'none',
          }}
        >
          💬 1. Direct Message to Shop Counter
        </button>

        <button
          type="button"
          onClick={() => setTemplateTab('workflow')}
          style={{
            background: templateTab === 'workflow' ? 'linear-gradient(135deg, #ad1457, #880e4f)' : '#fff0f5',
            color: templateTab === 'workflow' ? '#ffffff' : '#880e4f',
            border: 'none',
            padding: '12px 22px',
            borderRadius: '14px',
            fontWeight: '800',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: templateTab === 'workflow' ? '0 4px 14px rgba(173, 20, 87, 0.3)' : 'none',
          }}
        >
          🧵 2. How It Works (6 Steps)
        </button>

        <button
          type="button"
          onClick={() => setTemplateTab('artisans')}
          style={{
            background: templateTab === 'artisans' ? 'linear-gradient(135deg, #ad1457, #880e4f)' : '#fff0f5',
            color: templateTab === 'artisans' ? '#ffffff' : '#880e4f',
            border: 'none',
            padding: '12px 22px',
            borderRadius: '14px',
            fontWeight: '800',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: templateTab === 'artisans' ? '0 4px 14px rgba(173, 20, 87, 0.3)' : 'none',
          }}
        >
          ✂️ 3. Master Tailors & Artisans
        </button>

        <button
          type="button"
          onClick={() => setTemplateTab('all')}
          style={{
            background: templateTab === 'all' ? 'linear-gradient(135deg, #ad1457, #880e4f)' : '#f3e5f5',
            color: templateTab === 'all' ? '#ffffff' : '#4a148c',
            border: 'none',
            padding: '12px 22px',
            borderRadius: '14px',
            fontWeight: '800',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          🌐 View All Sections
        </button>
      </div>

      {/* ===================================================================
          3A. DIRECT MESSAGE TO TAILOR COUNTER (Spacious Card Section)
         =================================================================== */}
      {(templateTab === 'directMsg' || templateTab === 'all') && (
        <section className="sdts-catalog-section" id="sdts-direct-msg">
          <div className="sdts-section-header">
            <span className="sdts-sub-eyebrow">DIRECT COMMUNICATION</span>
            <h2>💬 Direct Message to Tailor Counter</h2>
            <p>Send your custom stitching inquiry, fabric details, or order questions directly to our shop counter</p>
          </div>

        <div style={{ maxWidth: '780px', margin: '0 auto', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '24px', padding: '32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
          {directMsgSuccess && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', marginBottom: '18px', textAlign: 'center' }}>
              {directMsgSuccess}
            </div>
          )}

          <form onSubmit={handleDirectMsgSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text)' }}>Your Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Malathi Lakshmi"
                value={directMsgForm.name}
                onChange={(e) => setDirectMsgForm({ ...directMsgForm, name: e.target.value })}
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--text)' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text)' }}>Phone / WhatsApp Number</label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={directMsgForm.phone}
                onChange={(e) => setDirectMsgForm({ ...directMsgForm, phone: e.target.value })}
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--text)' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text)' }}>Select Tailoring Service Requirement</label>
              <select
                value={directMsgForm.service}
                onChange={(e) => setDirectMsgForm({ ...directMsgForm, service: e.target.value })}
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--text)' }}
              >
                <option value="Designer Saree Blouse">Designer Saree Blouse & Aari Work</option>
                <option value="Pavadai Thavani">Pavadai Thavani & Half Saree</option>
                <option value="Bridal Lehenga Choli">Bridal Lehenga Choli</option>
                <option value="Anarkali Floor Gown">Anarkali Floor Length Gown</option>
                <option value="Chudidhar & Salwar">Chudidhar & Salwar Kameez</option>
                <option value="Fitting Alteration">Fitting Alteration Request</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text)' }}>Write Your Custom Stitching Inquiry / Message *</label>
              <textarea
                placeholder="Describe neck cut, sleeve pattern, unstitched fabric type, delivery deadline, or any special requests..."
                value={directMsgForm.message}
                onChange={(e) => setDirectMsgForm({ ...directMsgForm, message: e.target.value })}
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--text)', minHeight: '110px', resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '8px' }}>
              <button
                type="submit"
                className="sdts-primary-btn"
                style={{ width: '100%', padding: '14px 28px', fontSize: '15px', fontWeight: '800', borderRadius: '14px', background: 'linear-gradient(135deg, var(--plum), var(--coral))', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(75, 35, 72, 0.25)' }}
              >
                ✉️ Send Direct Message to Shop Counter ➔
              </button>
            </div>
          </form>
        </div>
      </section>
      )}

      {/* Bespoke Tailoring Categories section removed per user request for clean minimal front template */}

      {/* ===================================================================
          5. HOW IT WORKS WORKFLOW PIPELINE
         =================================================================== */}
      {(templateTab === 'workflow' || templateTab === 'all') && (
        <section className="sdts-catalog-section" id="sdts-workflow">
          <div className="sdts-section-header">
            <span className="sdts-sub-eyebrow">HOW IT WORKS</span>
            <h2>6-Step Tailoring Workflow</h2>
            <p>From unstitched fabric to custom measurements, live stitching tracking, and perfect fit delivery</p>
          </div>

          <div className="sdts-workflow-grid">
            {workflowSteps.map((step) => (
              <div className="sdts-workflow-card" key={step.num}>
                <div className="sdts-step-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================================================================
          6. MASTER TAILORS & ARTISANS SHOWCASE
         =================================================================== */}
      {(templateTab === 'artisans' || templateTab === 'all') && (
        <section className="sdts-artisans-section" id="sdts-artisans">
          <div className="sdts-section-header">
            <span className="sdts-sub-eyebrow">EXPERT TAILORING WORKSHOP</span>
            <h2>Master Tailors & Aari Artisans</h2>
            <p>Experienced craftsmen dedicated to flawless fitting and handwork</p>
          </div>

          <div className="sdts-artisans-grid">
            {masterArtisans.map((artisan) => (
              <div className="sdts-artisan-card" key={artisan.name}>
                <div className="sdts-artisan-avatar">✂️</div>
                <h3>{artisan.name}</h3>
                <span className="sdts-artisan-role">{artisan.role}</span>
                <p><b>Spec:</b> {artisan.spec}</p>
                <div className="sdts-artisan-meta">
                  <span>{artisan.exp}</span>
                  <span className="rating">{artisan.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================================================================
          7. FOOTER BAR
         =================================================================== */}
      <footer className="sdts-footer">
        <div className="sdts-footer-container">
          <div className="sdts-footer-col brand">
            <div className="sdts-brand-box">
              <div className="sdts-logo-icon">✂️</div>
              <span className="sdts-brand-name" style={{ color: '#fff' }}>Smart Digital Tailoring System</span>
            </div>
            <p>
              Women-only real-world smart digital tailoring platform. Bring your own fabric, customize designs, provide dress-specific 10-field measurements, track live stitching, and get perfect fit delivered.
            </p>
          </div>

          <div className="sdts-footer-col">
            <h4>Quick Links</h4>
            <a href="#sdts-catalog" onClick={(e) => { e.preventDefault(); scrollToSection('sdts-catalog'); }}>Tailoring Catalog</a>
            <a href="#custom-studio" onClick={(e) => { e.preventDefault(); setShowCustomStudioModal(true); }}>Custom Studio</a>
            <a href="#sdts-workflow" onClick={(e) => { e.preventDefault(); scrollToSection('sdts-workflow'); }}>How It Works</a>
            <a href="#sdts-direct-msg" onClick={(e) => { e.preventDefault(); scrollToSection('sdts-direct-msg'); }}>Direct Message Counter</a>
          </div>

          <div className="sdts-footer-col">
            <h4>Contact Atelier</h4>
            <p>📞 Phone: +91 98765 43210 / +91 94440 12345</p>
            <p>✉️ Email: support@digitailor.com</p>
            <p>📍 Address: Tailoring Atelier Lane, T. Nagar, Chennai, Tamil Nadu</p>
            <button type="button" className="sdts-contact-btn" onClick={() => scrollToSection('sdts-direct-msg')}>
              ✉️ Send Direct Message
            </button>
          </div>
        </div>

        <div className="sdts-copyright">
          © 2026 Smart Digital Tailoring System. All rights reserved. Women-Only Bespoke Platform.
        </div>
      </footer>

      {/* ===================================================================
          7. MODALS FOR ALL BUTTONS
         =================================================================== */}

      {/* CENTERED LOGIN MODAL */}
      {showLoginModal && (
        <div className="sdts-modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="sdts-login-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="sdts-modal-close" onClick={() => setShowLoginModal(false)}>✕</button>

            <div className="sdts-login-head">
              <div className="sdts-icon-circle">✂️</div>
              <h2>Welcome Back</h2>
              <p>Sign in to access Smart Digital Tailoring System</p>
            </div>

            {error && <div className="sdts-alert error">⚠️ {error}</div>}
            {success && <div className="sdts-alert success">✓ {success}</div>}
            {ssoMessage && <div className="sdts-alert info">{ssoMessage}</div>}

            <form onSubmit={handleLoginSubmit} className="sdts-login-form">
              <div className="sdts-field-group">
                <label>Username / Account ID</label>
                <div className="sdts-input-wrap">
                  <span className="input-icon">👤</span>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter username (malathi, customer, admin, tailor)"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="sdts-field-group">
                <div className="label-row">
                  <label>Password</label>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowForgotModal(true);
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="sdts-input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <div className="sdts-remember-row">
                <label className="remember-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              <button type="submit" className="sdts-submit-btn" disabled={isLoading}>
                {isLoading ? 'Signing in...' : <>Sign In <span className="btn-arrow">➔</span></>}
              </button>

              {/* SSO DIVIDER */}
              <div className="sdts-sso-divider">
                <span>Or continue with</span>
              </div>

              {/* GOOGLE & MICROSOFT SSO BUTTONS */}
              <div className="sdts-sso-grid">
                <div className="google-btn-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme={theme === 'dark' ? 'filled_black' : 'outline'}
                    size="large"
                    shape="pill"
                    text="continue_with"
                  />
                </div>

                <button
                  type="button"
                  className="sdts-sso-btn microsoft"
                  onClick={() => {
                    setSsoMessage('✓ Microsoft SSO authenticated! Redirecting to Customer Atelier...');
                    setIsLoading(true);
                    setTimeout(() => {
                      const res = login({ identifier: 'malathi', password: '123', rememberMe: true });
                      if (res.success) {
                        navigate('/customer-dashboard');
                      } else {
                        setIsLoading(false);
                      }
                    }, 600);
                  }}
                >
                  <svg viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span>Microsoft</span>
                </button>
              </div>
            </form>

            <div className="sdts-card-foot">
              <p>
                Don't have an account?{' '}
                <button type="button" className="signup-link" onClick={() => navigate('/signup')}>
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT MODAL */}
      {showContactModal && (
        <div className="sdts-modal-backdrop" onClick={() => setShowContactModal(false)}>
          <div className="sdts-large-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="sdts-modal-close" onClick={() => setShowContactModal(false)}>✕</button>
            <h2>✉️ Contact Smart Digital Tailoring System</h2>
            <p>Get in touch for bespoke stitching, measurements appointment, or urgent orders</p>

            <div className="sdts-contact-grid">
              <div className="sdts-contact-info">
                <h3>📍 Studio Address & Info</h3>
                <p><b>📞 Phone:</b> +91 98765 43210 / +91 94440 12345</p>
                <p><b>✉️ Email:</b> support@digitailor.com</p>
                <p><b>📍 Location:</b> Tailoring Atelier Lane, T. Nagar, Chennai - 600017</p>
                <p><b>🕒 Working Hours:</b> Mon - Sat (9:30 AM - 8:30 PM)</p>
              </div>

              <form onSubmit={handleContactSubmit} className="sdts-contact-form">
                <h3>💬 Send Inquiry</h3>
                <input type="text" placeholder="Your Name" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
                <input type="email" placeholder="Your Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                <input type="tel" placeholder="Mobile Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
                <textarea placeholder="Write dress stitching details or inquiry..." value={contactMsg} onChange={(e) => setContactMsg(e.target.value)} required />
                <button type="submit" className="sdts-submit-btn" disabled={contactSuccess}>
                  {contactSuccess ? 'Sending...' : 'Send Message ➔'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT US MODAL */}
      {showAboutModal && (
        <div className="sdts-modal-backdrop" onClick={() => setShowAboutModal(false)}>
          <div className="sdts-large-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="sdts-modal-close" onClick={() => setShowAboutModal(false)}>✕</button>
            <h2>👗 About Smart Digital Tailoring System</h2>
            <p>Women-Only Real-World Smart Tailoring Platform</p>
            <div style={{ marginTop: '16px', lineHeight: '1.6' }}>
              <p>
                <b>Smart Digital Tailoring System</b> is designed specifically for women's bespoke fashion. Customers bring their unstitched fabric, choose dress types, record 10-field measurements, customize necklines and Aari embroidery, receive instant price estimates, pay via QR/UPI, and track live 14-stage stitching.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM STUDIO MODAL */}
      {showCustomStudioModal && (
        <div className="sdts-modal-backdrop" onClick={() => setShowCustomStudioModal(false)}>
          <div className="sdts-large-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="sdts-modal-close" onClick={() => setShowCustomStudioModal(false)}>✕</button>
            <h2>🧵 2D Custom Design Studio</h2>
            <p>Customize necklines, sleeve cuts, back patterns, and Aari embroidery work</p>
            <div className="sdts-studio-grid" style={{ marginTop: '20px' }}>
              <div className="sdts-studio-box"><b>Neckline</b><span>Deep Scalloped Cutwork / Sweetheart / Boat / High Neck</span></div>
              <div className="sdts-studio-box"><b>Sleeve Type</b><span>Elbow Length with Zari Border / Puff / Sleeveless</span></div>
              <div className="sdts-studio-box"><b>Back Cut</b><span>Deep Scallop Cutout with Potli Buttons & Dori</span></div>
              <div className="sdts-studio-box"><b>Embroidery</b><span>Heavy Zardosi / Peacock Maggam Work / Mirror Threadwork</span></div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button type="button" className="sdts-submit-btn" onClick={() => { setShowCustomStudioModal(false); setShowLoginModal(true); }}>
                Log In to Start Custom Design ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY MODAL */}
      {showGalleryModal && (
        <div className="sdts-modal-backdrop" onClick={() => setShowGalleryModal(false)}>
          <div className="sdts-large-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="sdts-modal-close" onClick={() => setShowGalleryModal(false)}>✕</button>
            <h2>🖼️ Tailoring Design Gallery</h2>
            <p>Real-world stitching samples crafted by our master tailors</p>
            <div className="sdts-gallery-grid" style={{ marginTop: '20px' }}>
              {galleryImages.map((g, idx) => (
                <div key={idx} className="sdts-gallery-card">
                  <img src={g.src} alt={g.title} />
                  <span>{g.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MEASUREMENT MODAL */}
      {showMeasurementModal && (
        <div className="sdts-modal-backdrop" onClick={() => setShowMeasurementModal(false)}>
          <div className="sdts-large-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="sdts-modal-close" onClick={() => setShowMeasurementModal(false)}>✕</button>
            <h2>📏 10-Field Precision Measurement Profile</h2>
            <p>Provides exact dress measurements for perfect fitting</p>
            <div className="sdts-meas-grid" style={{ marginTop: '16px' }}>
              <div>1. Bust Size (inches)</div>
              <div>2. Waist (inches)</div>
              <div>3. Hip (inches)</div>
              <div>4. Shoulder Width</div>
              <div>5. Armhole Length</div>
              <div>6. Sleeve Length</div>
              <div>7. Dress Length</div>
              <div>8. Front Neck Depth</div>
              <div>9. Back Neck Depth</div>
              <div>10. Special Fit Notes</div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button type="button" className="sdts-submit-btn" onClick={() => { setShowMeasurementModal(false); setShowLoginModal(true); }}>
                Log In to Save Measurements ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="sdts-modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="sdts-login-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="sdts-modal-close" onClick={() => setShowForgotModal(false)}>✕</button>
            <h2>🔒 Password Recovery</h2>
            <p>Enter your registered email address</p>
            <form onSubmit={handleForgotSubmit} className="sdts-login-form">
              <input type="email" placeholder="customer@digitailor.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
              {forgotMsg && <div className="sdts-alert info">{forgotMsg}</div>}
              <button type="submit" className="sdts-submit-btn">Send Recovery Link</button>
            </form>
          </div>
        </div>
      )}

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



