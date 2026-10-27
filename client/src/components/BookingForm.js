import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { Car, Calendar, Clock, CheckCircle2, AlertCircle, FileText, Sparkles, User, Mail, Phone } from 'lucide-react';
import { PACKAGES } from './ServicePackages';

const TIME_SLOTS = [
  '08:30 AM',
  '10:00 AM',
  '11:30 AM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM'
];

const BookingForm = ({ preselectedPackage, onBookingCreated, onNavigateToHistory }) => {
  const { user, isAuthenticated } = useAuth();

  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    carModel: user?.preferredCarModel || '',
    serviceType: preselectedPackage || 'Ceramic Detail Wash',
    date: today,
    timeSlot: '10:00 AM',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize form if user logs in or profile changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        carModel: prev.carModel || user.preferredCarModel || ''
      }));
    }
  }, [user]);

  // Synchronize if a package was clicked from the packages tab
  useEffect(() => {
    if (preselectedPackage) {
      setFormData((prev) => ({ ...prev, serviceType: preselectedPackage }));
    }
  }, [preselectedPackage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectedPkgDetails = PACKAGES.find((p) => p.name === formData.serviceType) || PACKAGES[1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.carModel.trim() || !formData.date) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/bookings', formData);
      setSuccessBooking(res.data);
      setLoading(false);
      if (onBookingCreated) {
        onBookingCreated('Appointment successfully scheduled!');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Failed to create booking. Please try again.');
    }
  };

  const resetForm = () => {
    setSuccessBooking(null);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      carModel: user?.preferredCarModel || '',
      serviceType: 'Ceramic Detail Wash',
      date: today,
      timeSlot: '10:00 AM',
      notes: ''
    });
  };

  if (successBooking) {
    return (
      <div className="glass-panel booking-success-card">
        <div className="success-icon-wrap">
          <CheckCircle2 size={56} className="icon-success" />
        </div>
        <h3 className="success-title">Appointment Confirmed!</h3>
        <p className="success-desc">
          Your reservation has been locked in. We have sent a detailed receipt and reminder to{' '}
          <strong className="highlight-text">{successBooking.email}</strong>.
        </p>

        <div className="booking-summary-box">
          <div className="summary-item">
            <span>Booking ID:</span>
            <strong>#{successBooking._id.slice(-6).toUpperCase()}</strong>
          </div>
          <div className="summary-item">
            <span>Customer:</span>
            <strong>{successBooking.name}</strong>
          </div>
          <div className="summary-item">
            <span>Vehicle:</span>
            <strong>{successBooking.carModel}</strong>
          </div>
          <div className="summary-item">
            <span>Package:</span>
            <strong>{successBooking.serviceType} (${successBooking.price})</strong>
          </div>
          <div className="summary-item">
            <span>Scheduled Date:</span>
            <strong>{successBooking.date} at {successBooking.timeSlot}</strong>
          </div>
          <div className="summary-item">
            <span>Status:</span>
            <span className="badge badge-pending">{successBooking.status}</span>
          </div>
        </div>

        <div className="success-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={onNavigateToHistory}
          >
            View in Appointment Logs
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={resetForm}
          >
            Schedule Another Vehicle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel booking-form-panel">
      <div className="panel-header-wrap">
        <h2 className="panel-title">
          <Car size={24} className="icon-cyan" /> Reserve Your Precision Wash Slot
        </h2>
        <span className="live-status-pill">
          <span className="live-dot" /> Real-time Slot Availability
        </span>
      </div>

      {isAuthenticated && (
        <div className="auth-autofill-banner">
          <Sparkles size={16} className="icon-cyan" />
          <span>
            Logged in as <strong>{user.name}</strong>. Customer details have been pre-filled.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="auth-alert auth-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section-title">
          <User size={16} /> 1. Customer & Contact Details
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="book-name">Full Name *</label>
            <div className="input-with-icon">
              <User size={16} className="field-icon" />
              <input
                id="book-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Alex Mercer"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="book-email">Email Address *</label>
            <div className="input-with-icon">
              <Mail size={16} className="field-icon" />
              <input
                id="book-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="alex@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="book-phone">Phone Number *</label>
            <div className="input-with-icon">
              <Phone size={16} className="field-icon" />
              <input
                id="book-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+1 (555) 019-9283"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="book-car">Car Model & Make *</label>
            <div className="input-with-icon">
              <Car size={16} className="field-icon" />
              <input
                id="book-car"
                type="text"
                name="carModel"
                value={formData.carModel}
                onChange={handleChange}
                required
                placeholder="Porsche 911 GT3 / BMW M3"
              />
            </div>
          </div>
        </div>

        <div className="form-section-title">
          <Sparkles size={16} /> 2. Treatment Package Selection
        </div>

        <div className="package-selector-grid">
          {PACKAGES.map((pkg) => (
            <label
              key={pkg.id}
              className={`package-select-card ${formData.serviceType === pkg.name ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="serviceType"
                value={pkg.name}
                checked={formData.serviceType === pkg.name}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="package-card-inner">
                <div className="pkg-radio-indicator" />
                <div className="pkg-info">
                  <div className="pkg-name">{pkg.name}</div>
                  <div className="pkg-duration">
                    <Clock size={12} /> {pkg.duration}
                  </div>
                </div>
                <div className="pkg-price">${pkg.price}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="form-section-title">
          <Calendar size={16} /> 3. Scheduling Date & Time Slot
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="book-date">Appointment Date *</label>
            <input
              id="book-date"
              type="date"
              name="date"
              min={today}
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Preferred Time Slot *</label>
            <div className="time-slots-pills">
              {TIME_SLOTS.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  className={`time-pill ${formData.timeSlot === slot ? 'active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, timeSlot: slot }))}
                >
                  <Clock size={12} /> {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="book-notes">
            <FileText size={14} /> Special Requests & Instructions (Optional)
          </label>
          <textarea
            id="book-notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="e.g. Please take extra care with carbon fiber trim, child car seat removal, pet hair removal..."
          />
        </div>

        {/* Pricing Summary Box */}
        <div className="pricing-summary-card">
          <div className="summary-row">
            <span>Selected Service:</span>
            <strong>{formData.serviceType}</strong>
          </div>
          <div className="summary-row">
            <span>Estimated Duration:</span>
            <span>{selectedPkgDetails.duration}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${selectedPkgDetails.price}.00</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total Payable at Studio:</span>
            <strong className="price-cyan">${selectedPkgDetails.price}.00</strong>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary btn-submit-booking"
          disabled={loading}
        >
          {loading ? (
            <span className="btn-loading-content">
              <span className="spinner-sm" /> Reserving Appointment Slot...
            </span>
          ) : (
            <>
              Confirm & Schedule Wash Slot (${selectedPkgDetails.price})
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
