import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject Authorization Bearer token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('apex_wash_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Initial seed bookings for fallback mode on static deployments (e.g. GitHub Pages)
const getStoredBookings = () => {
  try {
    const stored = localStorage.getItem('apex_wash_bookings');
    if (stored) return JSON.parse(stored);
  } catch {}

  const defaultSeed = [
    {
      _id: 'bkg_seed_001',
      name: 'Marcus Sterling',
      email: 'marcus@example.com',
      phone: '+1 (555) 019-9283',
      carModel: 'Porsche 911 GT3 RS',
      serviceType: 'Ceramic Detail Wash',
      date: '2026-11-02',
      timeSlot: '10:00 AM',
      status: 'Pending',
      price: 65,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'bkg_seed_002',
      name: 'Elena Rostova',
      email: 'elena@example.com',
      phone: '+1 (555) 234-8971',
      carModel: 'Audi RS6 Avant',
      serviceType: 'Interior & Exterior Deep Spa',
      date: '2026-10-30',
      timeSlot: '01:30 PM',
      status: 'In Progress',
      price: 120,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: 'bkg_seed_003',
      name: 'David Chen',
      email: 'david@example.com',
      phone: '+1 (555) 872-1142',
      carModel: 'BMW M3 Competition',
      serviceType: 'Paint Correction & Ultra Coat',
      date: '2026-10-25',
      timeSlot: '09:00 AM',
      status: 'Completed',
      price: 220,
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];
  localStorage.setItem('apex_wash_bookings', JSON.stringify(defaultSeed));
  return defaultSeed;
};

// Fallback handler for static environments (GitHub Pages) when backend server is offline
const handleStaticFallback = (error) => {
  const config = error.config;
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});

  // 1. Auth routes fallback
  if (url.includes('/auth/login')) {
    const identifier = data.identifier || data.email || 'alex@example.com';
    const mockUser = {
      _id: 'usr_' + Date.now(),
      name: identifier.includes('@') ? identifier.split('@')[0].replace('.', ' ') : identifier,
      email: identifier.includes('@') ? identifier : `${identifier}@example.com`,
      username: identifier.split('@')[0],
      role: 'customer'
    };
    return Promise.resolve({
      status: 200,
      data: {
        message: 'Login successful (Demo Mode)',
        token: 'demo_token_' + Date.now(),
        user: mockUser
      }
    });
  }

  if (url.includes('/auth/register')) {
    const newUser = {
      _id: 'usr_' + Date.now(),
      name: data.name,
      email: data.email,
      username: data.username || data.email.split('@')[0],
      phone: data.phone || '',
      preferredCarModel: data.preferredCarModel || '',
      role: 'customer'
    };
    return Promise.resolve({
      status: 201,
      data: {
        message: 'Account created successfully (Demo Mode)',
        token: 'demo_token_' + Date.now(),
        user: newUser
      }
    });
  }

  if (url.includes('/auth/me')) {
    const savedUser = localStorage.getItem('apex_wash_user');
    if (savedUser) {
      return Promise.resolve({ status: 200, data: { user: JSON.parse(savedUser) } });
    }
    return Promise.reject(error);
  }

  if (url.includes('/auth/profile')) {
    const savedUser = JSON.parse(localStorage.getItem('apex_wash_user') || '{}');
    const updated = { ...savedUser, ...data };
    return Promise.resolve({ status: 200, data: { message: 'Profile updated', user: updated } });
  }

  if (url.includes('/auth/change-password') || url.includes('/auth/forgot-password')) {
    return Promise.resolve({ status: 200, data: { message: 'Operation successful (Demo Mode)' } });
  }

  // 2. Bookings routes fallback
  if (url.includes('/bookings/stats')) {
    const bookings = getStoredBookings();
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'Pending').length;
    const inProgress = bookings.filter((b) => b.status === 'In Progress').length;
    const completed = bookings.filter((b) => b.status === 'Completed').length;
    const cancelled = bookings.filter((b) => b.status === 'Cancelled').length;
    const totalRevenue = bookings.filter((b) => b.status === 'Completed').reduce((sum, b) => sum + (b.price || 0), 0);

    return Promise.resolve({
      status: 200,
      data: { total, pending, inProgress, completed, cancelled, totalRevenue }
    });
  }

  if (url.includes('/bookings') && method === 'get') {
    const bookings = getStoredBookings();
    return Promise.resolve({ status: 200, data: bookings });
  }

  if (url.includes('/bookings') && method === 'post') {
    const bookings = getStoredBookings();
    const newBooking = {
      _id: 'bkg_' + Date.now(),
      ...data,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    bookings.unshift(newBooking);
    localStorage.setItem('apex_wash_bookings', JSON.stringify(bookings));
    return Promise.resolve({ status: 201, data: newBooking });
  }

  if (url.includes('/bookings') && method === 'patch') {
    const bookings = getStoredBookings();
    const id = url.split('/')[2];
    const item = bookings.find((b) => b._id === id);
    if (item) {
      item.status = data.status;
      localStorage.setItem('apex_wash_bookings', JSON.stringify(bookings));
      return Promise.resolve({ status: 200, data: item });
    }
  }

  if (url.includes('/bookings') && method === 'delete') {
    const bookings = getStoredBookings();
    const id = url.split('/')[2];
    const filtered = bookings.filter((b) => b._id !== id);
    localStorage.setItem('apex_wash_bookings', JSON.stringify(filtered));
    return Promise.resolve({ status: 200, data: { message: 'Booking removed' } });
  }

  return Promise.reject(error);
};

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend is unreachable (common on static GitHub Pages deployment), use resilient demo mode
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      return handleStaticFallback(error);
    }

    if (error.response && error.response.status === 401) {
      const currentToken = localStorage.getItem('apex_wash_auth_token');
      if (currentToken && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('apex_wash_auth_token');
        localStorage.removeItem('apex_wash_user');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
