import React, { useState } from 'react';
import type { Deal, DealStage } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';
import { 
  X, 
  Building2, 
  Trash2, 
  Send
} from 'lucide-react';

interface DealDetailModalProps {
  deal: Deal;
  onClose: () => void;
}

const STAGES: DealStage[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

const DealDetailModal: React.FC<DealDetailModalProps> = ({ deal, onClose }) => {
  const { updateDealStage, deleteDeal, activities, addActivity, companyConfig, showToast } = useCRM();

  const [noteInput, setNoteInput] = useState('');

  const dealActivities = activities.filter(a => a.dealId === deal.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    addActivity({
      dealId: deal.id,
      contactName: deal.contactPerson,
      type: 'Note',
      content: noteInput,
      performedBy: deal.assignedTo,
    });

    setNoteInput('');
    showToast('Activity note added to deal timeline.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white border-l border-slate-200 w-full max-w-2xl h-full flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="font-mono text-xs font-bold text-blue-600">{deal.id}</span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">{deal.title}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                deleteDeal(deal.id);
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
              title="Delete Deal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stage Progression Bar */}
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-500 block mb-2">Deal Pipeline Stage</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
              {STAGES.map((stg) => {
                const isActive = deal.stage === stg;
                return (
                  <button
                    key={stg}
                    onClick={() => updateDealStage(deal.id, stg)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                      isActive
                        ? stg === 'Won' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {stg}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Deal Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Deal Commercials</div>
              <div className="text-2xl font-black text-blue-600">
                {companyConfig.currencySymbol}{deal.value.toLocaleString()}
              </div>
              <div className="text-xs text-slate-700 font-medium">Category: {deal.serviceCategory}</div>
              <div className="text-[11px] text-slate-500">Lead Source: {deal.source}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Client Contact</div>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                {deal.company}
              </div>
              <div className="text-xs text-slate-700 font-medium">Attn: {deal.contactPerson}</div>
              <div className="text-[11px] text-slate-500">{deal.contactEmail} • {deal.contactPhone}</div>
            </div>
          </div>

          {/* Activity Notes Section */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Deal Activity & Communication Log
            </h3>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Log a call note, meeting takeaway, or task..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="flex-1 bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 rounded-xl transition flex items-center gap-1 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Log Note</span>
              </button>
            </form>

            <div className="space-y-2.5">
              {dealActivities.length === 0 ? (
                <div className="text-slate-400 text-xs py-4 text-center border border-dashed border-slate-200 rounded-xl">
                  No activity logged for this deal yet.
                </div>
              ) : (
                dealActivities.map((act) => (
                  <div key={act.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1 font-medium">
                      <span className="font-bold text-blue-600">{act.type}</span>
                      <span>{act.timestamp}</span>
                    </div>
                    <p className="text-slate-800">{act.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetailModal;
