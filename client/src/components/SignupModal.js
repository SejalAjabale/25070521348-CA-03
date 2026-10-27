import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, X, AlertCircle, ArrowRight, CheckCircle2, Phone, Car } from 'lucide-react';

const SignupModal = ({ isOpen, onClose, onSwitchToLogin, onSuccess }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    preferredCarModel: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Password Strength Calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 3) return { score: 2, label: 'Medium', color: '#f59e0b' };
    return { score: 3, label: 'Strong', color: '#10b981' };
  };

  const strength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (!/[0-9]/.test(formData.password) || !/[a-zA-Z]/.test(formData.password)) {
      setErrorMsg('Password must contain both letters and numbers.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!formData.termsAccepted) {
      setErrorMsg('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const registeredUser = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        username: formData.username.trim() || undefined,
        phone: formData.phone.trim(),
        preferredCarModel: formData.preferredCarModel.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      setLoading(false);
      if (onSuccess) onSuccess(`Account created! Welcome to Apex, ${registeredUser.name}!`);
      onClose();
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Registration failed. Please check your information.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="signup-title">
      <div className="modal-card auth-modal-card signup-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="auth-header">
          <div className="auth-icon-badge">
            <UserPlus size={26} />
          </div>
          <h2 id="signup-title" className="auth-title">Create Your Apex Account</h2>
          <p className="auth-subtitle">Join Apex Detailed Wash for faster bookings, appointment tracking, and exclusive discounts.</p>
        </div>

        {errorMsg && (
          <div className="auth-alert auth-alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-row-2">
            <div className="auth-field">
              <label htmlFor="signup-name">Full Name *</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Mercer"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email Address *</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@example.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row-2">
            <div className="auth-field">
              <label htmlFor="signup-phone">Phone Number</label>
              <div className="input-with-icon">
                <Phone size={18} className="field-icon" />
                <input
                  id="signup-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-car">Vehicle Make & Model</label>
              <div className="input-with-icon">
                <Car size={18} className="field-icon" />
                <input
                  id="signup-car"
                  type="text"
                  name="preferredCarModel"
                  value={formData.preferredCarModel}
                  onChange={handleChange}
                  placeholder="e.g. BMW M4 or Tesla Model 3"
                />
              </div>
            </div>
          </div>

          <div className="form-row-2">
            <div className="auth-field">
              <label htmlFor="signup-password">Password *</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 chars (letters & numbers)"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password && (
                <div className="password-strength-bar">
                  <div
                    className="strength-indicator-fill"
                    style={{
                      width: `${(strength.score / 3) * 100}%`,
                      backgroundColor: strength.color
                    }}
                  />
                  <span className="strength-text" style={{ color: strength.color }}>
                    Strength: {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-confirm-password">Confirm Password *</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordsMatch && (
                <span className="field-hint-success">
                  <CheckCircle2 size={13} /> Passwords match
                </span>
              )}
              {passwordsMismatch && (
                <span className="field-hint-error">
                  Passwords do not match
                </span>
              )}
            </div>
          </div>

          <div className="terms-checkbox-group">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                required
              />
              <span className="checkbox-label">
                I agree to the <span className="highlight-text">Terms of Service</span> and <span className="highlight-text">Privacy Policy</span>.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-content">
                <span className="spinner-sm" /> Registering Account...
              </span>
            ) : (
              <>
                Create Apex Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="text-btn-accent"
              onClick={() => {
                onClose();
                if (onSwitchToLogin) onSwitchToLogin();
              }}
            >
              Sign In Instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
