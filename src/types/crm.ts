export type DealStage = 
  | 'New' 
  | 'Contacted' 
  | 'Qualified' 
  | 'Proposal' 
  | 'Negotiation' 
  | 'Won' 
  | 'Lost';

export type LeadSource = 
  | 'Website' 
  | 'LinkedIn' 
  | 'WhatsApp' 
  | 'Facebook Ads' 
  | 'Instagram Direct' 
  | 'Email Inbound' 
  | 'Cold Outreach' 
  | 'Partner Referral' 
  | 'Tech Summit';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ChannelType = 
  | 'WhatsApp' 
  | 'Email' 
  | 'Facebook' 
  | 'Instagram' 
  | 'Call' 
  | 'Meeting' 
  | 'Note' 
  | 'StageChange';

export interface Deal {
  id: string;
  title: string;
  company: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  value: number; // in INR or USD
  currency: string;
  stage: DealStage;
  score: number; // 0-100
  source: LeadSource;
  priority: Priority;
  assignedTo: string;
  assignedAvatar: string;
  expectedCloseDate: string;
  daysInStage: number;
  serviceCategory: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  slaBreached?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  designation: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  location: string;
  source: LeadSource;
  score: number;
  status: 'New' | 'Attempted' | 'In Discussion' | 'Qualified' | 'Disqualified';
  assignedTo: string;
  budget: number;
  currency: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  linkedIn?: string;
  dealsAssociated: number;
  totalRevenue: number;
  lastContacted: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  employees: string;
  annualRevenue: string;
  website: string;
  primaryContact: string;
  totalDeals: number;
  totalValue: number;
  status: 'Active Client' | 'Prospect' | 'Partner';
}

export interface ActivityLog {
  id: string;
  dealId?: string;
  contactName: string;
  type: ChannelType;
  content: string;
  timestamp: string;
  performedBy: string;
}

export interface ProductService {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  currency: string;
  description: string;
}

export interface QuoteItem {
  serviceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  clientCompany: string;
  clientContact: string;
  clientEmail: string;
  date: string;
  validUntil: string;
  items: QuoteItem[];
  subtotal: number;
  taxRate: number; // e.g. 18 for GST
  taxAmount: number;
  discount: number;
  grandTotal: number;
  currency: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
}

export interface MetaConfig {
  wabaId?: string;
  phoneNumberId?: string;
  accessToken?: string;
  webhookVerifyToken?: string;
  facebookPageId?: string;
  instagramAccountId?: string;
  status: 'Connected' | 'Disconnected' | 'Pending Verification';
}

export interface EmailGatewayConfig {
  provider: 'Resend' | 'SendGrid' | 'AWS_SES' | 'Custom_SMTP';
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  fromName: string;
  fromEmail: string;
  inboundDomain?: string;
  status: 'Connected' | 'Disconnected';
}

export interface CompanyConfig {
  companyName: string;
  tagline: string;
  logoUrl: string;
  customDomain: string;
  supportEmail: string;
  supportPhone: string;
  currencySymbol: string;
  currencyCode: string;
  address: string;
  gstin: string;
  defaultSlaHours: number;
  autoAssignLeads: boolean;
  emailGatewayStatus: 'Connected' | 'Disconnected';
  whatsappApiStatus: 'Connected' | 'Disconnected';
  facebookAdsStatus?: 'Connected' | 'Disconnected';
  instagramDirectStatus?: 'Connected' | 'Disconnected';
  metaConfig?: MetaConfig;
  emailConfig?: EmailGatewayConfig;
}

export interface TenantOrg {
  id: string;
  name: string;
  region: string;
  tier: 'Enterprise SaaS' | 'Business Plus' | 'Dedicated Cluster';
  usersCount: number;
  status: 'Active' | 'Trial' | 'Suspended';
}

export interface AutomationRule {
  id: string;
  title: string;
  triggerEvent: string;
  condition: string;
  action: string;
  active: boolean;
}

export interface OmnichannelMessage {
  id: string;
  conversationId: string;
  dealId?: string;
  leadId?: string;
  channel: ChannelType;
  direction: 'Inbound' | 'Outbound';
  senderName: string;
  senderEmailOrPhone: string;
  recipientEmailOrPhone: string;
  content: string;
  attachments?: {
    type: 'image' | 'document' | 'audio' | 'video';
    url: string;
    fileName?: string;
  }[];
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  externalId?: string; // WAMID, FB Message ID, or Email Message-ID
  templateName?: string;
  createdAt: string;
}

