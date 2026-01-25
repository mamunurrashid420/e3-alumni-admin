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

  // Members
  members: `${API_BASE}/members`,
  member: (id: number) => `${API_BASE}/members/${id}`,

  // Payments
  payments: `${API_BASE}/payments`,
  payment: (id: number) => `${API_BASE}/payments/${id}`,
  approvePayment: (id: number) => `${API_BASE}/payments/${id}/approve`,
  rejectPayment: (id: number) => `${API_BASE}/payments/${id}/reject`,

  // Self Declarations
  selfDeclarations: `${API_BASE}/self-declarations`,
  selfDeclaration: (id: number) => `${API_BASE}/self-declarations/${id}`,
  approveSelfDeclaration: (id: number) =>
    `${API_BASE}/self-declarations/${id}/approve`,
  rejectSelfDeclaration: (id: number) =>
    `${API_BASE}/self-declarations/${id}/reject`,
} as const;
