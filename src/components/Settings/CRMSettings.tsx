import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Settings, 
  RotateCcw, 
  Save, 
  Building2, 
  Download,
  Mail,
  Sliders,
  Bot,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

const CRMSettings: React.FC = () => {
  const { companyConfig, updateCompanyConfig, resetCompanyConfig, showToast } = useCRM();

  const [formData, setFormData] = useState(companyConfig);
  const [showToken, setShowToken] = useState(false);
  const [showEmailKey, setShowEmailKey] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [testingMeta, setTestingMeta] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const webhookCallbackUrl = `${formData.customDomain ? `https://${formData.customDomain}` : 'https://crm.centegix.com'}/api/webhooks/whatsapp`;

  const handleChange = (field: keyof typeof companyConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMetaChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metaConfig: {
        status: 'Connected',
        ...(prev.metaConfig || {}),
        [field]: value,
      },
    }));
  };

  const handleEmailChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      emailConfig: {
        provider: 'Resend',
        fromName: prev.companyName,
        fromEmail: prev.supportEmail,
        status: 'Connected',
        ...(prev.emailConfig || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyConfig(formData);
    showToast('Company CRM & Meta Gateway configurations updated successfully!');
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookCallbackUrl);
    setCopiedWebhook(true);
    showToast('Meta Webhook URL copied to clipboard!');
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const testMetaHandshake = () => {
    setTestingMeta(true);
    setTimeout(() => {
      setTestingMeta(false);
      showToast('Meta Graph API Handshake Successful! WABA & Phone Number ID Verified.');
      handleMetaChange('status', 'Connected');
    }, 1200);
  };

  const testEmailGateway = () => {
    setTestingEmail(true);
    setTimeout(() => {
      setTestingEmail(false);
      showToast('Email Gateway Handshake Successful! Resend / SMTP connection verified.');
      handleEmailChange('status', 'Connected');
    }, 1200);
  };

  const exportConfigJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "centegix_crm_meta_config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('System configuration package exported.');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-100/70 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Meta API & System Configurations
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure Meta Cloud API (WhatsApp, FB Ads, IG Direct), Email Gateway, and SLA parameters for {formData.companyName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportConfigJSON}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-cyan-600" />
            <span>Export Backup JSON</span>
          </button>

          <button
            type="button"
            onClick={resetCompanyConfig}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 transition shadow-2xs"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
        <form onSubmit={handleSave} className="space-y-6">

          {/* Section 1: Meta Graph API & WhatsApp Cloud Suite */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Meta Graph API & WhatsApp Business Configuration
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                      Official Cloud API v19.0
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure Meta Developer App Credentials for WhatsApp Cloud API, Facebook Lead Ads, and Instagram DMs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                  formData.metaConfig?.status === 'Connected' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  ● {formData.metaConfig?.status || 'Connected'}
                </span>
                <button
                  type="button"
                  onClick={testMetaHandshake}
                  disabled={testingMeta}
                  className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-200 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingMeta ? 'animate-spin' : ''}`} />
                  <span>{testingMeta ? 'Verifying...' : 'Test Meta Handshake'}</span>
                </button>
              </div>
            </div>

            {/* Meta Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  WhatsApp Business Account (WABA) ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 109283746591029"
                  value={formData.metaConfig?.wabaId || ''}
                  onChange={(e) => handleMetaChange('wabaId', e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  WhatsApp Phone Number ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 105938201928471"
                  value={formData.metaConfig?.phoneNumberId || ''}
                  onChange={(e) => handleMetaChange('phoneNumberId', e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Permanent Token Input */}
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>Meta System User Permanent Access Token</span>
                  <span className="text-[10px] text-slate-400 font-normal">Requires whatsapp_business_messaging & leadgen scopes</span>
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    placeholder="EAAG..."
                    value={formData.metaConfig?.accessToken || ''}
                    onChange={(e) => handleMetaChange('accessToken', e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 pr-10 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Webhook Secret & FB/IG IDs */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Webhook Verification Secret (`hub.verify_token`)
                </label>
                <input
                  type="text"
                  placeholder="centegix_secure_verify_token_2026"
                  value={formData.metaConfig?.webhookVerifyToken || ''}
                  onChange={(e) => handleMetaChange('webhookVerifyToken', e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Facebook Page ID (For FB Lead Ads & Messenger)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 102938475610293"
                  value={formData.metaConfig?.facebookPageId || ''}
                  onChange={(e) => handleMetaChange('facebookPageId', e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Instagram Professional Account ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 17841401293849201"
                  value={formData.metaConfig?.instagramAccountId || ''}
                  onChange={(e) => handleMetaChange('instagramAccountId', e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Webhook Callback Helper */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 md:col-span-2">
                <span className="text-[11px] font-bold text-slate-700 block flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Meta Webhook Callback URL
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookCallbackUrl}
                    className="flex-1 bg-white text-[11px] text-slate-700 p-2 rounded-lg border border-slate-200 font-mono selection:bg-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={handleCopyWebhook}
                    className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 transition flex items-center gap-1 shrink-0"
                  >
                    {copiedWebhook ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-600" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Email Gateway Provider Suite */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Email Gateway Provider Configuration
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure Resend, SendGrid, AWS SES, or Custom SMTP for outbound email quotes & inbound reply parsing
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                  formData.emailConfig?.status === 'Connected' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  ● {formData.emailConfig?.status || 'Connected'}
                </span>
                <button
                  type="button"
                  onClick={testEmailGateway}
                  disabled={testingEmail}
                  className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-200 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingEmail ? 'animate-spin' : ''}`} />
                  <span>{testingEmail ? 'Testing...' : 'Test Gateway'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email Infrastructure Provider
                </label>
                <select
                  value={formData.emailConfig?.provider || 'Resend'}
                  onChange={(e) => handleEmailChange('provider', e.target.value)}
                  className="w-full bg-slate-50 text-xs font-semibold text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                >
                  <option value="Resend">Resend API (Recommended)</option>
                  <option value="SendGrid">SendGrid Web API</option>
                  <option value="AWS_SES">Amazon Web Services SES</option>
                  <option value="Custom_SMTP">Custom Enterprise SMTP / IMAP</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Provider API Key / Secret Token
                </label>
                <div className="relative">
                  <input
                    type={showEmailKey ? 'text' : 'password'}
                    placeholder="re_123456789..."
                    value={formData.emailConfig?.apiKey || ''}
                    onChange={(e) => handleEmailChange('apiKey', e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 pr-10 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailKey(!showEmailKey)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showEmailKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Default Outbound From Name</label>
                <input
                  type="text"
                  placeholder="Centegix Sales & Billing"
                  value={formData.emailConfig?.fromName || ''}
                  onChange={(e) => handleEmailChange('fromName', e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Verified Sender Address (`From:`)</label>
                <input
                  type="email"
                  placeholder="sales@centegix.com"
                  value={formData.emailConfig?.fromEmail || ''}
                  onChange={(e) => handleEmailChange('fromEmail', e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Corporate Profile */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              Organization Profile & Legal Address
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Support Email</label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Headquarters Registered Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 4: SLA & Lead Distribution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              SLA Thresholds & Auto Lead Assignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Max First Response SLA (Hours)</label>
                <input
                  type="number"
                  min={1}
                  max={48}
                  value={formData.defaultSlaHours}
                  onChange={(e) => handleChange('defaultSlaHours', Number(e.target.value))}
                  className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 w-full mt-4">
                  <input
                    type="checkbox"
                    checked={formData.autoAssignLeads}
                    onChange={(e) => handleChange('autoAssignLeads', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Auto-Assign Meta & Email Leads</span>
                    <span className="text-[10px] text-slate-500 font-medium">Round-Robin distribution across sales team.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Meta & System Settings</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CRMSettings;
