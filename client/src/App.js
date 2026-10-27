import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import apiClient from './api/apiClient';
import Navbar from './components/Navbar';
import BookingForm from './components/BookingForm';
import BookingHistory from './components/BookingHistory';
import ServicePackages from './components/ServicePackages';
import AboutSection from './components/AboutSection';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import ProfileModal from './components/ProfileModal';
import Toast from './components/Toast';
import { Hourglass, CheckCircle, Calendar, Activity } from 'lucide-react';
import './App.css';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('book');
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [preselectedPackage, setPreselectedPackage] = useState('Ceramic Detail Wash');

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Guest booking lookup state
  const [guestEmail, setGuestEmail] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'success' });
    }, 4500);
  };

  // Fetch bookings from backend API
  const fetchBookings = useCallback(async (customEmail) => {
    setLoading(true);
    try {
      let url = '/bookings';
      const searchEmail = customEmail || guestEmail;
      if (!isAuthenticated && searchEmail) {
        url += `?email=${encodeURIComponent(searchEmail.trim())}`;
      }
      const res = await apiClient.get(url);
      if (res && res.data) {
        setBookings(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, guestEmail]);

  // Fetch dashboard statistics
  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get('/bookings/stats');
      if (res && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [fetchBookings, fetchStats, isAuthenticated]);

  const handleStatusChange = async (id, status) => {
    try {
      await apiClient.patch(`/bookings/${id}/status`, { status });
      showToast(`Appointment status updated to ${status}.`);
      fetchBookings();
      fetchStats();
    } catch (err) {
      console.error('Error updating status:', err);
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      await apiClient.delete(`/bookings/${id}`);
      showToast('Appointment record removed.');
      fetchBookings();
      fetchStats();
    } catch (err) {
      console.error('Error deleting booking:', err);
      showToast(err.response?.data?.message || 'Failed to remove booking.', 'error');
    }
  };

  const handleSelectPackageFromCards = (pkgName) => {
    setPreselectedPackage(pkgName);
    setActiveTab('book');
    showToast(`Selected ${pkgName} package. Ready to pick date!`, 'info');
  };

  const handleGuestLookup = (e) => {
    e.preventDefault();
    if (guestEmail.trim()) {
      fetchBookings(guestEmail.trim());
      showToast(`Filtered bookings for ${guestEmail}`);
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenSignup={() => setIsSignupOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onNotify={showToast}
      />

      {/* Hero / Quick Stats Grid */}
      <section className="stats-grid" aria-label="Appointment Metrics">
        <div className="stat-card">
          <div className="stat-icon icon-pending">
            <Hourglass size={22} />
          </div>
          <div>
            <div className="stat-val">{stats.pending}</div>
            <div className="stat-label">Pending Washes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-progress">
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-val">{stats.inProgress}</div>
            <div className="stat-label">In Bay Now</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-completed">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="stat-val">{stats.completed}</div>
            <div className="stat-label">Delivered Shiny</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-total">
            <Calendar size={22} />
          </div>
          <div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
        </div>
      </section>

      {/* Active Tab Views */}
      <main className="tab-content-area">
        {activeTab === 'book' && (
          <BookingForm
            preselectedPackage={preselectedPackage}
            onBookingCreated={(msg) => {
              showToast(msg);
              fetchBookings();
              fetchStats();
            }}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'history' && (
          <BookingHistory
            bookings={bookings}
            loading={loading}
            onRefresh={() => {
              fetchBookings();
              fetchStats();
              showToast('Refreshed appointment list', 'info');
            }}
            onStatusChange={handleStatusChange}
            onDeleteBooking={handleDeleteBooking}
            guestEmail={guestEmail}
            setGuestEmail={setGuestEmail}
            onGuestLookup={handleGuestLookup}
          />
        )}

        {activeTab === 'packages' && (
          <ServicePackages onSelectPackage={handleSelectPackageFromCards} />
        )}

        {activeTab === 'about' && <AboutSection />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Apex Detailed Wash. High Performance Automotive Care.</p>
          <div className="footer-links">
            <button type="button" onClick={() => setActiveTab('packages')}>Packages</button>
            <span>•</span>
            <button type="button" onClick={() => setActiveTab('about')}>Craftsmanship</button>
            <span>•</span>
            <button type="button" onClick={() => setActiveTab('book')}>Schedule</button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => setIsSignupOpen(true)}
        onSuccess={(msg) => {
          showToast(msg);
          fetchBookings();
          fetchStats();
        }}
      />

      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => setIsLoginOpen(true)}
        onSuccess={(msg) => {
          showToast(msg);
          fetchBookings();
          fetchStats();
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNotify={showToast}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;