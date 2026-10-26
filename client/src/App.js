import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, Calendar, Clock, History, CheckCircle, Hourglass, PlusCircle } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('book');
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    carModel: '',
    serviceType: 'Ceramic Detail Wash',
    date: '',
    timeSlot: '10:00 AM'
  });
  const [statusMsg, setStatusMsg] = useState('');

  // Fetch all bookings from backend
  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/bookings', formData);
      setStatusMsg('Appointment successfully scheduled!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        carModel: '',
        serviceType: 'Ceramic Detail Wash',
        date: '',
        timeSlot: '10:00 AM'
      });
      fetchBookings();
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      setStatusMsg('Failed to create booking.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Metrics computation
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="header">
        <div className="logo">
          <Car size={32} /> APEX DETAILED WASH
        </div>
        <div className="nav-tabs">
          <button 
            className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
            onClick={() => setActiveTab('book')}
          >
            <PlusCircle size={18} /> Book Appointment
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={18} /> Booking History
          </button>
        </div>
      </header>

      {/* Metrics Counter Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Hourglass size={24} /></div>
          <div>
            <div className="stat-val">{pendingCount}</div>
            <div className="stat-label">Pending Appointments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CheckCircle size={24} /></div>
          <div>
            <div className="stat-val">{completedCount}</div>
            <div className="stat-label">Completed Washes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Calendar size={24} /></div>
          <div>
            <div className="stat-val">{bookings.length}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>
      </div>

      {/* Tab 1: Booking Form */}
      {activeTab === 'book' && (
        <div className="glass-panel">
          <h2 className="panel-title"><Car size={22} /> Reserve Your Wash Slot</h2>
          {statusMsg && <div style={{ color: '#00f2fe', marginBottom: '15px' }}>{statusMsg}</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Alex Mercer" />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="alex@example.com" />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+1 555-0199" />
            </div>

            <div className="form-group">
              <label>Car Model & Make</label>
              <input type="text" name="carModel" value={formData.carModel} onChange={handleChange} required placeholder="Porsche 911 GT3" />
            </div>

            <div className="form-group">
              <label>Service Package</label>
              <select name="serviceType" value={formData.serviceType} onChange={handleChange}>
                <option value="Express Wash">Express Wash ($30)</option>
                <option value="Ceramic Detail Wash">Ceramic Detail Wash ($65)</option>
                <option value="Interior & Exterior Deep Spa">Interior & Exterior Spa ($120)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Appointment Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Time Slot</label>
              <select name="timeSlot" value={formData.timeSlot} onChange={handleChange}>
                <option value="09:00 AM">09:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="01:30 PM">01:30 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>

            <button type="submit" className="btn-primary">Confirm Reservation</button>
          </form>
        </div>
      )}

      {/* Tab 2: Booking History & Status Management */}
      {activeTab === 'history' && (
        <div className="glass-panel">
          <h2 className="panel-title"><History size={22} /> Appointment History & Logs</h2>
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8' }}>No appointments booked yet.</td>
                  </tr>
                ) : (
                  bookings.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <strong>{item.name}</strong><br />
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.phone}</span>
                      </td>
                      <td>{item.carModel}</td>
                      <td>{item.serviceType}</td>
                      <td>{item.date} at {item.timeSlot}</td>
                      <td>
                        <span className={`badge ${item.status === 'Pending' ? 'badge-pending' : 'badge-completed'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.status === 'Pending' && (
                          <button 
                            className="status-btn"
                            onClick={() => handleStatusChange(item._id, 'Completed')}
                          >
                            Mark Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;