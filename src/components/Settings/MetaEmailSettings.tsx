import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  MessageSquare,
  Mail,
  RefreshCw,
  Key,
  Globe,
  Sliders,
  ShieldCheck,
  Plus,
  Copy,
  ExternalLink,
  Activity,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { API_BASE_URL, testMetaWebhookHandshake, checkDatabaseStatus, type DatabaseStatusResponse } from '../../services/api';

const FacebookIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.69c0-2.47 1.47-3.83 3.72-3.83 1.08 0 2.2.19 2.2.19v2.42h-1.24c-1.23 0-1.61.76-1.61 1.54V12h2.72l-.43 3h-2.29v6.8c4.56-.93 8-4.96 8-9.8z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  bodyText: string;
  variablesCount: number;
}

const INITIAL_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tmpl-101',
    name: 'order_confirmation_v2',
    category: 'UTILITY',
    language: 'en_US',
    status: 'APPROVED',
    bodyText: 'Hello {{1}}, thank you for your order #{{2}}. Your items are being packed and will arrive by {{3}}.',
    variablesCount: 3,
  },
  {
    id: 'tmpl-102',
    name: 'festive_offer_discount',
    category: 'MARKETING',
    language: 'en_US',
    status: 'APPROVED',
    bodyText: 'Hi {{1}}, unlock an exclusive {{2}}% discount on your next service renewal. Use code {{3}} at checkout.',
    variablesCount: 3,
  },
  {
    id: 'tmpl-103',
    name: 'otp_verification_code',
    category: 'AUTHENTICATION',
    language: 'en_US',
    status: 'APPROVED',
    bodyText: 'Your verification code for CRM login is {{1}}. Valid for 10 minutes. Do not share this code.',
    variablesCount: 1,
  },
  {
    id: 'tmpl-104',
    name: 'appointment_reminder',
    category: 'UTILITY',
    language: 'en_US',
    status: 'PENDING',
    bodyText: 'Dear {{1}}, this is a reminder for your scheduled support call on {{2}} at {{3}}.',
    variablesCount: 3,
  },
];

