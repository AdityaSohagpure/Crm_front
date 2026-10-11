import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Clock, 
  CheckCheck, 
  Sparkles,
  User,
  Search,
  Share2,
  ShieldCheck
} from 'lucide-react';

const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

interface ChatThread {
  id: string;
  contactName: string;
  phone: string;
  email: string;
  channel: 'WhatsApp' | 'Facebook' | 'Instagram' | 'Email';
  lastMessage: string;
  time: string;
  unreadCount: number;
  assignedAgent: string;
  status: 'OPEN' | 'PENDING' | 'RESOLVED';
  serviceWindowHoursRemaining: number;
  channelsLinked: string[];
}

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'thread-1',
    contactName: 'Alex Rivera',
    phone: '+1 415 555 2671',
    email: 'arivera@acme.com',
    channel: 'WhatsApp',
    lastMessage: 'Can you confirm if our order #CENT-8492 includes installation?',
    time: '10:42 AM',
    unreadCount: 2,
    assignedAgent: 'Ananya Sharma',
    status: 'OPEN',
    serviceWindowHoursRemaining: 22,
    channelsLinked: ['WhatsApp (+14155552671)', 'Email (arivera@acme.com)']
  },
  {
    id: 'thread-2',
    contactName: 'Priya Mehta',
    phone: '+91 98765 43210',
    email: 'priya.mehta@nexus.in',
    channel: 'Facebook',
    lastMessage: 'We would like to upgrade our SaaS license tier to Enterprise.',
    time: '09:15 AM',
    unreadCount: 0,
    assignedAgent: 'Rajesh Kumar',
    status: 'OPEN',
    serviceWindowHoursRemaining: 18,
    channelsLinked: ['FB PSID (493029182746)', 'Email (priya.mehta@nexus.in)']
  },
  {
    id: 'thread-3',
    contactName: 'David Vance',
    phone: '+1 212 555 9012',
    email: 'david@vance-media.org',
    channel: 'Instagram',
    lastMessage: 'Replied to your story: "Interested in the custom integration setup."',
    time: 'Yesterday',
    unreadCount: 0,
    assignedAgent: 'Priya Patel',
    status: 'PENDING',
    serviceWindowHoursRemaining: 14,
    channelsLinked: ['IGSID (178414002948)', 'Instagram (@davidvance)']
  },
  {
    id: 'thread-4',
    contactName: 'Sarah Jenkins',
    phone: '+44 20 7946 0912',
    email: 'sjenkins@globaltech.co.uk',
    channel: 'Email',
    lastMessage: 'Re: Commercial Proposal & MSA Legal Signoff',
    time: 'Oct 07',
    unreadCount: 0,
    assignedAgent: 'Ananya Sharma',
    status: 'RESOLVED',
    serviceWindowHoursRemaining: 0,
    channelsLinked: ['Email (sjenkins@globaltech.co.uk)']
  }
];

