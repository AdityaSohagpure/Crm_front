import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { Sliders } from 'lucide-react';

const AutomationEngine: React.FC = () => {
  const { automations, toggleAutomationRule, companyConfig } = useCRM();

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-100/70 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            SLA Response & Workflow Automation Engine
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Define automated rules, round-robin assignments, and SLA response thresholds for {companyConfig.companyName}
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
          Engine Status: Active (100% SLA Guard)
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {automations.map((rule) => (
            <div key={rule.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-600">{rule.id}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.active}
                      onChange={() => toggleAutomationRule(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mb-2">{rule.title}</h3>

                <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Trigger Event:</span>
                    <span className="text-slate-900 font-semibold">{rule.triggerEvent}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Condition:</span>
                    <span className="text-blue-600 font-semibold">{rule.condition}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Automated Action:</span>
                    <span className="text-emerald-700 font-semibold">{rule.action}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between font-medium">
                <span>Status: <strong className={rule.active ? 'text-emerald-600' : 'text-slate-400'}>{rule.active ? 'Active' : 'Disabled'}</strong></span>
                <span className="text-[10px] text-slate-400">Auto-Evaluated</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutomationEngine;
