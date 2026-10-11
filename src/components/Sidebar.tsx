import React from 'react';
import { useCRM } from '../context/CRMContext';
import { 
  LayoutDashboard, 
  Kanban, 
  Zap, 
  Users, 
  MessageSquare, 
  FileText, 
  Sliders, 
  Settings,
  CheckCircle2,
  TrendingUp,
  Globe
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, deals, leads, companyConfig } = useCRM();

  const navItems = [
    { id: 'dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'kanban', label: 'Sales Pipeline', icon: Kanban, badge: deals.length },
    { id: 'leads', label: 'Leads & Inquiries', icon: Zap, badge: leads.length },
    { id: 'contacts', label: 'Contacts & Accounts', icon: Users, badge: null },
    { id: 'comms', label: 'Omnichannel Inbox', icon: MessageSquare, badge: 'Live' },
    { id: 'meta-email', label: 'Meta & Email Settings', icon: Globe, badge: 'Active' },
    { id: 'quotes', label: 'Quotes & Billing', icon: FileText, badge: null },
    { id: 'automations', label: 'Automation & SLA', icon: Sliders, badge: null },
    { id: 'settings', label: 'Organization Settings', icon: Settings, badge: null },
  ];

  const wonDealsCount = deals.filter(d => d.stage === 'Won').length;
  const totalPipelineVal = deals.reduce((acc, d) => acc + d.value, 0);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      <div className="py-4">
        <div className="px-4 mb-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Navigation Menu
          </span>
        </div>

        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Pipeline Summary */}
      <div className="p-4 m-3 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            Quarter Pipeline
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {wonDealsCount} Won
          </span>
        </div>

        <div className="text-lg font-black text-slate-900 tracking-tight">
          {companyConfig.currencySymbol}{(totalPipelineVal / 100000).toFixed(1)} Lakhs
        </div>

        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (wonDealsCount / (deals.length || 1)) * 100)}%` }}
          ></div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Active CRM Tenants</span>
          <span className="font-bold text-slate-700">3 Clusters</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
