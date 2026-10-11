import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  TrendingUp, 
  CheckCircle2, 
  Award, 
  PieChart as PieIcon, 
  BarChart3, 
  Activity,
  ArrowUpRight,
  Flame,
  Users
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';

const AnalyticsDashboard: React.FC = () => {
  const { deals, companyConfig } = useCRM();

  // Calculate Metrics
  const totalPipelineVal = deals.reduce((acc, d) => acc + d.value, 0);
  const wonDeals = deals.filter(d => d.stage === 'Won');
  const wonRevenue = wonDeals.reduce((acc, d) => acc + d.value, 0);
  const winRate = deals.length > 0 ? ((wonDeals.length / deals.length) * 100).toFixed(1) : '0';
  const avgDealSize = deals.length > 0 ? (totalPipelineVal / deals.length).toFixed(0) : '0';

  // Stage Data for Bar Chart
  const stageData = [
    { stage: 'New', count: deals.filter(d => d.stage === 'New').length, value: deals.filter(d => d.stage === 'New').reduce((a, b) => a + b.value, 0) },
    { stage: 'Contacted', count: deals.filter(d => d.stage === 'Contacted').length, value: deals.filter(d => d.stage === 'Contacted').reduce((a, b) => a + b.value, 0) },
    { stage: 'Qualified', count: deals.filter(d => d.stage === 'Qualified').length, value: deals.filter(d => d.stage === 'Qualified').reduce((a, b) => a + b.value, 0) },
    { stage: 'Proposal', count: deals.filter(d => d.stage === 'Proposal').length, value: deals.filter(d => d.stage === 'Proposal').reduce((a, b) => a + b.value, 0) },
    { stage: 'Negotiation', count: deals.filter(d => d.stage === 'Negotiation').length, value: deals.filter(d => d.stage === 'Negotiation').reduce((a, b) => a + b.value, 0) },
    { stage: 'Won', count: deals.filter(d => d.stage === 'Won').length, value: deals.filter(d => d.stage === 'Won').reduce((a, b) => a + b.value, 0) },
  ];

  // Lead Source Data
  const sourcesMap: Record<string, number> = {};
  deals.forEach(d => {
    sourcesMap[d.source] = (sourcesMap[d.source] || 0) + d.value;
  });
  const sourceData = Object.keys(sourcesMap).map(key => ({
    name: key,
    value: sourcesMap[key]
  }));

  const COLORS = ['#2563eb', '#06b6d4', '#4f46e5', '#9333ea', '#d97706', '#10b981'];

  // Top Reps
  const repMap: Record<string, { name: string; avatar: string; value: number; count: number }> = {};
  deals.forEach(d => {
    if (!repMap[d.assignedTo]) {
      repMap[d.assignedTo] = { name: d.assignedTo, avatar: d.assignedAvatar, value: 0, count: 0 };
    }
    repMap[d.assignedTo].value += d.value;
    repMap[d.assignedTo].count += 1;
  });

  const topReps = Object.values(repMap).sort((a, b) => b.value - a.value);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Executive Revenue Intelligence & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time pipeline performance, conversion analytics, and sales velocity for {companyConfig.companyName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-semibold">Quarter Target:</span>
          <span className="text-sm font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            {companyConfig.currencySymbol}1,50,00,000 (Target 82% Met)
          </span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Pipeline Value</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {companyConfig.currencySymbol}{(totalPipelineVal / 100000).toFixed(2)} L
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +18.4% vs last quarter
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Closed Won Revenue</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {companyConfig.currencySymbol}{(wonRevenue / 100000).toFixed(2)} L
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              {wonDeals.length} Secured Enterprise Deals
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Win / Conversion Rate</span>
            <div className="text-2xl font-black text-purple-600 mt-1">
              {winRate}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Industry benchmark: 18.5%
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Avg Deal Size</span>
            <div className="text-2xl font-black text-cyan-600 mt-1">
              {companyConfig.currencySymbol}{(Number(avgDealSize) / 100000).toFixed(2)} L
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Enterprise Contracts
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Value by Stage Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
          <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Pipeline Distribution & Commercial Value by Stage
          </h3>
          <p className="text-xs text-slate-500 mb-4">Value in INR for deals active across stages</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Total Commercial Value']}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Breakdown Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-600" />
              Lead Acquisition Channels (ROI)
            </h3>
            <p className="text-xs text-slate-500 mb-4">Revenue breakdown by origin source</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sourceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {sourceData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="font-bold">{companyConfig.currencySymbol}{(item.value / 100000).toFixed(1)} L</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Leaderboard & Key Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sales Reps Leaderboard */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            Sales Account Executive Leaderboard
          </h3>

          <div className="space-y-3">
            {topReps.map((rep, idx) => (
              <div 
                key={rep.name}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                    idx === 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    #{idx + 1}
                  </span>
                  <img src={rep.avatar} alt={rep.name} className="w-9 h-9 rounded-full object-cover border border-slate-300" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{rep.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{rep.count} Active Managed Deals</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-blue-600">
                    {companyConfig.currencySymbol}{(rep.value / 100000).toFixed(2)} L
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">100% SLA Compliant</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Value Target Deals */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-600" />
            Priority Enterprise High-Value Pipeline
          </h3>

          <div className="space-y-3">
            {deals.slice(0, 4).map((d) => (
              <div 
                key={d.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 line-clamp-1">{d.title}</div>
                  <div className="text-xs text-slate-500">{d.company} • <span className="text-blue-600 font-semibold">{d.stage}</span></div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600">
                    {companyConfig.currencySymbol}{d.value.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Close: {d.expectedCloseDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
