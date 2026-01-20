import type {
  ApplicationStatus,
  PaymentStatus,
  PaymentPurpose,
  MembershipType,
  Gender,
  TShirtSize,
  BloodGroup,
  StudentshipProofType,
} from '@/types/api';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
];

export const MEMBERSHIP_TYPES: MembershipType[] = [
  'GENERAL',
  'LIFETIME',
  'ASSOCIATE',
];

export const GENDERS: Gender[] = ['MALE', 'FEMALE', 'OTHER'];

export const T_SHIRT_SIZES: TShirtSize[] = ['XXXL', 'XXL', 'XL', 'L', 'M', 'S'];

export const BLOOD_GROUPS: BloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

export const STUDENTSHIP_PROOF_TYPES: StudentshipProofType[] = [
  'JSC',
  'EIGHT',
  'SSC',
  'METRIC_CERTIFICATE',
  'MARK_SHEET',
  'OTHERS',
];

// Display labels
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const MEMBERSHIP_TYPE_LABELS: Record<MembershipType, string> = {
  GENERAL: 'General',
  LIFETIME: 'Lifetime',
  ASSOCIATE: 'Associate',
};

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

export const PAYMENT_STATUSES: PaymentStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
];

export const PAYMENT_PURPOSES: PaymentPurpose[] = [
  'ASSOCIATE_MEMBERSHIP_FEES',
  'GENERAL_MEMBERSHIP_FEES',
  'LIFETIME_MEMBERSHIP_FEES',
  'SPECIAL_YEARLY_CONTRIBUTION_EXECUTIVE',
  'DONATIONS',
  'PATRON',
  'OTHERS',
];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const PAYMENT_PURPOSE_LABELS: Record<PaymentPurpose, string> = {
  ASSOCIATE_MEMBERSHIP_FEES: 'Associate Membership Fees',
  GENERAL_MEMBERSHIP_FEES: 'General Membership Fees',
  LIFETIME_MEMBERSHIP_FEES: 'Lifetime Membership Fees',
  SPECIAL_YEARLY_CONTRIBUTION_EXECUTIVE: 'Special Yearly Contribution (Executive)',
  DONATIONS: 'Donations',
  PATRON: 'Patron',
  OTHERS: 'Others',
};
