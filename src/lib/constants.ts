import type {
  ApplicationStatus,
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
