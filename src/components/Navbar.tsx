import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { 
  Building2, 
  Search, 
  Plus, 
  Bell, 
  ShieldCheck, 
  ChevronDown
} from 'lucide-react';
import NewDealModal from './Modals/NewDealModal';

const Navbar: React.FC = () => {
  const { 
    companyConfig, 
    tenants, 
    activeTenant, 
    setActiveTenantId, 
    searchQuery, 
    setSearchQuery,
    showToast,
    backendOnline 
  } = useCRM();

  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 flex items-center justify-between shadow-xs">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 transition-colors p-1.5 pr-3 rounded-xl border border-slate-200">
            {companyConfig.logoUrl ? (
              <img 
                src={companyConfig.logoUrl} 
                alt={companyConfig.companyName} 
                className="w-8 h-8 rounded-lg object-contain bg-slate-100 p-0.5 border border-slate-200"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                {companyConfig.companyName}
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  CRM Enterprise
                </span>
              </span>
              <span className="text-[10px] text-slate-500 tracking-wide font-medium">
                {companyConfig.tagline}
              </span>
            </div>
          </div>

          {/* Tenant Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowTenantDropdown(!showTenantDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="max-w-[140px] truncate">{activeTenant.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showTenantDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Select Enterprise Tenant Cluster
                </div>
                {tenants.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTenantId(t.id);
                      setShowTenantDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-slate-50 transition ${
                      t.id === activeTenant.id ? 'bg-blue-50/70 border-l-2 border-blue-600 text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>{t.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {t.region}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {t.tier} • {t.usersCount} Active Users
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search deals, contacts, leads, quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 text-slate-900 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Right Action Toolbar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDealModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Deal</span>
          </button>

          <div className="h-6 w-px bg-slate-200"></div>

          {/* Live Render Backend Status Indicator */}
          <a 
            href="https://crm-python-3ocz.onrender.com/docs"
            target="_blank"
            rel="noreferrer"
            title="Render Python Backend API - Click to view Swagger Docs"
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              backendOnline === true
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : backendOnline === false
                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {backendOnline === true && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                backendOnline === true ? 'bg-emerald-500' : backendOnline === false ? 'bg-amber-500' : 'bg-slate-400'
              }`}></span>
            </span>
            <span className="text-[11px]">
              {backendOnline === true ? 'Render API: Live' : backendOnline === false ? 'Render API: Reconnecting' : 'Render API: Checking...'}
            </span>
          </a>

          {/* System SLA Status Indicator */}
          <div 
            title="Centegix SLA Engine Active"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-semibold">SLA Active (100%)</span>
          </div>

          <button 
            onClick={() => showToast('🔔 System notification: Frappe CRM engine synchronized with Centegix servers.')}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white text-xs shadow-inner">
              AS
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-none">Ananya Sharma</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Enterprise Admin</span>
            </div>
          </div>
        </div>
      </header>

      {isDealModalOpen && (
        <NewDealModal isOpen={isDealModalOpen} onClose={() => setIsDealModalOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
