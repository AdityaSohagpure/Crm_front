import React from 'react';
import type { Deal, DealStage } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';
import { 
  Building2, 
  Calendar, 
  AlertTriangle, 
  Flame, 
  ChevronRight, 
  ChevronLeft
} from 'lucide-react';

interface DealCardProps {
  deal: Deal;
  onSelectDeal: (deal: Deal) => void;
}

const STAGES: DealStage[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

const DealCard: React.FC<DealCardProps> = ({ deal, onSelectDeal }) => {
  const { updateDealStage, companyConfig } = useCRM();

  const currentStageIdx = STAGES.indexOf(deal.stage);

  const getPriorityStyle = (priority: Deal['priority']) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <div className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-blue-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityStyle(deal.priority)}`}>
            {deal.priority}
          </span>

          <div className="flex items-center gap-1.5">
            <span 
              title="Lead Score (0-100)"
              className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${getScoreColor(deal.score)}`}
            >
              <Flame className="w-3 h-3 fill-current" />
              Score: {deal.score}
            </span>

            {deal.slaBreached && (
              <span title="SLA Response Time Exceeded!" className="text-red-600 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Title & Company */}
        <h4 
          onClick={() => onSelectDeal(deal)}
          className="font-bold text-sm text-slate-900 hover:text-blue-600 transition cursor-pointer line-clamp-2 mb-1"
        >
          {deal.title}
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium">{deal.company}</span>
        </div>

        {/* Value & Service Category */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Deal Commercials</div>
          <div className="text-base font-black text-blue-600 tracking-tight">
            {companyConfig.currencySymbol}{deal.value.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 truncate mt-0.5">
            Category: {deal.serviceCategory}
          </div>
        </div>
      </div>

      {/* Footer Info & Stage Move Buttons */}
      <div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 mb-3">
          <div className="flex items-center gap-1.5">
            <img 
              src={deal.assignedAvatar} 
              alt={deal.assignedTo} 
              className="w-5 h-5 rounded-full object-cover border border-slate-300"
            />
            <span className="truncate max-w-[90px] font-medium text-slate-700">{deal.assignedTo}</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{deal.expectedCloseDate}</span>
          </div>
        </div>

        {/* Quick Stage Shifters */}
        <div className="flex items-center justify-between gap-1 pt-1">
          <button
            disabled={currentStageIdx === 0}
            onClick={() => updateDealStage(deal.id, STAGES[currentStageIdx - 1])}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-600 hover:text-slate-900 transition"
            title="Move to Previous Stage"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectDeal(deal)}
            className="flex-1 text-center py-1 text-[11px] font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            View Details
          </button>

          <button
            disabled={currentStageIdx === STAGES.length - 1}
            onClick={() => updateDealStage(deal.id, STAGES[currentStageIdx + 1])}
            className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white disabled:opacity-30 rounded-lg transition"
            title="Move to Next Stage"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealCard;
