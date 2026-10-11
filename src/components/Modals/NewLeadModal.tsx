import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import type { LeadSource } from '../../types/crm';
import { X, Zap } from 'lucide-react';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose }) => {
  const { addLead, companyConfig } = useCRM();

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [company, setCompany] = useState('');
  const [industry] = useState('Technology');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location] = useState('Bengaluru, India');
  const [source, setSource] = useState<LeadSource>('Website');
  const [budget, setBudget] = useState(2000000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email) return;

    addLead({
      name,
      designation: designation || 'Technology Director',
      company,
      industry,
      email,
      phone: phone || '+91 98000 11111',
      location,
      source,
      score: Math.floor(65 + Math.random() * 30),
      status: 'New',
      assignedTo: 'Vikramaditya Roy',
      budget: Number(budget),
      currency: companyConfig.currencyCode,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Add Inbound Prospect Lead
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Prospect Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sanjeev Nambiar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Job Designation</label>
              <input
                type="text"
                placeholder="e.g. VP of Tech"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Company</label>
              <input
                type="text"
                required
                placeholder="Company Ltd"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Work Email</label>
              <input
                type="email"
                required
                placeholder="email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Acquisition Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
              >
                <option value="Website">Website</option>
                <option value="WhatsApp">WhatsApp Business</option>
                <option value="Facebook Ads">Facebook Lead Ads</option>
                <option value="Instagram Direct">Instagram Direct</option>
                <option value="Email Inbound">Email Inbound</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Partner Referral">Partner Referral</option>
                <option value="Cold Outreach">Cold Outreach</option>
                <option value="Tech Summit">Tech Summit</option>
              </select>
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Estimated Budget ({companyConfig.currencySymbol})</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 font-bold text-amber-700"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Save Lead Record
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewLeadModal;
