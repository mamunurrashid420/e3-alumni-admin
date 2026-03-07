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
  EventRegistration,
  EventRegistrationsResponse,
  EventStatus,
  ScholarshipApplication,
  ScholarshipApplicationStatus,
  ScholarshipListResponse,
  ScholarshipDetailResponse,
  ScholarshipApplicationDetailResponse,
  ApproveScholarshipApplicationResponse,
  RejectScholarshipApplicationResponse,
  GalleryPhoto,
  HeroSlide,
  NoticeItem,
  NewsItem,
  JobListing,
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
    perPage?: number,
    page?: number
  ): Promise<PaginatedResponse<MembershipApplication>> {
    const params: Record<string, string | number> = {};
    if (status) params.status = status;
    if (perPage != null) params.per_page = perPage;
    if (page != null && page > 1) params.page = page;
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
    perPage?: number,
    bloodDonors?: boolean,
    bloodGroup?: string,
    executiveOnly?: boolean
  ): Promise<PaginatedResponse<Member>> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (primaryMemberType) params.primary_member_type = primaryMemberType;
    if (page > 1) params.page = page.toString();
    if (perPage != null) params.per_page = perPage.toString();
    if (bloodDonors) params.blood_donors = '1';
    if (bloodGroup) params.blood_group = bloodGroup;
    if (executiveOnly) params.executive_only = '1';
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

  async createMember(data: {
    name: string;
    email?: string | null;
    phone: string;
    primary_member_type: string;
    ssc_year?: number | null;
    jsc_year?: number | null;
  }): Promise<Member> {
    const response = await this.client.post<Member | { data: Member }>(
      endpoints.members,
      data
    );
    const body = response.data as Member | { data: Member };
    return 'data' in body && body.data ? body.data : (body as Member);
  }

  async updateMember(
    id: number,
    data: {
      name: string;
      email?: string | null;
      phone: string;
      secondary_member_type_id?: number | null;
    }
  ): Promise<Member & { phone_changed?: boolean }> {
    const response = await this.client.put<
      Member & { phone_changed?: boolean }
    >(endpoints.updateMember(id), data);
    return response.data;
  }

  async getMemberTypes(): Promise<{ data: { id: number; name: string; description: string | null }[] }> {
    const response = await this.client.get<{
      data: { id: number; name: string; description: string | null }[];
    }>(endpoints.memberTypes);
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

  async updateExecutivePhoto(id: number, photo: File): Promise<Member> {
    const formData = new FormData();
    formData.append('photo', photo);
    const response = await this.client.post<{ data: Member }>(
      endpoints.executivePhoto(id),
      formData
    );
    const body = response.data as { data?: Member };
    return body.data ?? (response.data as Member);
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
    perPage?: number,
    page?: number
  ): Promise<PaginatedResponse<Payment>> {
    const params: Record<string, string | number> = status ? { status } : {};
    if (perPage != null) params.per_page = perPage;
    if (page != null && page > 1) params.page = page;
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
    perPage?: number,
    page?: number
  ): Promise<PaginatedResponse<SelfDeclaration>> {
    const params: Record<string, string | number> = status ? { status } : {};
    if (perPage != null) params.per_page = perPage;
    if (page != null && page > 1) params.page = page;
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
    perPage?: number,
    page?: number
  ): Promise<PaginatedResponse<ScholarshipApplication>> {
    const params: Record<string, string | number> = {};
    if (status) params.status = status;
    if (scholarshipId) params.scholarship_id = scholarshipId;
    if (perPage != null) params.per_page = perPage;
    if (page != null && page > 1) params.page = page;
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
    const body = this.buildAboutFormData(data, false);
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
    fee?: number | null;
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
    if (data.fee != null) form.append('fee', String(data.fee));
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
      fee?: number | null;
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
    if (data.fee !== undefined) form.append('fee', data.fee === null || data.fee === '' ? '' : String(data.fee));
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

  async getEventRegistrations(
    id: number,
    params?: { page?: number; per_page?: number }
  ): Promise<PaginatedResponse<EventRegistration>> {
    const requestParams: Record<string, number> = {};
    if (params?.page != null && params.page > 1) requestParams.page = params.page;
    if (params?.per_page != null) requestParams.per_page = params.per_page;
    const response = await this.client.get<
      PaginatedResponse<EventRegistration>
    >(endpoints.eventRegistrations(id), { params: requestParams });
    return response.data;
  }

  async getEventRegistrationsAll(id: number): Promise<EventRegistrationsResponse> {
    const response = await this.client.get<EventRegistrationsResponse>(
      endpoints.eventRegistrations(id),
      { params: { all: 1 } }
    );
    return response.data;
  }

  // Gallery photos
  async getGalleryPhotos(params?: { category?: string }): Promise<AboutListResponse<GalleryPhoto>> {
    const response = await this.client.get<AboutListResponse<GalleryPhoto>>(
      endpoints.galleryPhotos,
      { params }
    );
    return response.data;
  }

  async getGalleryPhoto(id: number): Promise<{ data: GalleryPhoto }> {
    const response = await this.client.get<{ data: GalleryPhoto }>(
      endpoints.galleryPhoto(id)
    );
    return response.data;
  }

  async createGalleryPhoto(data: {
    image: File;
    category: string;
    sort_order?: number;
  }): Promise<{ data: GalleryPhoto }> {
    const body = this.buildAboutFormData({
      image: data.image,
      category: data.category,
      sort_order: data.sort_order ?? 0,
    });
    const response = await this.client.post<{ data: GalleryPhoto }>(
      endpoints.galleryPhotos,
      body
    );
    return response.data;
  }

  async updateGalleryPhoto(
    id: number,
    data: { image?: File | null; category?: string; sort_order?: number }
  ): Promise<{ data: GalleryPhoto }> {
    const body = this.buildAboutFormData({
      image: data.image ?? undefined,
      category: data.category,
      sort_order: data.sort_order,
    });
    const response = await this.client.put<{ data: GalleryPhoto }>(
      endpoints.galleryPhoto(id),
      body
    );
    return response.data;
  }

  async deleteGalleryPhoto(id: number): Promise<void> {
    await this.client.delete(endpoints.galleryPhoto(id));
  }

  // About section (super_admin only)
  async getAboutSection(): Promise<{ data: { main_image: string | null; overlapping_image: string | null } }> {
    const response = await this.client.get<{ data: { main_image: string | null; overlapping_image: string | null } }>(
      endpoints.aboutSection
    );
    return response.data;
  }

  async updateAboutSection(data: {
    main_image?: File | null;
    overlapping_image?: File | null;
  }): Promise<{ data: { main_image: string | null; overlapping_image: string | null } }> {
    const body = this.buildAboutFormData({
      main_image: data.main_image ?? undefined,
      overlapping_image: data.overlapping_image ?? undefined,
    });
    // POST required for file upload – PHP does not populate $_FILES on PUT
    const response = await this.client.post<{ data: { main_image: string | null; overlapping_image: string | null } }>(
      endpoints.aboutSection,
      body
    );
    return response.data;
  }

  // Auth page background image (public GET; admin uses same to load current)
  async getAuthPage(): Promise<{ data: { background_image: string | null } }> {
    const response = await this.client.get<{ data: { background_image: string | null } }>(
      endpoints.authPage
    );
    return response.data;
  }

  async updateAuthPage(data: { image?: File | null }): Promise<{ data: { background_image: string | null } }> {
    const body = this.buildAboutFormData({ image: data.image ?? undefined });
    const response = await this.client.post<{ data: { background_image: string | null } }>(
      endpoints.authPage,
      body
    );
    return response.data;
  }

  // Community section (super_admin only)
  async getCommunitySection(): Promise<{ data: { image: string | null } }> {
    const response = await this.client.get<{ data: { image: string | null } }>(
      endpoints.communitySection
    );
    return response.data;
  }

  async updateCommunitySection(data: { image?: File | null }): Promise<{ data: { image: string | null } }> {
    const body = this.buildAboutFormData({ image: data.image ?? undefined });
    const response = await this.client.post<{ data: { image: string | null } }>(
      endpoints.communitySection,
      body
    );
    return response.data;
  }

  // Health section (super_admin only)
  async getHealthSection(): Promise<{ data: { main_image: string | null; overlapping_image: string | null } }> {
    const response = await this.client.get<{ data: { main_image: string | null; overlapping_image: string | null } }>(
      endpoints.healthSection
    );
    return response.data;
  }

  async updateHealthSection(data: {
    main_image?: File | null;
    overlapping_image?: File | null;
  }): Promise<{ data: { main_image: string | null; overlapping_image: string | null } }> {
    const body = this.buildAboutFormData({
      main_image: data.main_image ?? undefined,
      overlapping_image: data.overlapping_image ?? undefined,
    });
    const response = await this.client.post<{ data: { main_image: string | null; overlapping_image: string | null } }>(
      endpoints.healthSection,
      body
    );
    return response.data;
  }

  // Homepage hero slider (super_admin only)
  async getHeroSlides(): Promise<AboutListResponse<HeroSlide>> {
    const response = await this.client.get<AboutListResponse<HeroSlide>>(
      endpoints.heroSlides
    );
    return response.data;
  }

  async createHeroSlide(data: {
    image: File;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    primary_button_label?: string | null;
    primary_button_url?: string | null;
    secondary_button_label?: string | null;
    secondary_button_url?: string | null;
    sort_order?: number;
    is_active?: boolean;
  }): Promise<{ data: HeroSlide }> {
    const body = this.buildAboutFormData({
      image: data.image,
      title: data.title,
      subtitle: data.subtitle ?? '',
      description: data.description ?? '',
      primary_button_label: data.primary_button_label ?? '',
      primary_button_url: data.primary_button_url ?? '',
      secondary_button_label: data.secondary_button_label ?? '',
      secondary_button_url: data.secondary_button_url ?? '',
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active === true ? 1 : 0,
    });
    const response = await this.client.post<{ data: HeroSlide }>(
      endpoints.heroSlides,
      body
    );
    return response.data;
  }

  async updateHeroSlide(
    id: number,
    data: {
      image?: File | null;
      title?: string;
      subtitle?: string | null;
      description?: string | null;
      primary_button_label?: string | null;
      primary_button_url?: string | null;
      secondary_button_label?: string | null;
      secondary_button_url?: string | null;
      sort_order?: number;
      is_active?: boolean;
    }
  ): Promise<{ data: HeroSlide }> {
    const body = this.buildAboutFormData(
      {
        image: data.image ?? undefined,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        primary_button_label: data.primary_button_label,
        primary_button_url: data.primary_button_url,
        secondary_button_label: data.secondary_button_label,
        secondary_button_url: data.secondary_button_url,
        sort_order: data.sort_order,
        is_active: data.is_active === true ? 1 : data.is_active === false ? 0 : undefined,
      },
      true
    );
    const response = await this.client.put<{ data: HeroSlide }>(
      endpoints.heroSlide(id),
      body
    );
    return response.data;
  }

  async deleteHeroSlide(id: number): Promise<void> {
    await this.client.delete(endpoints.heroSlide(id));
  }

  // Notices (scrolling bar; super_admin sees all)
  async getNotices(): Promise<AboutListResponse<NoticeItem>> {
    const response = await this.client.get<AboutListResponse<NoticeItem>>(
      endpoints.notices
    );
    return response.data;
  }

  async getNotice(id: number): Promise<{ data: NoticeItem }> {
    const response = await this.client.get<{ data: NoticeItem }>(
      endpoints.notice(id)
    );
    return response.data;
  }

  async createNotice(data: {
    title: string;
    body?: string | null;
    is_active?: boolean;
    sort_order?: number;
  }): Promise<{ data: NoticeItem }> {
    const response = await this.client.post<{ data: NoticeItem }>(
      endpoints.notices,
      {
        title: data.title,
        body: data.body ?? null,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? 0,
      }
    );
    return response.data;
  }

  async updateNotice(
    id: number,
    data: Partial<{
      title: string;
      body: string | null;
      is_active: boolean;
      sort_order: number;
    }>
  ): Promise<{ data: NoticeItem }> {
    const response = await this.client.put<{ data: NoticeItem }>(
      endpoints.notice(id),
      data
    );
    return response.data;
  }

  async deleteNotice(id: number): Promise<void> {
    await this.client.delete(endpoints.notice(id));
  }

  // News
  async getNews(perPage?: number): Promise<AboutListResponse<NewsItem>> {
    const params = perPage != null ? { per_page: perPage } : {};
    const response = await this.client.get<AboutListResponse<NewsItem>>(
      endpoints.news,
      { params }
    );
    return response.data;
  }

  async getNewsItem(id: number): Promise<{ data: NewsItem }> {
    const response = await this.client.get<{ data: NewsItem }>(
      endpoints.newsItem(id)
    );
    return response.data;
  }

  async createNews(data: {
    slug?: string | null;
    title: string;
    description?: string | null;
    body?: string | null;
    image?: File | null;
    author?: string | null;
    published_at?: string | null;
    is_published?: boolean;
    sort_order?: number;
  }): Promise<{ data: NewsItem }> {
    const body = this.buildAboutFormData({
      slug: data.slug ?? null,
      title: data.title,
      description: data.description ?? null,
      body: data.body ?? null,
      image: data.image ?? undefined,
      author: data.author ?? null,
      published_at: data.published_at ?? null,
      is_published: data.is_published === true ? 1 : 0,
      sort_order: data.sort_order ?? 0,
    });
    const response = await this.client.post<{ data: NewsItem }>(
      endpoints.news,
      body
    );
    return response.data;
  }

  async updateNews(
    id: number,
    data: Partial<{
      slug: string | null;
      title: string;
      description: string | null;
      body: string | null;
      image: File | null;
      author: string | null;
      published_at: string | null;
      is_published: boolean;
      sort_order: number;
    }>
  ): Promise<{ data: NewsItem }> {
    const body = this.buildAboutFormData({
      slug: data.slug,
      title: data.title,
      description: data.description,
      body: data.body,
      image: data.image ?? undefined,
      author: data.author,
      published_at: data.published_at,
      is_published: data.is_published === true ? 1 : data.is_published === false ? 0 : undefined,
      sort_order: data.sort_order,
    });
    const response = await this.client.put<{ data: NewsItem }>(
      endpoints.newsItem(id),
      body
    );
    return response.data;
  }

  async deleteNews(id: number): Promise<void> {
    await this.client.delete(endpoints.newsItem(id));
  }

  // Jobs
  async getJobs(params?: { status?: string }): Promise<AboutListResponse<JobListing>> {
    const response = await this.client.get<AboutListResponse<JobListing>>(
      endpoints.jobs,
      { params }
    );
    return response.data;
  }

  async getJob(id: number): Promise<{ data: JobListing }> {
    const response = await this.client.get<{ data: JobListing }>(
      endpoints.job(id)
    );
    return response.data;
  }

  async createJob(data: {
    title: string;
    description?: string | null;
    company_name?: string | null;
    logo?: File | null;
    status?: 'active' | 'expired';
    application_url?: string | null;
    closes_at?: string | null;
    sort_order?: number;
  }): Promise<{ data: JobListing }> {
    const body = this.buildAboutFormData({
      title: data.title,
      description: data.description ?? null,
      company_name: data.company_name ?? null,
      logo: data.logo ?? undefined,
      status: data.status ?? 'active',
      application_url: data.application_url ?? null,
      closes_at: data.closes_at ?? null,
      sort_order: data.sort_order ?? 0,
    });
    const response = await this.client.post<{ data: JobListing }>(
      endpoints.jobs,
      body
    );
    return response.data;
  }

  async updateJob(
    id: number,
    data: Partial<{
      title: string;
      description: string | null;
      company_name: string | null;
      logo: File | null;
      status: 'active' | 'expired';
      application_url: string | null;
      closes_at: string | null;
      sort_order: number;
    }>
  ): Promise<{ data: JobListing }> {
    const body = this.buildAboutFormData(
      {
        title: data.title,
        description: data.description,
        company_name: data.company_name,
        logo: data.logo ?? undefined,
        status: data.status,
        application_url: data.application_url,
        closes_at: data.closes_at,
        sort_order: data.sort_order,
      },
      true
    );
    const response = await this.client.post<{ data: JobListing }>(
      endpoints.job(id),
      body
    );
    return response.data;
  }

  async deleteJob(id: number): Promise<void> {
    await this.client.delete(endpoints.job(id));
  }
}

export const apiClient = new ApiClient();
