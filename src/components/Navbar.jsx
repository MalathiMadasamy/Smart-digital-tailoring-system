import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNavigate } from '../router/Router.jsx';

export function Navbar() {
  const { user, activeRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="app-topbar">
      <div className="topbar-left" onClick={() => navigate(`/${activeRole || 'customer'}-dashboard`)} style={{ cursor: 'pointer' }}>
        <span className="brand-icon">✂</span>
        <span className="brand-name">{t('brandName')}</span>
        {activeRole && (
          <span className={`role-badge ${activeRole}`}>
            {activeRole.toUpperCase()} WORKSPACE
          </span>
        )}
      </div>

      <div className="topbar-right">
        {/* Language Selector Dropdown */}
        <div className="language-selector-box">
          <span className="lang-icon">🌐</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="lang-select-dropdown"
            title="Select Language"
          >
            <option value="en">English</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>

        {/* Theme Mode Toggle Button */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        {user && (
          <div className="user-profile-summary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
            <div className="user-info-text-col" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span className="user-name-text" style={{ fontWeight: 'bold', fontSize: '13px' }}>{user.name}</span>
              <span className="user-role-label" style={{ fontSize: '11px', opacity: 0.8, textTransform: 'capitalize' }}>
                {activeRole === 'admin' ? 'Administrator' : activeRole === 'tailor' ? 'Master Tailor' : 'Customer'}
              </span>
            </div>
          </div>
        )}

        <button type="button" className="logout-btn" onClick={logout} title={t('logout')}>
          {t('logout')}
        </button>
      </div>
    </header>
  );
}