export const CommsCenter: React.FC = () => {
  const { companyConfig, showToast } = useCRM();

  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string>('thread-1');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replyText, setReplyText] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'REPLY' | 'NOTE'>('REPLY');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const selectedThread = threads.find(t => t.id === selectedThreadId) || threads[0];

  const filteredThreads = threads.filter(t => {
    const matchesChannel = selectedChannelFilter === 'ALL' || t.channel.toUpperCase() === selectedChannelFilter;
    const matchesSearch = t.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.phone.includes(searchQuery) ||
                          t.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    showToast(`${activeMode === 'REPLY' ? selectedThread.channel : 'Internal Note'} dispatched to ${selectedThread.contactName}`);
    setReplyText('');
  };

  const handleApplyTemplate = (tmplName: string, text: string) => {
    setReplyText(text);
    setShowTemplateModal(false);
    showToast(`Template "${tmplName}" applied to reply composer!`);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Top Bar Navigation & Status */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Omnichannel Unified Support Inbox
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Meta & Email Cloud Live
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Single-pane messaging for WhatsApp Business, Facebook Pages, Instagram Direct, and Email.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Workspace: <strong className="text-slate-200">{companyConfig.companyName}</strong></span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      {/* Main 3-Column Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: Conversation List */}
        <div className="w-80 border-r border-slate-800 bg-slate-950/60 flex flex-col shrink-0">
          {/* Channel Filters & Search */}
          <div className="p-3 border-b border-slate-800 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search contact, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {['ALL', 'WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'EMAIL'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedChannelFilter(c)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider transition whitespace-nowrap ${
                    selectedChannelFilter === c
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Threads Queue */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900/60">
            {filteredThreads.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedThreadId(t.id)}
                className={`p-3.5 cursor-pointer transition flex flex-col space-y-1.5 ${
                  selectedThreadId === t.id
                    ? 'bg-indigo-950/40 border-l-4 border-indigo-500'
                    : 'hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`p-1 rounded-md text-white font-bold text-[10px] ${
                      t.channel === 'WhatsApp' ? 'bg-emerald-600' :
                      t.channel === 'Facebook' ? 'bg-blue-600' :
                      t.channel === 'Instagram' ? 'bg-pink-600' : 'bg-amber-600'
                    }`}>
                      {t.channel === 'WhatsApp' && <MessageSquare className="w-3 h-3" />}
                      {t.channel === 'Facebook' && <FacebookIcon className="w-3 h-3" />}
                      {t.channel === 'Instagram' && <InstagramIcon className="w-3 h-3" />}
                      {t.channel === 'Email' && <Mail className="w-3 h-3" />}
                    </span>
                    <span className="font-semibold text-xs text-slate-200">{t.contactName}</span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">{t.time}</span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-1">{t.lastMessage}</p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" /> {t.assignedAgent}
                  </span>

                  {t.unreadCount > 0 && (
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {t.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: Active Chat Feed Panel */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Selected Thread Top Banner */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-sm">
                {selectedThread.contactName.charAt(0)}
              </div>

              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  {selectedThread.contactName}
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                    {selectedThread.channel} Thread
                  </span>
                </h3>
                <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                  <span>Phone: <strong className="text-slate-200">{selectedThread.phone}</strong></span>
                  <span>Email: <strong className="text-slate-200">{selectedThread.email}</strong></span>
                </div>
              </div>
            </div>

            {/* Service Window Timer Badge */}
            {selectedThread.channel === 'WhatsApp' && (
              <div className="bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>24h Window: {selectedThread.serviceWindowHoursRemaining}h remaining</span>
              </div>
            )}
          </div>

          {/* Conversation History Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Customer Message bubble */}
            <div className="flex gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                {selectedThread.contactName.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-200 leading-relaxed">
                  {selectedThread.lastMessage}
                </div>
                <span className="text-[10px] text-slate-500 px-1">{selectedThread.time} • Inbound via {selectedThread.channel}</span>
              </div>
            </div>

            {/* Agent Reply bubble */}
            <div className="flex gap-3 max-w-xl ml-auto flex-row-reverse">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                AS
              </div>
              <div className="space-y-1 text-right">
                <div className="bg-indigo-600 text-white p-3.5 rounded-2xl text-xs leading-relaxed text-left shadow-lg shadow-indigo-600/20">
                  Hello {selectedThread.contactName}! Thanks for reaching out. Let me verify your account specifications right away.
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1 px-1">
                  <span>10:45 AM</span>
                  <CheckCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Delivered</span>
                </div>
              </div>
            </div>

            {/* Meta HSM Template Badge Preview */}
            <div className="my-4 text-center">
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Meta Approved HSM Template Sent: <code className="text-indigo-400">order_confirmation_v2</code>
              </span>
            </div>
          </div>

          {/* Bottom Reply Composer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
            <div className="flex items-center justify-between">
              {/* Reply Mode Toggle */}
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveMode('REPLY')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    activeMode === 'REPLY' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Reply ({selectedThread.channel})
                </button>
                <button
                  onClick={() => setActiveMode('NOTE')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    activeMode === 'NOTE' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Internal Agent Note
                </button>
              </div>

              {/* Template Quick Action */}
              <button
                onClick={() => setShowTemplateModal(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" /> Select Meta Template
              </button>
            </div>

            <form onSubmit={handleSendReply} className="flex gap-2">
              <input
                type="text"
                placeholder={activeMode === 'REPLY' ? `Type your ${selectedThread.channel} response...` : 'Add an internal note visible only to CRM agents...'}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg transition ${
                  activeMode === 'REPLY' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{activeMode === 'REPLY' ? 'Send' : 'Save Note'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* COLUMN 3: Contact & Identity Resolution Sidebar */}
        <div className="w-72 border-l border-slate-800 bg-slate-950/60 p-4 space-y-5 overflow-y-auto shrink-0">
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Profile</h4>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-xl mx-auto">
                {selectedThread.contactName.charAt(0)}
              </div>
              <h3 className="font-bold text-sm text-white">{selectedThread.contactName}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Lead Status: QUALIFIED
              </span>
            </div>
          </div>

          {/* Assigned Agent Control */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Agent</label>
            <select
              value={selectedThread.assignedAgent}
              onChange={(e) => {
                const updatedAgent = e.target.value;
                setThreads(prev => prev.map(t => t.id === selectedThread.id ? { ...t, assignedAgent: updatedAgent } : t));
                showToast(`Thread assigned to ${updatedAgent}`);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Ananya Sharma">Ananya Sharma (You)</option>
              <option value="Rajesh Kumar">Rajesh Kumar</option>
              <option value="Priya Patel">Priya Patel</option>
            </select>
          </div>

          {/* Cross-Channel Identity Binding Card */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-3 h-3 text-indigo-400" /> Linked Channel Identities
            </h4>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
              {selectedThread.channelsLinked.map((ch, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="font-mono text-[11px] truncate">{ch}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Meta Template Selector Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-white">Select Approved WhatsApp HSM Template</h3>

            <div className="space-y-2">
              {[
                { name: 'order_confirmation_v2', text: `Hello ${selectedThread.contactName}, thank you for your order #CENT-8492. Your items are being packed and will arrive shortly.` },
                { name: 'festive_offer_discount', text: `Hi ${selectedThread.contactName}, unlock an exclusive 15% discount on your next service renewal.` },
                { name: 'appointment_reminder', text: `Dear ${selectedThread.contactName}, this is a reminder for your scheduled support call tomorrow at 11:00 AM.` }
              ].map((tmpl) => (
                <div
                  key={tmpl.name}
                  onClick={() => handleApplyTemplate(tmpl.name, tmpl.text)}
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl p-3 cursor-pointer transition space-y-1"
                >
                  <span className="font-mono text-xs font-bold text-indigo-400">{tmpl.name}</span>
                  <p className="text-xs text-slate-300">{tmpl.text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowTemplateModal(false)}
              className="w-full py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommsCenter;
