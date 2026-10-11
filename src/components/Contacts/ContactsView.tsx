import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Users, Building, Mail, Phone } from 'lucide-react';

const ContactsView: React.FC = () => {
  const { contacts, organizations, companyConfig, searchQuery } = useCRM();
  const [activeSubTab, setActiveSubTab] = useState<'contacts' | 'organizations'>('contacts');

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrgs = organizations.filter(o =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-100/70 overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            360° Contacts & Client Accounts Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Centralized client relationship database for {companyConfig.companyName}
          </p>
        </div>

        {/* Sub-tab selectors */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('contacts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'contacts' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Contacts ({contacts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('organizations')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'organizations' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Organizations ({organizations.length})
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSubTab === 'contacts' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white text-sm shadow-inner">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{contact.name}</h3>
                    <p className="text-xs text-blue-600 font-bold">{contact.title}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-900">{contact.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${contact.email}`} className="hover:underline text-blue-600 font-medium">{contact.email}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{contact.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
                  <span>Deals: {contact.dealsAssociated}</span>
                  <span className="font-extrabold text-emerald-600">
                    Revenue: {companyConfig.currencySymbol}{contact.totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrgs.map((org) => (
              <div key={org.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-base text-slate-900">{org.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 font-medium">{org.industry} • {org.employees} employees</p>

                  <div className="text-xs text-slate-700 space-y-1">
                    <div>Primary Contact: <span className="font-bold text-slate-900">{org.primaryContact}</span></div>
                    <div>Website: <a href={org.website} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline">{org.website}</a></div>
                  </div>
                </div>

                <div className="text-right flex flex-col justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border self-end ${
                    org.status === 'Active Client' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {org.status}
                  </span>

                  <div>
                    <div className="text-xs text-slate-500 font-medium">Account Value</div>
                    <div className="text-lg font-black text-blue-600">
                      {companyConfig.currencySymbol}{org.totalValue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsView;
