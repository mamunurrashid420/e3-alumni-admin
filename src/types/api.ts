// API Response Types

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
  email: string;
  role: 'member';
  primary_member_type: MembershipType | null;
  secondary_member_type: SecondaryMemberType | null;
  member_id: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}
