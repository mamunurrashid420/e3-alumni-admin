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
  updateMember: (id: number) => `${API_BASE}/members/${id}`,
  memberProfile: (id: number) => `${API_BASE}/members/${id}/profile`,
  resendSms: (id: number) => `${API_BASE}/members/${id}/resend-sms`,
  renewMembership: (id: number) => `${API_BASE}/members/${id}/renew-membership`,
  disableMember: (id: number) => `${API_BASE}/members/${id}/disable`,
  enableMember: (id: number) => `${API_BASE}/members/${id}/enable`,
  deleteMember: (id: number) => `${API_BASE}/members/${id}`,

  // Payments
  payments: `${API_BASE}/payments`,
  paymentsSummary: `${API_BASE}/payments/summary`,
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

  // About Us content
  conveningCommittee: `${API_BASE}/about/convening-committee`,
  conveningCommitteeMember: (id: number) =>
    `${API_BASE}/about/convening-committee/${id}`,
  advisoryBody: `${API_BASE}/about/advisory-body`,
  advisoryBodyMember: (id: number) => `${API_BASE}/about/advisory-body/${id}`,
  honorBoard: `${API_BASE}/about/honor-board`,
  honorBoardEntry: (id: number) => `${API_BASE}/about/honor-board/${id}`,
  batchRepresentatives: `${API_BASE}/about/batch-representatives`,
  batchRepresentative: (id: number) =>
    `${API_BASE}/about/batch-representatives/${id}`,

  // Downloads
  downloads: `${API_BASE}/downloads`,
  download: (id: number) => `${API_BASE}/downloads/${id}`,

  // Events
  events: `${API_BASE}/events`,
  event: (id: number) => `${API_BASE}/events/${id}`,
  eventRegistrations: (id: number) => `${API_BASE}/events/${id}/registrations`,
  eventPhoto: (eventId: number, photoId: number) =>
    `${API_BASE}/events/${eventId}/photos/${photoId}`,

  // Scholarships
  scholarships: `${API_BASE}/scholarships`,
  scholarship: (id: number) => `${API_BASE}/scholarships/${id}`,
  scholarshipApplications: `${API_BASE}/scholarship-applications`,
  scholarshipApplication: (id: number) =>
    `${API_BASE}/scholarship-applications/${id}`,
  approveScholarshipApplication: (id: number) =>
    `${API_BASE}/scholarship-applications/${id}/approve`,
  rejectScholarshipApplication: (id: number) =>
    `${API_BASE}/scholarship-applications/${id}/reject`,

  // Homepage content
  galleryPhotos: `${API_BASE}/gallery-photos`,
  galleryPhoto: (id: number) => `${API_BASE}/gallery-photos/${id}`,
  notices: `${API_BASE}/notices`,
  notice: (id: number) => `${API_BASE}/notices/${id}`,
  news: `${API_BASE}/news`,
  newsItem: (id: number) => `${API_BASE}/news/${id}`,
  jobs: `${API_BASE}/jobs`,
  job: (id: number) => `${API_BASE}/jobs/${id}`,
} as const;
