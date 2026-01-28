// API Response Types

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type SelfDeclarationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type PaymentPurpose =
  | 'ASSOCIATE_MEMBERSHIP_FEES'
  | 'GENERAL_MEMBERSHIP_FEES'
  | 'LIFETIME_MEMBERSHIP_FEES'
  | 'SPECIAL_YEARLY_CONTRIBUTION_EXECUTIVE'
  | 'DONATIONS'
  | 'PATRON'
  | 'OTHERS';

export type MembershipType = 'GENERAL' | 'LIFETIME' | 'ASSOCIATE';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type TShirtSize = 'XXXL' | 'XXL' | 'XL' | 'L' | 'M' | 'S';

export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

export type StudentshipProofType =
  | 'JSC'
  | 'EIGHT'
  | 'SSC'
  | 'METRIC_CERTIFICATE'
  | 'MARK_SHEET'
  | 'OTHERS';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'member';
  primary_member_type: string | null;
  secondary_member_type_id: number | null;
  member_id: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface MembershipApplication {
  id: number;
  membership_type: MembershipType;
  full_name: string;
  name_bangla: string | null;
  father_name: string | null;
  mother_name: string | null;
  gender: Gender;
  jsc_year: number | null;
  ssc_year: number | null;
  studentship_proof_type: StudentshipProofType | null;
  studentship_proof_file: string | null;
  highest_educational_degree: string | null;
  present_address: string | null;
  permanent_address: string | null;
  email: string | null;
  mobile_number: string | null;
  profession: string | null;
  designation: string | null;
  institute_name: string | null;
  t_shirt_size: TShirtSize | null;
  blood_group: BloodGroup | null;
  entry_fee: number;
  yearly_fee: number;
  payment_years: number;
  total_paid_amount: number;
  receipt_file: string | null;
  photo: string | null;
  signature: string | null;
  status: ApplicationStatus;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface ApplicationDetailResponse {
  data: MembershipApplication;
}

export interface ApproveApplicationResponse {
  message: string;
  application: MembershipApplication;
  user: {
    id: number;
    name: string;
    email: string;
    member_id: string;
  };
}

export interface RejectApplicationResponse {
  message: string;
  application: MembershipApplication;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface LogoutResponse {
  message: string;
}

export interface SecondaryMemberType {
  id: number;
  name: string;
  description: string;
}

export interface Member {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'member';
  primary_member_type: MembershipType | null;
  secondary_member_type: SecondaryMemberType | null;
  member_id: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  member_id: string | null;
  name: string;
  address: string;
  mobile_number: string;
  payment_purpose: PaymentPurpose;
  payment_amount: number;
  payment_proof_file: string | null;
  receipt_file: string | null;
  status: PaymentStatus;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentDetailResponse {
  data: Payment;
}

export interface ApprovePaymentResponse {
  message: string;
  payment: Payment;
}

export interface RejectPaymentResponse {
  message: string;
  payment: Payment;
}

export interface MemberType {
  id: number;
  name: string;
  description: string | null;
}

export interface SelfDeclaration {
  id: number;
  user?: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    member_id: string | null;
  };
  name: string;
  signature_file: string | null;
  secondary_member_type?: MemberType;
  date: string;
  status: SelfDeclarationStatus;
  approved_by?: {
    id: number;
    name: string;
  };
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SelfDeclarationDetailResponse {
  data: SelfDeclaration;
}

export interface ApproveSelfDeclarationResponse {
  message: string;
  self_declaration: SelfDeclaration;
}

export interface RejectSelfDeclarationResponse {
  message: string;
  self_declaration: SelfDeclaration;
}
