/**
 * Centegix CRM - Render Backend API Client
 * Connects to live Python FastAPI microservices on Render.
 */

export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 'https://crm-python-3ocz.onrender.com';

export interface HealthCheckResponse {
  status: string;
  service?: string;
  services?: Record<string, string>;
  framework?: string;
}

export interface RegisterTenantPayload {
  companyName: string;
  companySlug: string;
  adminName: string;
  adminEmail: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    tenant: { id: string; name: string; slug: string; plan: string };
    user: { id: string; name: string; email: string; role: string };
  };
}

export interface ApiContact {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  channels?: Array<{ channel: string; externalId: string; profileName: string }>;
  lead_status?: string;
  tags?: string[];
  notes?: string;
  created_at?: string;
}

// Token helper
export const getStoredToken = (): string | null => {
  return localStorage.getItem('centegix_crm_auth_token');
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem('centegix_crm_auth_token', token);
};

// 1. Health Check
export async function checkBackendHealth(): Promise<HealthCheckResponse> {
  const resp = await fetch(`${API_BASE_URL}/api/health`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!resp.ok) {
    throw new Error(`Backend responded with HTTP ${resp.status}`);
  }
  return resp.json();
}

// 2. Auth: Register Tenant
export async function registerTenant(payload: RegisterTenantPayload): Promise<AuthResponse> {
  const resp = await fetch(`${API_BASE_URL}/api/v1/auth/register-tenant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  const result: AuthResponse = await resp.json();
  if (result.data?.token) {
    setStoredToken(result.data.token);
  }
  return result;
}

// 3. Auth: Login
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const resp = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Invalid email or password');
  }
  const result: AuthResponse = await resp.json();
  if (result.data?.token) {
    setStoredToken(result.data.token);
  }
  return result;
}

// 4. Contacts: List
export async function fetchContacts(): Promise<ApiContact[]> {
  const token = getStoredToken();
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(`${API_BASE_URL}/api/v1/contacts`, { headers });
  if (!resp.ok) {
    throw new Error(`Failed to fetch contacts: HTTP ${resp.status}`);
  }
  const data = await resp.json();
  return data.data || [];
}

// 5. Contacts: Create
export async function createBackendContact(contact: {
  name: string;
  email?: string;
  phone?: string;
  tags?: string[];
  leadStatus?: string;
  notes?: string;
}): Promise<ApiContact> {
  const token = getStoredToken();
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(`${API_BASE_URL}/api/v1/contacts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(contact)
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: 'Failed to create contact' }));
    throw new Error(err.detail || 'Failed to create contact');
  }
  const data = await resp.json();
  return data.data;
}

// 6. WhatsApp: Send Message
export async function sendWhatsAppMessage(payload: {
  recipientPhone: string;
  messageText: string;
  conversationId?: string;
}) {
  const token = getStoredToken();
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(`${API_BASE_URL}/api/v1/whatsapp/send-text`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    throw new Error(`Failed to send WhatsApp message: HTTP ${resp.status}`);
  }
  return resp.json();
}

// 7. Meta Webhook: Verify Handshake
export async function testMetaWebhookHandshake(
  verifyToken: string = 'centegix_secure_verify_token_2026',
  challenge: string = 'handshake_test_123'
): Promise<string> {
  const params = new URLSearchParams({
    'hub.mode': 'subscribe',
    'hub.verify_token': verifyToken,
    'hub.challenge': challenge
  });
  const resp = await fetch(`${API_BASE_URL}/api/v1/webhooks/meta?${params.toString()}`);
  if (!resp.ok) {
    throw new Error(`Webhook handshake failed: HTTP ${resp.status}`);
  }
  return resp.text();
}
