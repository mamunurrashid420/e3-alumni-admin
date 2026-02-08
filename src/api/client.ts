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
  PaymentsSummaryResponse,
  ApprovePaymentResponse,
  RejectPaymentResponse,
  SelfDeclaration,
  SelfDeclarationStatus,
  SelfDeclarationDetailResponse,
  ApproveSelfDeclarationResponse,
  RejectSelfDeclarationResponse,
  ConveningCommitteeMember,
  AdvisoryBodyMember,
  HonorBoardEntry,
  BatchRepresentative,
  AboutListResponse,
  HonorBoardRole,
  Download,
  EventListResponse,
  EventDetailResponse,
  EventRegistrationsResponse,
  EventStatus,
  ScholarshipApplication,
  ScholarshipApplicationStatus,
  ScholarshipListResponse,
  ScholarshipDetailResponse,
  ScholarshipApplicationDetailResponse,
  ApproveScholarshipApplicationResponse,
  RejectScholarshipApplicationResponse,
} from '@/types/api';
import { endpoints } from './endpoints';
import { getCookie, setCookie, removeCookie } from '@/lib/cookie';

const AUTH_TOKEN_COOKIE = 'auth_token';

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

    // Request interceptor: add auth token; drop Content-Type for FormData so multipart is used
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
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

  getToken(): string | null {
    return getCookie(AUTH_TOKEN_COOKIE);
  }

  setToken(token: string): void {
    setCookie(AUTH_TOKEN_COOKIE, token);
  }

  clearToken(): void {
    removeCookie(AUTH_TOKEN_COOKIE);
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
    status?: ApplicationStatus,
    perPage?: number
  ): Promise<PaginatedResponse<MembershipApplication>> {
    const params: Record<string, string | number> = {};
    if (status) params.status = status;
    if (perPage != null) params.per_page = perPage;
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
    page: number = 1,
    perPage?: number
  ): Promise<PaginatedResponse<Member>> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (primaryMemberType) params.primary_member_type = primaryMemberType;
    if (page > 1) params.page = page.toString();
    if (perPage != null) params.per_page = perPage.toString();
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

  async updateMember(
    id: number,
    data: { name: string; email?: string | null; phone: string }
  ): Promise<Member & { phone_changed?: boolean }> {
    const response = await this.client.put<
      Member & { phone_changed?: boolean }
    >(endpoints.updateMember(id), data);
    return response.data;
  }

  async resendSms(id: number): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      endpoints.resendSms(id)
    );
    return response.data;
  }

  async renewMembership(
    id: number,
    years: 1 | 2 | 3
  ): Promise<{ data: Member }> {
    const response = await this.client.post<{ data: Member }>(
      endpoints.renewMembership(id),
      { years }
    );
    return response.data;
  }

  async disableMember(id: number): Promise<Member> {
    const response = await this.client.post<{ data: Member }>(
      endpoints.disableMember(id)
    );
    const body = response.data as { data?: Member };
    return body.data ?? body as Member;
  }

  async enableMember(id: number): Promise<Member> {
    const response = await this.client.post<{ data: Member }>(
      endpoints.enableMember(id)
    );
    const body = response.data as { data?: Member };
    return body.data ?? body as Member;
  }

  async deleteMember(id: number): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(
      endpoints.deleteMember(id)
    );
    return response.data;
  }

  async updateMemberProfile(
    id: number,
    data: {
      name_bangla?: string | null;
      father_name?: string | null;
      mother_name?: string | null;
      gender?: string | null;
      jsc_year?: number | null;
      ssc_year?: number | null;
      highest_educational_degree?: string | null;
      present_address?: string | null;
      permanent_address?: string | null;
      profession?: string | null;
      designation?: string | null;
      institute_name?: string | null;
      t_shirt_size?: string | null;
      blood_group?: string | null;
    }
  ): Promise<{ data: Member }> {
    const response = await this.client.put<{ data: Member }>(
      endpoints.memberProfile(id),
      data
    );
    return response.data;
  }

  // Payment Management
  async getPayments(
    status?: PaymentStatus,
    perPage?: number
  ): Promise<PaginatedResponse<Payment>> {
    const params: Record<string, string | number> = status ? { status } : {};
    if (perPage != null) params.per_page = perPage;
    const response = await this.client.get<PaginatedResponse<Payment>>(
      endpoints.payments,
      { params }
    );
    return response.data;
  }

  async getPaymentsSummary(): Promise<PaymentsSummaryResponse> {
    const response = await this.client.get<PaymentsSummaryResponse>(
      endpoints.paymentsSummary
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
    status?: SelfDeclarationStatus,
    perPage?: number
  ): Promise<PaginatedResponse<SelfDeclaration>> {
    const params: Record<string, string | number> = status ? { status } : {};
    if (perPage != null) params.per_page = perPage;
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

  // Scholarships
  async getScholarships(isActive?: boolean): Promise<ScholarshipListResponse> {
    const params = isActive !== undefined ? { is_active: isActive } : {};
    const response = await this.client.get<ScholarshipListResponse>(
      endpoints.scholarships,
      { params }
    );
    return response.data;
  }

  async getScholarship(id: number): Promise<ScholarshipDetailResponse> {
    const response = await this.client.get<ScholarshipDetailResponse>(
      endpoints.scholarship(id)
    );
    return response.data;
  }

  async createScholarship(data: {
    title: string;
    description?: string | null;
    category?: string | null;
    is_active?: boolean;
    sort_order?: number;
  }): Promise<ScholarshipDetailResponse> {
    const response = await this.client.post<ScholarshipDetailResponse>(
      endpoints.scholarships,
      data
    );
    return response.data;
  }

  async updateScholarship(
    id: number,
    data: Partial<{
      title: string;
      description: string | null;
      category: string | null;
      is_active: boolean;
      sort_order: number;
    }>
  ): Promise<ScholarshipDetailResponse> {
    const response = await this.client.put<ScholarshipDetailResponse>(
      endpoints.scholarship(id),
      data
    );
    return response.data;
  }

  async deleteScholarship(id: number): Promise<void> {
    await this.client.delete(endpoints.scholarship(id));
  }

  // Scholarship Applications
  async getScholarshipApplications(
    status?: ScholarshipApplicationStatus,
    scholarshipId?: number,
    perPage?: number
  ): Promise<PaginatedResponse<ScholarshipApplication>> {
    const params: Record<string, string | number> = {};
    if (status) params.status = status;
    if (scholarshipId) params.scholarship_id = scholarshipId;
    if (perPage != null) params.per_page = perPage;
    const response = await this.client.get<
      PaginatedResponse<ScholarshipApplication>
    >(endpoints.scholarshipApplications, { params });
    return response.data;
  }

  async getScholarshipApplication(
    id: number
  ): Promise<ScholarshipApplicationDetailResponse> {
    const response = await this.client.get<ScholarshipApplicationDetailResponse>(
      endpoints.scholarshipApplication(id)
    );
    return response.data;
  }

  async approveScholarshipApplication(
    id: number
  ): Promise<ApproveScholarshipApplicationResponse> {
    const response = await this.client.post<ApproveScholarshipApplicationResponse>(
      endpoints.approveScholarshipApplication(id)
    );
    return response.data;
  }

  async rejectScholarshipApplication(
    id: number,
    rejectedReason?: string
  ): Promise<RejectScholarshipApplicationResponse> {
    const response = await this.client.post<RejectScholarshipApplicationResponse>(
      endpoints.rejectScholarshipApplication(id),
      { rejected_reason: rejectedReason }
    );
    return response.data;
  }

  private buildAboutFormData(
    data: Record<string, string | number | File | null | undefined>,
    isPut = false
  ): FormData {
    const form = new FormData();
    if (isPut) {
      form.append('_method', 'PUT');
    }
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      if (value instanceof File) {
        form.append(key, value);
      } else if (value !== null) {
        form.append(key, String(value));
      }
    }
    return form;
  }

  // About Us - Convening Committee
  async getConveningCommittee(): Promise<AboutListResponse<ConveningCommitteeMember>> {
    const response = await this.client.get<AboutListResponse<ConveningCommitteeMember>>(
      endpoints.conveningCommittee
    );
    return response.data;
  }

  async createConveningCommitteeMember(
    data: Omit<ConveningCommitteeMember, 'id' | 'created_at' | 'updated_at'> & {
      photo?: File | null;
    }
  ): Promise<{ data: ConveningCommitteeMember }> {
    const body = this.buildAboutFormData(data);
    const response = await this.client.post<{ data: ConveningCommitteeMember }>(
      endpoints.conveningCommittee,
      body
    );
    return response.data;
  }

  async updateConveningCommitteeMember(
    id: number,
    data: Partial<Omit<ConveningCommitteeMember, 'id' | 'created_at' | 'updated_at'>> & {
      photo?: File | null;
    }
  ): Promise<{ data: ConveningCommitteeMember }> {
    const body = this.buildAboutFormData(data, true);
    const response = await this.client.post<{ data: ConveningCommitteeMember }>(
      endpoints.conveningCommitteeMember(id),
      body
    );
    return response.data;
  }

  async deleteConveningCommitteeMember(id: number): Promise<void> {
    await this.client.delete(endpoints.conveningCommitteeMember(id));
  }

  // About Us - Advisory Body
  async getAdvisoryBody(): Promise<AboutListResponse<AdvisoryBodyMember>> {
    const response = await this.client.get<AboutListResponse<AdvisoryBodyMember>>(
      endpoints.advisoryBody
    );
    return response.data;
  }

  async createAdvisoryBodyMember(
    data: Omit<AdvisoryBodyMember, 'id' | 'created_at' | 'updated_at'> & {
      photo?: File | null;
    }
  ): Promise<{ data: AdvisoryBodyMember }> {
    const body = this.buildAboutFormData(data);
    const response = await this.client.post<{ data: AdvisoryBodyMember }>(
      endpoints.advisoryBody,
      body
    );
    return response.data;
  }

  async updateAdvisoryBodyMember(
    id: number,
    data: Partial<Omit<AdvisoryBodyMember, 'id' | 'created_at' | 'updated_at'>> & {
      photo?: File | null;
    }
  ): Promise<{ data: AdvisoryBodyMember }> {
    const body = this.buildAboutFormData(data, true);
    const response = await this.client.post<{ data: AdvisoryBodyMember }>(
      endpoints.advisoryBodyMember(id),
      body
    );
    return response.data;
  }

  async deleteAdvisoryBodyMember(id: number): Promise<void> {
    await this.client.delete(endpoints.advisoryBodyMember(id));
  }

  // About Us - Honor Board
  async getHonorBoard(role?: HonorBoardRole): Promise<AboutListResponse<HonorBoardEntry>> {
    const params = role ? { role } : {};
    const response = await this.client.get<AboutListResponse<HonorBoardEntry>>(
      endpoints.honorBoard,
      { params }
    );
    return response.data;
  }

  async createHonorBoardEntry(
    data: Omit<HonorBoardEntry, 'id' | 'created_at' | 'updated_at'> & {
      photo?: File | null;
    }
  ): Promise<{ data: HonorBoardEntry }> {
    const body = this.buildAboutFormData(data);
    const response = await this.client.post<{ data: HonorBoardEntry }>(
      endpoints.honorBoard,
      body
    );
    return response.data;
  }

  async updateHonorBoardEntry(
    id: number,
    data: Partial<Omit<HonorBoardEntry, 'id' | 'created_at' | 'updated_at'>> & {
      photo?: File | null;
    }
  ): Promise<{ data: HonorBoardEntry }> {
    const body = this.buildAboutFormData(data, true);
    const response = await this.client.post<{ data: HonorBoardEntry }>(
      endpoints.honorBoardEntry(id),
      body
    );
    return response.data;
  }

  async deleteHonorBoardEntry(id: number): Promise<void> {
    await this.client.delete(endpoints.honorBoardEntry(id));
  }

  // About Us - Batch Representatives
  async getBatchRepresentatives(): Promise<AboutListResponse<BatchRepresentative>> {
    const response = await this.client.get<AboutListResponse<BatchRepresentative>>(
      endpoints.batchRepresentatives
    );
    return response.data;
  }

  async createBatchRepresentative(
    data: Omit<BatchRepresentative, 'id' | 'created_at' | 'updated_at'> & {
      photo?: File | null;
    }
  ): Promise<{ data: BatchRepresentative }> {
    const body = this.buildAboutFormData(data);
    const response = await this.client.post<{ data: BatchRepresentative }>(
      endpoints.batchRepresentatives,
      body
    );
    return response.data;
  }

  async updateBatchRepresentative(
    id: number,
    data: Partial<Omit<BatchRepresentative, 'id' | 'created_at' | 'updated_at'>> & {
      photo?: File | null;
    }
  ): Promise<{ data: BatchRepresentative }> {
    const body = this.buildAboutFormData(data, true);
    const response = await this.client.post<{ data: BatchRepresentative }>(
      endpoints.batchRepresentative(id),
      body
    );
    return response.data;
  }

  async deleteBatchRepresentative(id: number): Promise<void> {
    await this.client.delete(endpoints.batchRepresentative(id));
  }

  // Downloads
  async getDownloads(): Promise<AboutListResponse<Download>> {
    const response = await this.client.get<AboutListResponse<Download>>(
      endpoints.downloads
    );
    return response.data;
  }

  async createDownload(data: {
    title: string;
    description?: string | null;
    file: File;
    sort_order?: number;
  }): Promise<{ data: Download }> {
    const body = this.buildAboutFormData({
      title: data.title,
      description: data.description ?? null,
      file: data.file,
      sort_order: data.sort_order ?? 0,
    });
    const response = await this.client.post<{ data: Download }>(
      endpoints.downloads,
      body
    );
    return response.data;
  }

  async updateDownload(
    id: number,
    data: {
      title?: string;
      description?: string | null;
      file?: File | null;
      sort_order?: number;
    }
  ): Promise<{ data: Download }> {
    const body = this.buildAboutFormData(
      {
        title: data.title,
        description: data.description,
        file: data.file ?? undefined,
        sort_order: data.sort_order,
      },
      true
    );
    const response = await this.client.post<{ data: Download }>(
      endpoints.download(id),
      body
    );
    return response.data;
  }

  async deleteDownload(id: number): Promise<void> {
    await this.client.delete(endpoints.download(id));
  }

  // Events
  async getEvents(params?: { status?: EventStatus }): Promise<EventListResponse> {
    const response = await this.client.get<EventListResponse>(
      endpoints.events,
      { params }
    );
    return response.data;
  }

  async getEvent(id: number): Promise<EventDetailResponse> {
    const response = await this.client.get<EventDetailResponse>(
      endpoints.event(id)
    );
    return response.data;
  }

  async createEvent(data: {
    title: string;
    description?: string | null;
    short_description?: string | null;
    location?: string | null;
    event_at: string;
    registration_opens_at: string;
    registration_closes_at: string;
    status: EventStatus;
    cover_photo?: File | null;
  }): Promise<EventDetailResponse> {
    const form = new FormData();
    form.append('title', data.title);
    if (data.description != null) form.append('description', data.description);
    if (data.short_description != null) form.append('short_description', data.short_description);
    if (data.location != null) form.append('location', data.location);
    form.append('event_at', data.event_at);
    form.append('registration_opens_at', data.registration_opens_at);
    form.append('registration_closes_at', data.registration_closes_at);
    form.append('status', data.status);
    if (data.cover_photo) form.append('cover_photo', data.cover_photo);
    const response = await this.client.post<EventDetailResponse>(
      endpoints.events,
      form
    );
    return response.data;
  }

  async updateEvent(
    id: number,
    data: {
      title?: string;
      description?: string | null;
      short_description?: string | null;
      location?: string | null;
      event_at?: string;
      registration_opens_at?: string;
      registration_closes_at?: string;
      status?: EventStatus;
      cover_photo?: File | null;
      photos?: File[];
    }
  ): Promise<EventDetailResponse> {
    const form = new FormData();
    form.append('_method', 'PUT');
    if (data.title != null) form.append('title', data.title);
    if (data.description != null) form.append('description', data.description);
    if (data.short_description != null) form.append('short_description', data.short_description);
    if (data.location != null) form.append('location', data.location);
    if (data.event_at != null) form.append('event_at', data.event_at);
    if (data.registration_opens_at != null) form.append('registration_opens_at', data.registration_opens_at);
    if (data.registration_closes_at != null) form.append('registration_closes_at', data.registration_closes_at);
    if (data.status != null) form.append('status', data.status);
    if (data.cover_photo) form.append('cover_photo', data.cover_photo);
    if (data.photos?.length) {
      data.photos.forEach((file) => form.append('photos[]', file));
    }
    const response = await this.client.post<EventDetailResponse>(
      endpoints.event(id),
      form
    );
    return response.data;
  }

  async deleteEvent(id: number): Promise<void> {
    await this.client.delete(endpoints.event(id));
  }

  async deleteEventPhoto(eventId: number, photoId: number): Promise<void> {
    await this.client.delete(endpoints.eventPhoto(eventId, photoId));
  }

  async getEventRegistrations(id: number): Promise<EventRegistrationsResponse> {
    const response = await this.client.get<EventRegistrationsResponse>(
      endpoints.eventRegistrations(id)
    );
    return response.data;
  }
}

export const apiClient = new ApiClient();
