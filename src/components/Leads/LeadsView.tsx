import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import type { Lead } from '../../types/crm';
import { 
  Zap, 
  Plus, 
  Flame, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  ArrowRight
} from 'lucide-react';
import NewLeadModal from '../Modals/NewLeadModal';

const LeadsView: React.FC = () => {
  const { leads, updateLeadStatus, addDeal, searchQuery, companyConfig, showToast } = useCRM();

  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.industry.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const convertToDeal = (lead: Lead) => {
    addDeal({
      title: `${lead.industry} Transformation for ${lead.company}`,
      company: lead.company,
      contactPerson: lead.name,
      contactEmail: lead.email,
      contactPhone: lead.phone,
      value: lead.budget || 2000000,
      currency: lead.currency || 'INR',
      stage: 'Qualified',
      score: lead.score,
      source: lead.source,
      priority: lead.score > 80 ? 'High' : 'Medium',
      assignedTo: lead.assignedTo,
      assignedAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      expectedCloseDate: '2026-11-30',
      daysInStage: 0,
      serviceCategory: 'Enterprise IT Services',
      notes: `Converted from lead ${lead.id}. Budget indicated: ${lead.budget}`,
    });
    updateLeadStatus(lead.id, 'Qualified');
    showToast(`Converted lead ${lead.name} into an active Qualified Deal!`);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-100/70 overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Inbound Leads & Inquiry Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Qualify, score, and convert prospect inquiries into enterprise deals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 text-xs text-slate-700 font-medium px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Attempted">Attempted</option>
            <option value="In Discussion">In Discussion</option>
            <option value="Qualified">Qualified</option>
            <option value="Disqualified">Disqualified</option>
          </select>

          <button
            onClick={() => setIsNewLeadModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Leads Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => (
          <div 
            key={lead.id}
            className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {lead.source}
                </span>

                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current text-amber-600" />
                  Score: {lead.score}
                </span>
              </div>

              {/* Lead Info */}
              <h3 className="font-bold text-base text-slate-900">{lead.name}</h3>
              <p className="text-xs text-blue-600 font-bold mb-1">{lead.designation}</p>

              <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 my-3">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-bold text-slate-900">{lead.company}</span>
                  <span className="text-[10px] text-slate-500 font-medium">({lead.industry})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${lead.email}`} className="hover:underline text-blue-600 font-medium">{lead.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{lead.location}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-slate-500 font-medium">Est. Budget:</span>
                <span className="font-black text-emerald-600">
                  {companyConfig.currencySymbol}{lead.budget.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <select
                  value={lead.status}
                  onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                  className="bg-slate-50 text-[11px] font-semibold text-slate-700 px-2 py-1.5 rounded-lg border border-slate-200 flex-1"
                >
                  <option value="New">New</option>
                  <option value="Attempted">Attempted</option>
                  <option value="In Discussion">In Discussion</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Disqualified">Disqualified</option>
                </select>

                <button
                  onClick={() => convertToDeal(lead)}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  title="Convert to Active Deal Pipeline"
                >
                  <span>Convert</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isNewLeadModalOpen && (
        <NewLeadModal isOpen={isNewLeadModalOpen} onClose={() => setIsNewLeadModalOpen(false)} />
      )}
    </div>
  );
};

export default LeadsView;
