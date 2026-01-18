// API Endpoint Constants

const API_BASE = '/api';

export const endpoints = {
  // Authentication
  login: `${API_BASE}/login`,
  logout: `${API_BASE}/logout`,
  currentUser: `${API_BASE}/user`,

  // Membership Applications
  applications: `${API_BASE}/membership-applications`,
  application: (id: number) => `${API_BASE}/membership-applications/${id}`,
  approveApplication: (id: number) =>
    `${API_BASE}/membership-applications/${id}/approve`,
  rejectApplication: (id: number) =>
    `${API_BASE}/membership-applications/${id}/reject`,
} as const;
