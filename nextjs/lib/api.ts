/**
 * API client untuk integrasi dengan Laravel backend.
 * Base URL dari env NEXT_PUBLIC_API_URL (contoh: http://localhost:8000).
 */

const getBaseUrl = (): string => {
  if (typeof window === 'undefined') return ''
  return process.env.NEXT_PUBLIC_API_URL?.trim() || ''
}

const ADMIN_TOKEN_KEY = 'admin_token'

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export function isApiConfigured(): boolean {
  return !!getBaseUrl()
}

/** User shape dari Laravel API */
export interface ApiUser {
  id: string
  email: string
  fullName: string
  role: string
  createdAt: string | null
}

/** Response GET /api/admin/profile */
export interface ProfileResponse {
  user: ApiUser
}

/** Payload PUT /api/admin/profile */
export interface UpdateProfilePayload {
  full_name: string
}

/** Payload PUT /api/admin/password */
export interface UpdatePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

/** Response POST /api/admin/login */
export interface LoginResponse {
  token: string
  user: ApiUser
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const base = getBaseUrl()
  if (!base) throw new Error('API URL tidak dikonfigurasi')
  const { token, ...init } = options
  const url = `${base.replace(/\/$/, '')}/api${path}`
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(init.headers as Record<string, string>),
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(url, { ...init, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.message || data?.errors?.email?.[0] || data?.errors?.current_password?.[0] || res.statusText
    throw new Error(msg)
  }
  return data as T
}

/** Login admin ke Laravel, mengembalikan token dan user */
export async function adminLoginApi(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

/** Ambil profil admin (perlu token) */
export async function fetchAdminProfile(token: string | null): Promise<ProfileResponse | null> {
  if (!token) return null
  try {
    return await request<ProfileResponse>('/admin/profile', { token })
  } catch {
    return null
  }
}

/** Update profil (full_name) */
export async function updateAdminProfile(
  token: string | null,
  payload: UpdateProfilePayload
): Promise<ProfileResponse> {
  if (!token) throw new Error('Token tidak ada')
  return request<ProfileResponse>('/admin/profile', {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  })
}

/** Ubah password */
export async function updateAdminPassword(
  token: string | null,
  payload: UpdatePasswordPayload
): Promise<{ message: string }> {
  if (!token) throw new Error('Token tidak ada')
  return request<{ message: string }>('/admin/password', {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  })
}

/** Logout: invalidate token di server */
export async function adminLogoutApi(token: string | null): Promise<void> {
  if (!token) return
  try {
    await request('/admin/logout', { method: 'POST', token })
  } catch {
    // ignore
  }
  clearAdminToken()
}

// --- Pengaturan Alamat (Admin) ---

export interface ApiProvince {
  id: string
  code: string
  name: string
}

export interface ApiRegency {
  id: string
  code: string
  name: string
  provinceCode: string
  provinceName: string
}

export interface ApiDistrict {
  id: string
  code: string
  name: string
  regencyCode: string
  regencyName: string
}

export interface ApiVillage {
  id: string
  code: string
  name: string
  districtCode: string
  districtName: string
  regencyCode: string
  regencyName: string
  supportsCOD: boolean
}

function authRequest<T>(path: string, token: string | null, options: RequestInit = {}): Promise<T> {
  return request<T>(path, { ...options, token })
}

export async function addressGetProvinces(token: string | null, search?: string): Promise<ApiProvince[]> {
  if (!token) return []
  const q = search ? `?search=${encodeURIComponent(search)}` : ''
  const res = await authRequest<{ data: ApiProvince[] }>(`/admin/address/provinces${q}`, token)
  return res.data ?? []
}

export async function addressCreateProvince(token: string | null, payload: { code: string; name: string }): Promise<ApiProvince> {
  const res = await authRequest<{ data: ApiProvince }>('/admin/address/provinces', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function addressUpdateProvince(token: string | null, id: string, payload: { code?: string; name?: string }): Promise<ApiProvince> {
  const res = await authRequest<{ data: ApiProvince }>(`/admin/address/provinces/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function addressDeleteProvince(token: string | null, id: string): Promise<void> {
  await authRequest(`/admin/address/provinces/${id}`, token, { method: 'DELETE' })
}

export async function addressGetRegencies(
  token: string | null,
  opts?: { search?: string; province_code?: string }
): Promise<ApiRegency[]> {
  if (!token) return []
  const params = new URLSearchParams()
  if (opts?.search) params.set('search', opts.search)
  if (opts?.province_code) params.set('province_code', opts.province_code)
  const q = params.toString() ? `?${params}` : ''
  const res = await authRequest<{ data: ApiRegency[] }>(`/admin/address/regencies${q}`, token)
  return res.data ?? []
}

export async function addressCreateRegency(
  token: string | null,
  payload: { code: string; name: string; province_code: string }
): Promise<ApiRegency> {
  const res = await authRequest<{ data: ApiRegency }>('/admin/address/regencies', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function addressUpdateRegency(
  token: string | null,
  id: string,
  payload: { code?: string; name?: string; province_code?: string }
): Promise<ApiRegency> {
  const res = await authRequest<{ data: ApiRegency }>(`/admin/address/regencies/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function addressDeleteRegency(token: string | null, id: string): Promise<void> {
  await authRequest(`/admin/address/regencies/${id}`, token, { method: 'DELETE' })
}

export async function addressGetDistricts(
  token: string | null,
  opts?: { regency_code?: string }
): Promise<ApiDistrict[]> {
  if (!token) return []
  const params = new URLSearchParams()
  if (opts?.regency_code) params.set('regency_code', opts.regency_code)
  const q = params.toString() ? `?${params}` : ''
  const res = await authRequest<{ data: ApiDistrict[] }>(`/admin/address/districts${q}`, token)
  return res.data ?? []
}

export async function addressCreateDistrict(
  token: string | null,
  payload: { code: string; name: string; regency_code: string }
): Promise<ApiDistrict> {
  const res = await authRequest<{ data: ApiDistrict }>('/admin/address/districts', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function addressUpdateDistrict(
  token: string | null,
  id: string,
  payload: { code?: string; name?: string; regency_code?: string }
): Promise<ApiDistrict> {
  const res = await authRequest<{ data: ApiDistrict }>(`/admin/address/districts/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function addressDeleteDistrict(token: string | null, id: string): Promise<void> {
  await authRequest(`/admin/address/districts/${id}`, token, { method: 'DELETE' })
}

export async function addressGetVillages(
  token: string | null,
  opts?: { search?: string; regency_code?: string; district_code?: string }
): Promise<ApiVillage[]> {
  if (!token) return []
  const params = new URLSearchParams()
  if (opts?.search) params.set('search', opts.search)
  if (opts?.regency_code) params.set('regency_code', opts.regency_code)
  if (opts?.district_code) params.set('district_code', opts.district_code)
  const q = params.toString() ? `?${params}` : ''
  const res = await authRequest<{ data: ApiVillage[] }>(`/admin/address/villages${q}`, token)
  return res.data ?? []
}

export async function addressCreateVillage(
  token: string | null,
  payload: { code: string; name: string; district_code: string; supports_cod?: boolean }
): Promise<ApiVillage> {
  const res = await authRequest<{ data: ApiVillage }>('/admin/address/villages', token, {
    method: 'POST',
    body: JSON.stringify({ ...payload, supports_cod: payload.supports_cod ?? false }),
  })
  return res.data
}

export async function addressUpdateVillage(
  token: string | null,
  id: string,
  payload: { code?: string; name?: string; district_code?: string; supports_cod?: boolean }
): Promise<ApiVillage> {
  const res = await authRequest<{ data: ApiVillage }>(`/admin/address/villages/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function addressDeleteVillage(token: string | null, id: string): Promise<void> {
  await authRequest(`/admin/address/villages/${id}`, token, { method: 'DELETE' })
}

/** Payload untuk simpan desa dari data wilayah.id (sekalian sync provinsi, kabupaten, kecamatan) */
export interface AddressFromWilayahPayload {
  province: { code: string; name: string }
  regency: { code: string; name: string }
  district: { code: string; name: string }
  village: { code: string; name: string; supports_cod?: boolean }
}

export async function addressStoreVillageFromWilayah(
  token: string | null,
  payload: AddressFromWilayahPayload
): Promise<ApiVillage> {
  const res = await authRequest<{ data: ApiVillage }>('/admin/address/villages/from-wilayah', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

// --- Payment Settings (Admin) ---
export interface ApiPaymentSettings {
  eWalletEnabled: boolean
  eWalletMethods: { id: string; name: string; enabled: boolean; feePercent: number }[]
  codEnabled: boolean
  codMinOrder: number
  codMaxOrder: number
  codFee: number
  virtualAccountEnabled: boolean
  virtualAccountFee: number
  midtransServerKey: string
  midtransClientKey: string
  midtransIsProduction: boolean
  paymentTimeout: number
  autoApprovePayment: boolean
  requirePaymentProof: boolean
  paymentProofRequired: boolean
}

export async function paymentGetSettings(token: string | null): Promise<ApiPaymentSettings> {
  if (!token) throw new Error('Token diperlukan')
  const res = await authRequest<{ data: ApiPaymentSettings }>('/admin/payment/settings', token)
  return res.data
}

export async function paymentUpdateSettings(
  token: string | null,
  payload: Partial<ApiPaymentSettings>
): Promise<ApiPaymentSettings> {
  if (!token) throw new Error('Token diperlukan')
  const res = await authRequest<{ data: ApiPaymentSettings }>('/admin/payment/settings', token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return res.data
}

// --- App Settings (Admin) ---
export interface ApiAppSettings {
  siteName: string
  siteDescription: string
  siteTagline: string
  contactEmail: string
  contactPhone: string
  address: string
  facebookUrl: string
  instagramUrl: string
  twitterUrl: string
  whatsappNumber: string
  emailNotifications: boolean
  orderNotifications: boolean
  lowStockNotifications: boolean
  paymentNotifications: boolean
  customerNotifications: boolean
  freeShippingThreshold: number
  defaultShippingCost: number
  taxRate: number
  taxEnabled: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
}

export async function appGetSettings(token: string | null): Promise<ApiAppSettings> {
  if (!token) throw new Error('Token diperlukan')
  const res = await authRequest<{ data: ApiAppSettings }>('/admin/app/settings', token)
  return res.data
}

export async function appUpdateSettings(
  token: string | null,
  payload: Partial<ApiAppSettings>
): Promise<ApiAppSettings> {
  if (!token) throw new Error('Token diperlukan')
  const res = await authRequest<{ data: ApiAppSettings }>('/admin/app/settings', token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return res.data
}

// --- Admin Customers ---
export interface ApiCustomer {
  id: string
  email: string
  fullName: string
  phone: string | null
  role: 'customer'
  createdAt: string | null
  totalOrders: number
  totalSpent: number
}

export async function customersGet(
  token: string | null,
  search?: string
): Promise<ApiCustomer[]> {
  if (!token) return []
  const q = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
  const res = await authRequest<{ data: ApiCustomer[] }>(`/admin/customers${q}`, token)
  return res.data ?? []
}
