import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Car, Shield, KeyRound, X, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, onNotify }) => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'security'

  // Details form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredCarModel, setPreferredCarModel] = useState(user?.preferredCarModel || '');
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsMsg, setDetailsMsg] = useState('');
  const [detailsError, setDetailsError] = useState('');

  // Security form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMsg, setSecurityMsg] = useState('');
  const [securityError, setSecurityError] = useState('');

  if (!isOpen || !user) return null;

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setDetailsError('');
    setDetailsMsg('');

    if (!name.trim()) {
      setDetailsError('Name cannot be empty.');
      return;
    }

    setDetailsLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        preferredCarModel: preferredCarModel.trim()
      });
      setDetailsLoading(false);
      setDetailsMsg('Profile updated successfully!');
      if (onNotify) onNotify('Profile details updated successfully');
      setTimeout(() => setDetailsMsg(''), 4000);
    } catch (err) {
      setDetailsLoading(false);
      setDetailsError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecurityMsg('');

    if (!currentPassword || !newPassword) {
      setSecurityError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }

    setSecurityLoading(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmNewPassword });
      setSecurityLoading(false);
      setSecurityMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      if (onNotify) onNotify('Security credentials updated');
      setTimeout(() => setSecurityMsg(''), 4000);
    } catch (err) {
      setSecurityLoading(false);
      setSecurityError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <div className="modal-card profile-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="profile-header">
          <div className="profile-avatar-large">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 id="profile-title" className="profile-name">{user.name}</h2>
            <div className="profile-badges">
              <span className={`badge-role badge-role-${user.role || 'customer'}`}>
                <Shield size={13} /> {user.role ? user.role.toUpperCase() : 'CUSTOMER'}
              </span>
              <span className="profile-email-badge">
                <Mail size={13} /> {user.email}
              </span>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="profile-nav-tabs">
          <button
            type="button"
            className={`profile-nav-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <User size={16} /> Profile Details
          </button>
          <button
            type="button"
            className={`profile-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <KeyRound size={16} /> Security & Password
          </button>
        </div>

        {activeTab === 'details' ? (
          <form onSubmit={handleUpdateDetails} className="auth-form profile-form">
            {detailsMsg && (
              <div className="auth-alert auth-alert-success">
                <CheckCircle2 size={18} />
                <span>{detailsMsg}</span>
              </div>
            )}
            {detailsError && (
              <div className="auth-alert auth-alert-error">
                <AlertCircle size={18} />
                <span>{detailsError}</span>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="prof-name">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  id="prof-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="prof-phone">Contact Phone</label>
              <div className="input-with-icon">
                <Phone size={18} className="field-icon" />
                <input
                  id="prof-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="prof-car">Default Car Model</label>
              <div className="input-with-icon">
                <Car size={18} className="field-icon" />
                <input
                  id="prof-car"
                  type="text"
                  value={preferredCarModel}
                  onChange={(e) => setPreferredCarModel(e.target.value)}
                  placeholder="e.g. Porsche 911 GT3"
                />
              </div>
            </div>

            <div className="profile-action-buttons">
              <button
                type="submit"
                className="btn-primary"
                disabled={detailsLoading}
              >
                {detailsLoading ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
              <button
                type="button"
                className="btn-danger-outline"
                onClick={() => {
                  logout();
                  onClose();
                  if (onNotify) onNotify('Successfully signed out');
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="auth-form profile-form">
            {securityMsg && (
              <div className="auth-alert auth-alert-success">
                <CheckCircle2 size={18} />
                <span>{securityMsg}</span>
              </div>
            )}
            {securityError && (
              <div className="auth-alert auth-alert-error">
                <AlertCircle size={18} />
                <span>{securityError}</span>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="curr-pass">Current Password</label>
              <div className="input-with-icon">
                <KeyRound size={18} className="field-icon" />
                <input
                  id="curr-pass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="new-pass">New Password</label>
              <div className="input-with-icon">
                <KeyRound size={18} className="field-icon" />
                <input
                  id="new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters (letters & numbers)"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-new-pass">Confirm New Password</label>
              <div className="input-with-icon">
                <KeyRound size={18} className="field-icon" />
                <input
                  id="confirm-new-pass"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={securityLoading}
            >
              {securityLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
