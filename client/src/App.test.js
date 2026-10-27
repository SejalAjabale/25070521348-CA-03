import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

// Mock apiClient calls so tests don't depend on live network
jest.mock('./api/apiClient', () => {
  const mockAxios = {
    get: jest.fn((url) => {
      if (url === '/auth/me') {
        return Promise.reject({ response: { status: 401 } });
      }
      if (url.includes('/bookings/stats')) {
        return Promise.resolve({
          data: {
            total: 5,
            pending: 2,
            inProgress: 1,
            completed: 2,
            cancelled: 0,
            totalRevenue: 280
          }
        });
      }
      if (url.startsWith('/bookings')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    }),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  };
  return mockAxios;
});

describe('Apex Detailed Wash - Frontend App Tests', () => {
  test('renders brand title and primary navigation tabs', async () => {
    await act(async () => {
      render(<App />);
    });

    const brandElements = screen.getAllByText(/APEX DETAILED WASH/i);
    expect(brandElements.length).toBeGreaterThan(0);

    const bookTabs = screen.getAllByText(/Book Appointment/i);
    expect(bookTabs.length).toBeGreaterThan(0);

    const packagesTabs = screen.getAllByText(/Packages & Pricing/i);
    expect(packagesTabs.length).toBeGreaterThan(0);

    const aboutTabs = screen.getAllByText(/About & Guarantee/i);
    expect(aboutTabs.length).toBeGreaterThan(0);
  });

  test('renders appointment metrics cards', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText(/Pending Washes/i)).toBeInTheDocument();
    expect(screen.getByText(/In Bay Now/i)).toBeInTheDocument();
    expect(screen.getByText(/Delivered Shiny/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Appointments/i)).toBeInTheDocument();
  });

  test('renders reservation form fields on default tab', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText(/Reserve Your Precision Wash Slot/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Car Model & Make/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm & Schedule Wash Slot/i)).toBeInTheDocument();
  });

  test('opens Login modal when Sign In button is clicked', async () => {
    await act(async () => {
      render(<App />);
    });

    const signInButtons = screen.getAllByText(/Sign In/i);
    fireEvent.click(signInButtons[0]);

    expect(screen.getByText(/Welcome to Apex Wash/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email or Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Account/i })).toBeInTheDocument();
  });

  test('opens Signup modal when Register button is clicked', async () => {
    await act(async () => {
      render(<App />);
    });

    const registerButtons = screen.getAllByText(/Register/i);
    fireEvent.click(registerButtons[0]);

    expect(screen.getByText(/Create Your Apex Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Apex Account/i)).toBeInTheDocument();
  });

  test('switches between tabs accurately', async () => {
    await act(async () => {
      render(<App />);
    });

    const packagesTabs = screen.getAllByText(/Packages & Pricing/i);
    fireEvent.click(packagesTabs[0]);

    expect(screen.getByText(/Precision Detailing Packages/i)).toBeInTheDocument();
    const pkgElements = screen.getAllByText(/Ceramic Detail Wash/i);
    expect(pkgElements.length).toBeGreaterThan(0);
    const spaElements = screen.getAllByText(/Interior & Exterior Deep Spa/i);
    expect(spaElements.length).toBeGreaterThan(0);
  });
});
