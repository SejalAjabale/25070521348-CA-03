import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Car, PlusCircle, History, Sparkles, User, LogIn, UserPlus, LogOut, Menu, X, ShieldCheck } from 'lucide-react';

const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenSignup,
  onOpenProfile,
  onNotify
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    if (onNotify) onNotify('You have been signed out.');
  };

  return (
    <header className="header">
      <div className="header-brand-wrap">
        <button
          type="button"
          className="brand-logo-btn"
          onClick={() => handleTabClick('book')}
        >
          <div className="logo-icon-box">
            <Car size={26} />
          </div>
          <div className="logo-text-block">
            <span className="logo-title">APEX DETAILED WASH</span>
            <span className="logo-subtitle">SUPERIOR AUTOMOTIVE FINISHES</span>
          </div>
        </button>
      </div>

      {/* Desktop Navigation Tabs */}
      <nav className="nav-tabs desktop-nav" aria-label="Main navigation">
        <button
          className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
          onClick={() => handleTabClick('book')}
        >
          <PlusCircle size={17} /> Book Appointment
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabClick('history')}
        >
          <History size={17} />
          {user && (user.role === 'admin' || user.role === 'staff')
            ? 'Dispatch & History'
            : 'My Appointments'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`}
          onClick={() => handleTabClick('packages')}
        >
          <Sparkles size={17} /> Packages & Pricing
        </button>
        <button
          className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => handleTabClick('about')}
        >
          <ShieldCheck size={17} /> About & Guarantee
        </button>
      </nav>

      {/* Auth State & Action Buttons */}
      <div className="header-auth desktop-auth">
        {isAuthenticated ? (
          <div className="user-profile-menu">
            <button
              type="button"
              className="user-badge-btn"
              onClick={onOpenProfile}
              title="Manage Profile & Security"
            >
              <div className="user-avatar-small">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-badge-info">
                <span className="user-badge-name">{user.name.split(' ')[0]}</span>
                <span className={`role-pill role-${user.role || 'customer'}`}>
                  {user.role ? user.role.toUpperCase() : 'CUSTOMER'}
                </span>
              </div>
            </button>

            <button
              type="button"
              className="btn-icon-logout"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={17} />
            </button>
          </div>
        ) : (
          <div className="auth-buttons-group">
            <button
              type="button"
              className="btn-auth-login"
              onClick={onOpenLogin}
            >
              <LogIn size={16} /> Sign In
            </button>
            <button
              type="button"
              className="btn-auth-signup"
              onClick={onOpenSignup}
            >
              <UserPlus size={16} /> Register
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle Button */}
      <button
        type="button"
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav-links">
            <button
              className={`mobile-tab-btn ${activeTab === 'book' ? 'active' : ''}`}
              onClick={() => handleTabClick('book')}
            >
              <PlusCircle size={18} /> Book Appointment
            </button>
            <button
              className={`mobile-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => handleTabClick('history')}
            >
              <History size={18} />
              {user && (user.role === 'admin' || user.role === 'staff')
                ? 'Dispatch & History'
                : 'My Appointments'}
            </button>
            <button
              className={`mobile-tab-btn ${activeTab === 'packages' ? 'active' : ''}`}
              onClick={() => handleTabClick('packages')}
            >
              <Sparkles size={18} /> Packages & Pricing
            </button>
            <button
              className={`mobile-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => handleTabClick('about')}
            >
              <ShieldCheck size={18} /> About & Guarantee
            </button>
          </nav>

          <div className="mobile-auth-section">
            {isAuthenticated ? (
              <div className="mobile-user-actions">
                <div className="mobile-user-info">
                  <div className="user-avatar-small">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="user-badge-name">{user.name}</div>
                    <div className="role-pill">{user.role ? user.role.toUpperCase() : 'CUSTOMER'}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-secondary full-width"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                >
                  <User size={16} /> Account Profile
                </button>
                <button
                  type="button"
                  className="btn-danger-outline full-width"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="mobile-guest-actions">
                <button
                  type="button"
                  className="btn-secondary full-width"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                >
                  <LogIn size={16} /> Sign In
                </button>
                <button
                  type="button"
                  className="btn-primary full-width"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSignup();
                  }}
                >
                  <UserPlus size={16} /> Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
