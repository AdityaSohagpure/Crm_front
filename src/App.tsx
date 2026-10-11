import React from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AnalyticsDashboard from './components/Dashboard/AnalyticsDashboard';
import KanbanBoard from './components/Kanban/KanbanBoard';
import LeadsView from './components/Leads/LeadsView';
import ContactsView from './components/Contacts/ContactsView';
import CommsCenter from './components/Communications/CommsCenter';
import QuoteGenerator from './components/Quotes/QuoteGenerator';
import AutomationEngine from './components/Automations/AutomationEngine';
import CRMSettings from './components/Settings/CRMSettings';
import MetaEmailSettings from './components/Settings/MetaEmailSettings';
import { CheckCircle2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, toastMessage } = useCRM();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AnalyticsDashboard />;
      case 'kanban':
        return <KanbanBoard />;
      case 'leads':
        return <LeadsView />;
      case 'contacts':
        return <ContactsView />;
      case 'comms':
        return <CommsCenter />;
      case 'meta-email':
        return <MetaEmailSettings />;
      case 'quotes':
        return <QuoteGenerator />;
      case 'automations':
        return <AutomationEngine />;
      case 'settings':
        return <CRMSettings />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-white border border-blue-500/50 text-slate-900 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Navbar />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <CRMProvider>
      <MainLayout />
    </CRMProvider>
  );
};

export default App;
