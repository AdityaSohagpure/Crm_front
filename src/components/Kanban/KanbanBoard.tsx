import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import type { Deal, DealStage } from '../../types/crm';
import DealCard from './DealCard';
import { 
  Plus, 
  Layers
} from 'lucide-react';
import DealDetailModal from '../Modals/DealDetailModal';
import NewDealModal from '../Modals/NewDealModal';

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'New', label: '1. New Lead Inbound', color: 'border-blue-300 text-blue-700 bg-blue-50' },
  { id: 'Contacted', label: '2. Discovery & Contacted', color: 'border-cyan-300 text-cyan-700 bg-cyan-50' },
  { id: 'Qualified', label: '3. Qualified (BANT)', color: 'border-indigo-300 text-indigo-700 bg-indigo-50' },
  { id: 'Proposal', label: '4. Proposal / Demo', color: 'border-purple-300 text-purple-700 bg-purple-50' },
  { id: 'Negotiation', label: '5. Negotiation & MSA', color: 'border-amber-300 text-amber-700 bg-amber-50' },
  { id: 'Won', label: '6. Closed Won 🎉', color: 'border-emerald-300 text-emerald-700 bg-emerald-50' },
  { id: 'Lost', label: '7. Closed Lost', color: 'border-slate-300 text-slate-600 bg-slate-100' },
];

const KanbanBoard: React.FC = () => {
  const { deals, searchQuery, companyConfig } = useCRM();

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === 'All' || deal.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const totalValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-100/70 overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Frappe-Style Enterprise Sales Pipeline
          </h1>
          <p className="text-xs text-slate-500">
            Real-time multi-stage Kanban deal board for {companyConfig.companyName}
          </p>
        </div>

        {/* Pipeline Controls & Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Pipeline Total:</span>
            <span className="font-extrabold text-blue-600">
              {companyConfig.currencySymbol}{totalValue.toLocaleString()}
            </span>
            <span className="text-slate-400 font-medium">({filteredDeals.length} Deals)</span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 text-xs text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button
              onClick={() => setIsNewDealModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Stages Scroll Area */}
      <div className="flex-1 overflow-x-auto p-4 flex gap-4">
        {STAGES.map((stage) => {
          const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
          const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={stage.id}
              className="w-80 shrink-0 bg-slate-200/50 border border-slate-200/80 rounded-2xl flex flex-col max-h-full"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${stage.color}`}>
                    {stage.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {stageDeals.length}
                </span>
              </div>

              {/* Column Commercial Total */}
              <div className="px-3 py-1.5 bg-slate-100/80 text-[11px] text-slate-600 flex items-center justify-between border-b border-slate-200 font-medium">
                <span>Stage Value:</span>
                <span className="font-bold text-slate-900">
                  {companyConfig.currencySymbol}{stageValue.toLocaleString()}
                </span>
              </div>

              {/* Deal Cards Container */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {stageDeals.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
                    No deals in this stage
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onSelectDeal={(d) => setSelectedDeal(d)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {selectedDeal && (
        <DealDetailModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
      )}

      {isNewDealModalOpen && (
        <NewDealModal isOpen={isNewDealModalOpen} onClose={() => setIsNewDealModalOpen(false)} />
      )}
    </div>
  );
};

export default KanbanBoard;
