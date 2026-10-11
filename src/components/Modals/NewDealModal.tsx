import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import type { DealStage, Priority, LeadSource } from '../../types/crm';
import { X, Plus } from 'lucide-react';

interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewDealModal: React.FC<NewDealModalProps> = ({ isOpen, onClose }) => {
  const { addDeal, companyConfig } = useCRM();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone] = useState('+91 99000 00000');
  const [value, setValue] = useState(2500000);
  const [stage, setStage] = useState<DealStage>('New');
  const [priority, setPriority] = useState<Priority>('High');
  const [source, setSource] = useState<LeadSource>('Website');
  const [serviceCategory, setServiceCategory] = useState('Cloud Architecture & DevOps');
  const [assignedTo] = useState('Ananya Sharma');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !contactPerson) return;

    addDeal({
      title,
      company,
      contactPerson,
      contactEmail: contactEmail || 'contact@client.com',
      contactPhone: contactPhone || '+91 99000 00000',
      value: Number(value),
      currency: companyConfig.currencyCode,
      stage,
      score: Math.floor(60 + Math.random() * 35),
      source,
      priority,
      assignedTo,
      assignedAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      daysInStage: 0,
      serviceCategory,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Create Enterprise Deal Record
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Deal Title / Scope</label>
            <input
              type="text"
              required
              placeholder="e.g. AWS Multi-Region Migration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Client Company</label>
              <input
                type="text"
                required
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Contact</label>
              <input
                type="text"
                required
                placeholder="Contact Name"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Email</label>
              <input
                type="email"
                placeholder="email@client.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Deal Commercial Value ({companyConfig.currencySymbol})</label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 font-bold text-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pipeline Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
              >
                <option value="Website">Website</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Partner Referral">Partner Referral</option>
                <option value="Tech Summit">Tech Summit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Service Offering Category</label>
            <select
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
            >
              <option value="Cloud Architecture & DevOps">Cloud Architecture & DevOps</option>
              <option value="SaaS & Custom Engineering">SaaS & Custom Engineering</option>
              <option value="AI & Data Engineering">AI & Data Engineering</option>
              <option value="Cybersecurity & Compliance">Cybersecurity & Compliance</option>
              <option value="API & Integrations">API & Integrations</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Initial Discovery Notes</label>
            <textarea
              rows={3}
              placeholder="Key requirements, budget discussion, timeline..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Create Deal & Notify Team
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewDealModal;