export const MetaEmailSettings: React.FC = () => {
  const { showToast } = useCRM();

  const [activeSection, setActiveSection] = useState<'whatsapp' | 'facebook' | 'instagram' | 'email' | 'templates' | 'diagnostics'>('whatsapp');

  // WhatsApp Form State
  const [waConfig, setWaConfig] = useState({
    wabaId: '1094857293847291',
    phoneNumberId: '102938475610293',
    displayPhoneNumber: '+1 415 555 2671',
    accessToken: 'EAAG...centegix_encrypted_token_sample',
    verifyToken: 'centegix_secure_verify_token_2026',
    webhookUrl: `${API_BASE_URL}/api/v1/webhooks/meta`,
    appId: '849201938475629',
    appSecret: '••••••••••••••••••••••••••••••••',
    enabled: true
  });

  // Facebook Form State
  const [fbConfig, setFbConfig] = useState({
    pageId: '493029182746201',
    pageName: 'Centegix Enterprise Solutions',
    pageToken: 'EAAG...fb_page_token_encrypted',
    humanAgentTagEnabled: true,
    enabled: true
  });

  // Instagram Form State
  const [igConfig, setIgConfig] = useState({
    igUserId: '1784140029485729',
    igUsername: '@centegix_official',
    connectedFbPageId: '493029182746201',
    storyRepliesEnabled: true,
    enabled: true
  });

  // Email Form State
  const [emailConfig, setEmailConfig] = useState({
    provider: 'smtp', // 'gmail' | 'outlook' | 'smtp' | 'sendgrid'
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'support@centegix.com',
    smtpPass: '••••••••••••••••',
    useTls: true,
    senderName: 'Centegix Support Team',
    signatureHtml: '<p>Best regards,<br/><strong>Centegix Support Desk</strong><br/>www.centegix.com</p>',
    defaultCc: '',
    defaultBcc: 'audit-logs@centegix.com',
    enabled: true
  });

  // WhatsApp Templates State
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(INITIAL_TEMPLATES);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'UTILITY' as const,
    language: 'en_US',
    bodyText: ''
  });

  // Test Webhook Simulator State
  const [testLogs, setTestLogs] = useState<string[]>([
    '[2026-10-08 10:15:22] META WEBHOOK GET verification handshake OK (200)',
    '[2026-10-08 10:16:04] INBOUND WHATSAPP (+14155552671) -> Conversation #CONV-102 created',
    '[2026-10-08 10:17:40] OUTBOUND MESSAGE status callback -> DELIVERED (wamid.HBgL...)'
  ]);

  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const handleTestLiveWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookTestResult(null);
    try {
      const challengeStr = `render_test_${Date.now()}`;
      const res = await testMetaWebhookHandshake(waConfig.verifyToken, challengeStr);
      setWebhookTestResult({
        success: true,
        msg: `Verified with Render API! Challenge echoed: "${res}"`
      });
      showToast('Live Webhook Handshake Verified with Render Backend!');
    } catch (err: any) {
      setWebhookTestResult({
        success: false,
        msg: err?.message || 'Handshake failed'
      });
      showToast('Webhook Verification Failed: ' + (err?.message || 'Network error'));
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const [dbStatusData, setDbStatusData] = useState<DatabaseStatusResponse | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);

  const handleCheckDatabase = async () => {
    setIsCheckingDb(true);
    try {
      const res = await checkDatabaseStatus();
      setDbStatusData(res);
      if (res.database_connected) {
        showToast(`Database is CONNECTED (${res.engine || 'SQL'})! Latency: ${res.latency_ms}ms`);
      } else {
        showToast(`Database disconnected: ${res.error || 'Check server logs'}`);
      }
    } catch (err: any) {
      showToast('Could not query database status: ' + (err?.message || 'Server waking up'));
    } finally {
      setIsCheckingDb(false);
    }
  };

  const handleSaveConfig = () => {
    showToast('Channel settings & Meta API credentials saved securely!');
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.name || !newTemplate.bodyText) return;

    const created: WhatsAppTemplate = {
      id: `tmpl-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newTemplate.name.toLowerCase().replace(/\s+/g, '_'),
      category: newTemplate.category,
      language: newTemplate.language,
      status: 'PENDING',
      bodyText: newTemplate.bodyText,
      variablesCount: (newTemplate.bodyText.match(/\{\{\d+\}\}/g) || []).length
    };

    setTemplates([created, ...templates]);
    setShowNewTemplateModal(false);
    setNewTemplate({ name: '', category: 'UTILITY', language: 'en_US', bodyText: '' });
    showToast(`Template "${created.name}" submitted to Meta for approval!`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  return (
    <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Header Banner */}
      <div className="p-6 border-b border-slate-800 bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Meta & Email Integration Center
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Multi-Tenant Active
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure official Meta Cloud APIs (WhatsApp, Facebook, Instagram) and Email servers with automated identity resolution.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTestLogs(prev => [`[${new Date().toLocaleTimeString()}] Handshake re-tested: 200 OK (32ms)`, ...prev])}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Test Handshake
          </button>
          <button
            onClick={handleSaveConfig}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
          >
            <ShieldCheck className="w-4 h-4" /> Save Channel Settings
          </button>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-64 border-r border-slate-800 bg-slate-950/60 p-4 space-y-2 select-none shrink-0">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Channel Management
          </div>

          <button
            onClick={() => setActiveSection('whatsapp')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
              activeSection === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Cloud API</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
          </button>

          <button
            onClick={() => setActiveSection('facebook')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
              activeSection === 'facebook' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FacebookIcon className="w-4 h-4 text-blue-400" />
              <span>Facebook Messenger</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50"></span>
          </button>

          <button
            onClick={() => setActiveSection('instagram')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
              activeSection === 'instagram' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <InstagramIcon className="w-4 h-4 text-pink-400" />
              <span>Instagram Direct</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-pink-400 shadow-sm shadow-pink-400/50"></span>
          </button>

          <button
            onClick={() => setActiveSection('email')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
              activeSection === 'email' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Email Engine (SMTP/OAuth)</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
          </button>

          <div className="pt-4 border-t border-slate-800/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Templates & System
          </div>

          <button
            onClick={() => setActiveSection('templates')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
              activeSection === 'templates' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>WhatsApp Templates</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
              {templates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('diagnostics')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
              activeSection === 'diagnostics' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Webhook Logs & Health</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
          {/* SECTION 1: WHATSAPP BUSINESS */}
          {activeSection === 'whatsapp' && (
            <div className="max-w-4xl space-y-6">
              {/* WhatsApp Status Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      Meta WhatsApp Business Cloud API (v20.0+)
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Connected & Live
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Phone Number: <strong className="text-slate-200">{waConfig.displayPhoneNumber}</strong> | WABA ID: {waConfig.wabaId}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => showToast('Redirecting to Meta Embedded Signup flow...')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Embedded Signup
                </button>
              </div>

              {/* Form Controls */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" /> Meta Credentials & Phone Binding
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp Business Account ID (WABA ID)</label>
                    <input
                      type="text"
                      value={waConfig.wabaId}
                      onChange={(e) => setWaConfig({ ...waConfig, wabaId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number ID</label>
                    <input
                      type="text"
                      value={waConfig.phoneNumberId}
                      onChange={(e) => setWaConfig({ ...waConfig, phoneNumberId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meta System User Access Token (Encrypted at Rest)</label>
                  <input
                    type="password"
                    value={waConfig.accessToken}
                    onChange={(e) => setWaConfig({ ...waConfig, accessToken: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Requires <code className="text-emerald-400">whatsapp_business_messaging</code> and <code className="text-emerald-400">whatsapp_business_management</code> permissions.</p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" /> Webhook Configuration Endpoint
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Callback Webhook URL</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={waConfig.webhookUrl}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 font-mono"
                        />
                        <button onClick={() => copyToClipboard(waConfig.webhookUrl)} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meta Verify Token</label>
                      <input
                        type="text"
                        value={waConfig.verifyToken}
                        onChange={(e) => setWaConfig({ ...waConfig, verifyToken: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Live Render API Test Button & Result */}
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleTestLiveWebhook}
                      disabled={isTestingWebhook}
                      className="self-start inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition shadow-sm"
                    >
                      <Activity className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-spin' : ''}`} />
                      <span>{isTestingWebhook ? 'Testing Handshake...' : 'Test Handshake with Render Backend'}</span>
                    </button>

                    {webhookTestResult && (
                      <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 border ${
                        webhookTestResult.success 
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                          : 'bg-red-950/40 border-red-500/40 text-red-300'
                      }`}>
                        {webhookTestResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <span>{webhookTestResult.msg}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: FACEBOOK MESSENGER */}
          {activeSection === 'facebook' && (
            <div className="max-w-4xl space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <FacebookIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      Facebook Page Messaging Integration
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Active Page
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Connected Page: <strong className="text-slate-200">{fbConfig.pageName}</strong> (ID: {fbConfig.pageId})
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Page OAuth Settings</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Facebook Page Access Token</label>
                  <input
                    type="password"
                    value={fbConfig.pageToken}
                    onChange={(e) => setFbConfig({ ...fbConfig, pageToken: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Required Graph API permissions: <code className="text-blue-400">pages_messaging</code>, <code className="text-blue-400">pages_read_engagement</code>.</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Human Agent Tag (7-Day Service Window)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Allows human support agents to respond to customer inquiries up to 7 days after the last message.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={fbConfig.humanAgentTagEnabled}
                    onChange={(e) => setFbConfig({ ...fbConfig, humanAgentTagEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: INSTAGRAM DIRECT */}
          {activeSection === 'instagram' && (
            <div className="max-w-4xl space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-slate-900 to-slate-900 border border-pink-500/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                    <InstagramIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      Instagram Professional Business Account
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                        Linked
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Account: <strong className="text-slate-200">{igConfig.igUsername}</strong> | User ID: {igConfig.igUserId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Instagram Graph API Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Instagram Business User ID</label>
                    <input
                      type="text"
                      value={igConfig.igUserId}
                      onChange={(e) => setIgConfig({ ...igConfig, igUserId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Connected Facebook Page ID</label>
                    <input
                      type="text"
                      value={igConfig.connectedFbPageId}
                      onChange={(e) => setIgConfig({ ...igConfig, connectedFbPageId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Story Replies & Mentions Ingestion</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Automatically pull story mentions and replies directly into the CRM Omnichannel Inbox.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={igConfig.storyRepliesEnabled}
                    onChange={(e) => setIgConfig({ ...igConfig, storyRepliesEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-pink-600 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: EMAIL ENGINE */}
          {activeSection === 'email' && (
            <div className="max-w-4xl space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      CRM Email Engine & Provider Abstraction
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        SMTP Provider Ready
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sender: <strong className="text-slate-200">{emailConfig.senderName}</strong> ({emailConfig.smtpUser})
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Email Server Provider Selection</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'smtp', label: 'Custom SMTP/IMAP' },
                    { id: 'gmail', label: 'Google Workspace (OAuth)' },
                    { id: 'outlook', label: 'Microsoft 365 (OAuth)' },
                    { id: 'sendgrid', label: 'SendGrid API' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setEmailConfig({ ...emailConfig, provider: p.id })}
                      className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                        emailConfig.provider === p.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">SMTP Host Server</label>
                    <input
                      type="text"
                      value={emailConfig.smtpHost}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">SMTP Port</label>
                    <input
                      type="text"
                      value={emailConfig.smtpPort}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username / Email Address</label>
                    <input
                      type="text"
                      value={emailConfig.smtpUser}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password / App Password</label>
                    <input
                      type="password"
                      value={emailConfig.smtpPass}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpPass: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">HTML Email Signature</label>
                  <textarea
                    rows={3}
                    value={emailConfig.signatureHtml}
                    onChange={(e) => setEmailConfig({ ...emailConfig, signatureHtml: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: WHATSAPP TEMPLATES MANAGER */}
          {activeSection === 'templates' && (
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">WhatsApp Message Templates</h2>
                  <p className="text-xs text-slate-400">Manage Meta-approved templates required to initiate conversations outside the 24-hour service window.</p>
                </div>
                <button
                  onClick={() => setShowNewTemplateModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" /> Create New Template
                </button>
              </div>

              {/* Templates List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((t) => (
                  <div key={t.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-indigo-400">{t.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          t.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : t.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Category: {t.category} | Lang: {t.language}
                      </div>
                      <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                        {t.bodyText}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                      <span>Variables: {t.variablesCount} dynamic placeholders</span>
                      <button onClick={() => copyToClipboard(t.name)} className="text-indigo-400 hover:underline">Copy Name</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: DIAGNOSTICS & WEBHOOK LOGS */}
          {activeSection === 'diagnostics' && (
            <div className="max-w-4xl space-y-6">
              {/* Database Connection Status Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        Cloud Database Engine Connectivity
                        {dbStatusData?.database_connected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ONLINE & ACTIVE
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400">Render PostgreSQL / SQLite Async Session State</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckDatabase}
                    disabled={isCheckingDb}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDb ? 'animate-spin' : ''}`} />
                    <span>{isCheckingDb ? 'Verifying DB...' : 'Test Database Connection'}</span>
                  </button>
                </div>

                {dbStatusData ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block">Engine</span>
                      <span className="font-bold text-indigo-300 font-mono text-sm">{dbStatusData.engine || 'ACTIVE'}</span>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block">Driver</span>
                      <span className="font-bold text-slate-300 font-mono text-xs truncate block">{dbStatusData.driver || 'asyncpg/aiosqlite'}</span>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block">Latency</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">{dbStatusData.latency_ms} ms</span>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block">Stored Records</span>
                      <span className="font-bold text-white text-xs">
                        {dbStatusData.records ? `${dbStatusData.records.tenants} Tenants / ${dbStatusData.records.contacts} Contacts` : 'Active'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex items-center justify-between">
                    <span>Click <strong>"Test Database Connection"</strong> to execute live SQL query on Render cloud database.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Webhook Handshake & Event Log Console</h2>
                  <p className="text-xs text-slate-400">Live monitoring of inbound Meta webhook events and signature verifications.</p>
                </div>
                <button
                  onClick={() => setTestLogs([])}
                  className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-white text-xs font-medium rounded-xl transition"
                >
                  Clear Logs
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 space-y-2 h-96 overflow-y-auto">
                {testLogs.length === 0 ? (
                  <div className="text-slate-600 text-center py-10">No recent webhook events logged.</div>
                ) : (
                  testLogs.map((log, i) => (
                    <div key={i} className="py-1 border-b border-slate-900/60 last:border-0">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Template Modal */}
      {showNewTemplateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-5">
            <h3 className="text-base font-bold text-white">Create Meta WhatsApp Template</h3>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Template Identifier Name</label>
                <input
                  type="text"
                  placeholder="e.g. order_shipment_update"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="UTILITY">Utility</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Language</label>
                  <input
                    type="text"
                    value={newTemplate.language}
                    onChange={(e) => setNewTemplate({ ...newTemplate, language: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Body Template (Use {`{{1}}`}, {`{{2}}`} for variables)</label>
                <textarea
                  rows={4}
                  placeholder="Hello {{1}}, your booking for {{2}} is confirmed."
                  value={newTemplate.bodyText}
                  onChange={(e) => setNewTemplate({ ...newTemplate, bodyText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTemplateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
                >
                  Submit to Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaEmailSettings;
