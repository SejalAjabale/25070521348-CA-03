import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, X, AlertCircle, ArrowRight, Sparkles, Key } from 'lucide-react';
import apiClient from '../api/apiClient';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup, onSuccess }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter both your email/username and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(identifier.trim(), password);
      setLoading(false);
      if (onSuccess) onSuccess(`Welcome back, ${loggedInUser.name}!`);
      onClose();
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      setErrorMsg(msg);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg('');
    setErrorMsg('');

    if (!forgotEmail.trim()) {
      setErrorMsg('Please enter your email address to receive reset instructions.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email: forgotEmail.trim() });
      setForgotLoading(false);
      setForgotMsg(res.data.message || 'Password reset instructions have been sent.');
    } catch (err) {
      setForgotLoading(false);
      setErrorMsg(err.response?.data?.message || 'Failed to request password reset.');
    }
  };


  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="login-title">
      <div className="modal-card auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {!forgotMode ? (
          <>
            <div className="auth-header">
              <div className="auth-icon-badge">
                <LogIn size={26} />
              </div>
              <h2 id="login-title" className="auth-title">Welcome to Apex Wash</h2>
              <p className="auth-subtitle">Sign in to manage your appointments, vehicle history, and loyalty tier.</p>
            </div>

            {errorMsg && (
              <div className="auth-alert auth-alert-error" role="alert">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="auth-field">
                <label htmlFor="login-identifier">Email or Username</label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="login-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com or username"
                    autoComplete="username"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="field-header">
                  <label htmlFor="login-password">Password</label>
                  <button
                    type="button"
                    className="text-btn forgot-link"
                    onClick={() => {
                      setForgotMode(true);
                      setErrorMsg('');
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
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
              </div>

              <button
                type="submit"
                className="btn-primary auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading-content">
                    <span className="spinner-sm" /> Authenticating...
                  </span>
                ) : (
                  <>
                    Sign In to Account <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  className="text-btn-accent"
                  onClick={() => {
                    onClose();
                    if (onSwitchToSignup) onSwitchToSignup();
                  }}
                >
                  Create an Account
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="auth-header">
              <div className="auth-icon-badge">
                <Key size={26} />
              </div>
              <h2 id="login-title" className="auth-title">Reset Your Password</h2>
              <p className="auth-subtitle">Enter your registered email address and we'll send verification instructions.</p>
            </div>

            {errorMsg && (
              <div className="auth-alert auth-alert-error" role="alert">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {forgotMsg && (
              <div className="auth-alert auth-alert-success" role="alert">
                <Sparkles size={18} />
                <span>{forgotMsg}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="auth-form" noValidate>
              <div className="auth-field">
                <label htmlFor="forgot-email">Account Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary auth-submit-btn"
                disabled={forgotLoading}
              >
                {forgotLoading ? (
                  <span className="btn-loading-content">
                    <span className="spinner-sm" /> Sending Reset Link...
                  </span>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>

              <button
                type="button"
                className="btn-secondary auth-back-btn"
                onClick={() => {
                  setForgotMode(false);
                  setErrorMsg('');
                  setForgotMsg('');
                }}
              >
                Back to Sign In
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
