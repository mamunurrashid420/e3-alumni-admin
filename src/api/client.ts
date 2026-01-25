import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  LoginResponse,
  User,
  PaginatedResponse,
  MembershipApplication,
  ApplicationDetailResponse,
  ApproveApplicationResponse,
  RejectApplicationResponse,
  ApiError,
  LogoutResponse,
  ApplicationStatus,
  Member,
  MembershipType,
  Payment,
  PaymentStatus,
  PaymentDetailResponse,
  ApprovePaymentResponse,
  RejectPaymentResponse,
  SelfDeclaration,
  SelfDeclarationStatus,
  SelfDeclarationDetailResponse,
  ApproveSelfDeclarationResponse,
  RejectSelfDeclarationResponse,
} from '@/types/api';
import { endpoints } from './endpoints';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        // Handle 401 - Unauthorized (token expired/invalid)
        if (error.response?.status === 401) {
          this.clearToken();
          // Redirect to login will be handled by ProtectedRoute
        }

        // Transform error to a more usable format
        if (error.response) {
          const apiError: ApiError = {
            message:
              error.response.data?.message ||
              `HTTP error! status: ${error.response.status}`,
            errors: error.response.data?.errors,
          };
          return Promise.reject(apiError);
        }
        return Promise.reject({
          message: error.message || 'An error occurred',
        } as ApiError);
      }
    );
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Authentication methods
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>(endpoints.login, {
      email_or_phone: email,
      password,
    });
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async logout(): Promise<LogoutResponse> {
    const response = await this.client.post<LogoutResponse>(endpoints.logout);
    this.clearToken();
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>(endpoints.currentUser);
    return response.data;
  }

  // Membership Applications methods
  async getApplications(
    status?: ApplicationStatus
  ): Promise<PaginatedResponse<MembershipApplication>> {
    const params = status ? { status } : {};
    const response = await this.client.get<
      PaginatedResponse<MembershipApplication>
    >(endpoints.applications, { params });
    return response.data;
  }

  async getApplication(
    id: number
  ): Promise<ApplicationDetailResponse> {
    const response = await this.client.get<ApplicationDetailResponse>(
      endpoints.application(id)
    );
    return response.data;
  }

  async approveApplication(
    id: number
  ): Promise<ApproveApplicationResponse> {
    const response = await this.client.post<ApproveApplicationResponse>(
      endpoints.approveApplication(id)
    );
    return response.data;
  }

  async rejectApplication(
    id: number
  ): Promise<RejectApplicationResponse> {
    const response = await this.client.post<RejectApplicationResponse>(
      endpoints.rejectApplication(id)
    );
    return response.data;
  }

  // Member Management
  async getMembers(
    search?: string,
    primaryMemberType?: MembershipType,
    page: number = 1
  ): Promise<PaginatedResponse<Member>> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (primaryMemberType) params.primary_member_type = primaryMemberType;
    if (page > 1) params.page = page.toString();
    
    const response = await this.client.get<PaginatedResponse<Member>>(
      endpoints.members,
      { params }
    );
    return response.data;
  }

  async getMember(id: number): Promise<{ data: Member }> {
    const response = await this.client.get<{ data: Member }>(
      endpoints.member(id)
    );
    return response.data;
  }

  // Payment Management
  async getPayments(status?: PaymentStatus): Promise<PaginatedResponse<Payment>> {
    const params = status ? { status } : {};
    const response = await this.client.get<PaginatedResponse<Payment>>(
      endpoints.payments,
      { params }
    );
    return response.data;
  }

  async getPayment(id: number): Promise<PaymentDetailResponse> {
    const response = await this.client.get<PaymentDetailResponse>(
      endpoints.payment(id)
    );
    return response.data;
  }

  async updatePayment(
    id: number,
    data: Partial<Payment>
  ): Promise<PaymentDetailResponse> {
    const response = await this.client.put<PaymentDetailResponse>(
      endpoints.payment(id),
      data
    );
    return response.data;
  }

  async approvePayment(id: number): Promise<ApprovePaymentResponse> {
    const response = await this.client.post<ApprovePaymentResponse>(
      endpoints.approvePayment(id)
    );
    return response.data;
  }

  async rejectPayment(id: number): Promise<RejectPaymentResponse> {
    const response = await this.client.post<RejectPaymentResponse>(
      endpoints.rejectPayment(id)
    );
    return response.data;
  }

  // Self Declaration Management
  async getSelfDeclarations(
    status?: SelfDeclarationStatus
  ): Promise<PaginatedResponse<SelfDeclaration>> {
    const params = status ? { status } : {};
    const response = await this.client.get<PaginatedResponse<SelfDeclaration>>(
      endpoints.selfDeclarations,
      { params }
    );
    return response.data;
  }

  async getSelfDeclaration(id: number): Promise<SelfDeclarationDetailResponse> {
    const response = await this.client.get<SelfDeclarationDetailResponse>(
      endpoints.selfDeclaration(id)
    );
    return response.data;
  }

  async approveSelfDeclaration(
    id: number
  ): Promise<ApproveSelfDeclarationResponse> {
    const response = await this.client.post<ApproveSelfDeclarationResponse>(
      endpoints.approveSelfDeclaration(id)
    );
    return response.data;
  }

  async rejectSelfDeclaration(
    id: number,
    rejectedReason?: string
  ): Promise<RejectSelfDeclarationResponse> {
    const response = await this.client.post<RejectSelfDeclarationResponse>(
      endpoints.rejectSelfDeclaration(id),
      { rejected_reason: rejectedReason }
    );
    return response.data;
  }
}

export const apiClient = new ApiClient();
