import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { History, Search, CheckCircle2, Clock, PlayCircle, XCircle, Trash2, Calendar, Car, Mail, Phone, RefreshCw } from 'lucide-react';

const BookingHistory = ({
  bookings,
  loading,
  onRefresh,
  onStatusChange,
  onDeleteBooking,
  guestEmail,
  setGuestEmail,
  onGuestLookup
}) => {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const isStaffOrAdmin = user && (user.role === 'admin' || user.role === 'staff');

  // Filter bookings locally by search term and status
  const filteredBookings = bookings.filter((item) => {
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesStatus;

    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.carModel && item.carModel.toLowerCase().includes(term)) ||
      (item.serviceType && item.serviceType.toLowerCase().includes(term)) ||
      (item.phone && item.phone.toLowerCase().includes(term)) ||
      (item.email && item.email.toLowerCase().includes(term));

    return matchesStatus && matchesSearch;
  });

  const handleUpdate = async (id, status) => {
    setUpdatingId(id);
    await onStatusChange(id, status);
    setUpdatingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this appointment record?')) {
      await onDeleteBooking(id);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'badge-pending';
      case 'In Progress':
        return 'badge-in-progress';
      case 'Completed':
        return 'badge-completed';
      case 'Cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-pending';
    }
  };

  return (
    <div className="glass-panel history-panel">
      <div className="history-header">
        <div className="history-title-wrap">
          <h2 className="panel-title">
            <History size={22} className="icon-cyan" />
            {isStaffOrAdmin ? 'Master Studio Appointment Logs' : 'Your Wash History & Schedule'}
          </h2>
          <p className="history-subtitle">
            {isStaffOrAdmin
              ? 'Real-time vehicle status pipeline and dispatch control.'
              : 'Track upcoming washes, historical service records, and status updates.'}
          </p>
        </div>

        <button
          type="button"
          className="btn-refresh"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh bookings"
        >
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Guest lookup bar if not authenticated */}
      {!isAuthenticated && (
        <div className="guest-lookup-box">
          <div className="lookup-label">
            <Mail size={16} className="icon-cyan" /> Look up appointments by email:
          </div>
          <form onSubmit={onGuestLookup} className="lookup-form">
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="Enter your booking email"
              required
            />
            <button type="submit" className="btn-secondary">
              Search My Bookings
            </button>
          </form>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="history-controls">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer, vehicle, package, or phone..."
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="status-filter-pills">
          {['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              className={`filter-pill ${selectedStatus === st ? 'active' : ''}`}
              onClick={() => setSelectedStatus(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table View */}
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Package</th>
              <th>Date & Slot</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="table-empty-cell">
                  <div className="spinner-center">
                    <span className="spinner-sm" /> Loading appointments...
                  </div>
                </td>
              </tr>
            ) : filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty-cell">
                  <div className="empty-state">
                    <Calendar size={36} className="icon-muted" />
                    <p>No appointments match the current filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBookings.map((item) => (
                <tr key={item._id} className="booking-row">
                  <td>
                    <div className="customer-cell">
                      <strong className="customer-name">{item.name}</strong>
                      <span className="customer-meta">
                        <Phone size={11} /> {item.phone}
                      </span>
                      {item.email && (
                        <span className="customer-meta">
                          <Mail size={11} /> {item.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="vehicle-cell">
                      <Car size={15} className="icon-cyan" />
                      <span>{item.carModel}</span>
                    </div>
                  </td>
                  <td>
                    <div className="package-cell">
                      <span className="package-name">{item.serviceType}</span>
                      <span className="package-price">${item.price || 65}</span>
                    </div>
                  </td>
                  <td>
                    <div className="datetime-cell">
                      <span>{item.date}</span>
                      <span className="time-sub">
                        <Clock size={11} /> {item.timeSlot}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="actions-cell">
                      {/* Staff & Admin Status Controls */}
                      {isStaffOrAdmin ? (
                        <>
                          {item.status === 'Pending' && (
                            <button
                              type="button"
                              className="action-btn action-btn-progress"
                              disabled={updatingId === item._id}
                              onClick={() => handleUpdate(item._id, 'In Progress')}
                              title="Start Wash Service"
                            >
                              <PlayCircle size={14} /> Start
                            </button>
                          )}
                          {(item.status === 'Pending' || item.status === 'In Progress') && (
                            <button
                              type="button"
                              className="action-btn action-btn-complete"
                              disabled={updatingId === item._id}
                              onClick={() => handleUpdate(item._id, 'Completed')}
                              title="Mark as Completed"
                            >
                              <CheckCircle2 size={14} /> Complete
                            </button>
                          )}
                          {item.status !== 'Cancelled' && (
                            <button
                              type="button"
                              className="action-btn action-btn-cancel"
                              disabled={updatingId === item._id}
                              onClick={() => handleUpdate(item._id, 'Cancelled')}
                              title="Cancel Appointment"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            className="action-btn action-btn-delete"
                            onClick={() => handleDelete(item._id)}
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        /* Customer / Guest Controls */
                        <>
                          {item.status === 'Pending' && (
                            <button
                              type="button"
                              className="action-btn action-btn-cancel"
                              disabled={updatingId === item._id}
                              onClick={() => handleUpdate(item._id, 'Cancelled')}
                            >
                              <XCircle size={14} /> Cancel Booking
                            </button>
                          )}
                          {item.status === 'Completed' && (
                            <span className="action-tag-done">Service Delivered</span>
                          )}
                          {item.status === 'Cancelled' && (
                            <span className="action-tag-cancelled">Cancelled</span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingHistory;
