import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Deal, 
  Lead, 
  Contact, 
  Organization, 
  ActivityLog, 
  ProductService, 
  Quotation, 
  CompanyConfig, 
  TenantOrg, 
  AutomationRule,
  DealStage,
  LeadSource,
  Priority
} from '../types/crm';
import { 
  INITIAL_DEALS, 
  INITIAL_LEADS, 
  INITIAL_CONTACTS, 
  INITIAL_ORGANIZATIONS, 
  INITIAL_ACTIVITIES, 
  INITIAL_PRODUCTS, 
  INITIAL_QUOTATIONS, 
  INITIAL_COMPANY_CONFIG, 
  INITIAL_TENANTS, 
  INITIAL_AUTOMATIONS 
} from '../data/mockData';
import confetti from 'canvas-confetti';
import { 
  checkBackendHealth, 
  fetchContacts, 
  createBackendContact,
  fetchDeals,
  createBackendDeal,
  updateBackendDealStage,
  deleteBackendDeal
} from '../services/api';

interface CRMContextType {
  deals: Deal[];
  leads: Lead[];
  contacts: Contact[];
  organizations: Organization[];
  activities: ActivityLog[];
  products: ProductService[];
  quotations: Quotation[];
  companyConfig: CompanyConfig;
  whitelabel: CompanyConfig; // Alias for component access
  tenants: TenantOrg[];
  activeTenant: TenantOrg;
  automations: AutomationRule[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Actions
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDealStage: (dealId: string, newStage: DealStage) => void;
  updateDeal: (deal: Deal) => void;
  deleteDeal: (dealId: string) => void;
  
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLeadStatus: (leadId: string, status: Lead['status']) => void;
  
  addContact: (contact: Omit<Contact, 'id'>) => void;
  addOrganization: (org: Omit<Organization, 'id'>) => void;
  
  addActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  createQuotation: (quote: Omit<Quotation, 'id' | 'quoteNumber'>) => void;
  
  updateCompanyConfig: (config: Partial<CompanyConfig>) => void;
  resetCompanyConfig: () => void;
  setActiveTenantId: (tenantId: string) => void;
  toggleAutomationRule: (ruleId: string) => void;
  
  // Backend Cloud API Status
  backendOnline: boolean | null;
  checkBackendConnection: () => Promise<void>;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or default
  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('centegix_crm_deals');
    return saved ? JSON.parse(saved) : INITIAL_DEALS;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('centegix_crm_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('centegix_crm_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem('centegix_crm_orgs');
    return saved ? JSON.parse(saved) : INITIAL_ORGANIZATIONS;
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('centegix_crm_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [products] = useState<ProductService[]>(INITIAL_PRODUCTS);

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('centegix_crm_quotes');
    return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
  });

  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(() => {
    const saved = localStorage.getItem('centegix_crm_company_config');
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_CONFIG;
  });

  const [tenants] = useState<TenantOrg[]>(INITIAL_TENANTS);
  const [activeTenantId, setActiveTenantIdState] = useState<string>('tenant-1');
  const [automations, setAutomations] = useState<AutomationRule[]>(INITIAL_AUTOMATIONS);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const checkBackendConnection = async () => {
    try {
      const res = await checkBackendHealth();
      if (res && (res.status === 'ONLINE' || res.status === 'ok')) {
        setBackendOnline(true);
        try {
          const liveContacts = await fetchContacts();
          if (liveContacts && liveContacts.length > 0) {
            setContacts(prev => {
              const existingEmails = new Set(prev.map(c => c.email?.toLowerCase()).filter(Boolean));
              const newItems: Contact[] = liveContacts
                .filter(lc => lc.email && !existingEmails.has(lc.email.toLowerCase()))
                .map(lc => ({
                  id: lc.id,
                  name: lc.name,
                  title: 'Account Executive',
                  company: 'Enterprise Client',
                  email: lc.email || '',
                  phone: lc.phone || '',
                  dealsAssociated: 1,
                  totalRevenue: 50000,
                  lastContacted: new Date().toISOString().split('T')[0]
                }));
              return [...newItems, ...prev];
            });
          }
        } catch {
          // Keep local mock/cached contacts if not yet authenticated
        }

        // Fetch live deals stored in PostgreSQL / Neon database
        try {
          const liveDeals = await fetchDeals();
          if (liveDeals && liveDeals.length > 0) {
            setDeals(prev => {
              const existingIds = new Set(prev.map(d => d.id));
              const newItems: Deal[] = liveDeals
                .filter(ld => !existingIds.has(ld.id))
                .map(ld => ({
                  id: ld.id,
                  title: ld.title,
                  company: ld.company,
                  contactPerson: ld.contactPerson,
                  contactEmail: ld.contactEmail || '',
                  contactPhone: ld.contactPhone || '',
                  value: Number(ld.value) || 0,
                  currency: ld.currency || 'INR',
                  stage: ld.stage as DealStage,
                  score: Number(ld.score) || 50,
                  source: ld.source as LeadSource,
                  priority: ld.priority as Priority,
                  assignedTo: ld.assignedTo || 'Ananya Sharma',
                  assignedAvatar: ld.assignedAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
                  expectedCloseDate: ld.expectedCloseDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                  daysInStage: Number(ld.daysInStage) || 0,
                  serviceCategory: ld.serviceCategory || 'Cloud Architecture & DevOps',
                  notes: ld.notes || '',
                  createdAt: ld.createdAt || new Date().toISOString().split('T')[0],
                  updatedAt: ld.updatedAt || new Date().toISOString().split('T')[0]
                }));
              return [...newItems, ...prev];
            });
          }
        } catch {
          // Keep local mock/cached deals if backend fetch encounters issues
        }
      } else {
        setBackendOnline(false);
      }
    } catch {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    checkBackendConnection();
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('centegix_crm_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('centegix_crm_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('centegix_crm_company_config', JSON.stringify(companyConfig));
  }, [companyConfig]);

  useEffect(() => {
    localStorage.setItem('centegix_crm_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('centegix_crm_orgs', JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem('centegix_crm_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('centegix_crm_quotes', JSON.stringify(quotations));
  }, [quotations]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const activeTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];

  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tempId = `DEAL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDeal: Deal = {
      ...dealData,
      id: tempId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setDeals(prev => [newDeal, ...prev]);
    showToast(`New Deal "${newDeal.title}" created successfully!`);

    addActivity({
      dealId: newDeal.id,
      contactName: newDeal.contactPerson,
      type: 'Note',
      content: `Deal "${newDeal.title}" created with value ${companyConfig.currencySymbol}${newDeal.value.toLocaleString()}`,
      performedBy: newDeal.assignedTo,
    });

    // Save to Cloud Database (PostgreSQL / Neon via Render)
    createBackendDeal({
      title: dealData.title,
      company: dealData.company,
      contactPerson: dealData.contactPerson,
      contactEmail: dealData.contactEmail,
      contactPhone: dealData.contactPhone,
      value: dealData.value,
      currency: dealData.currency,
      stage: dealData.stage,
      score: dealData.score,
      source: dealData.source,
      priority: dealData.priority,
      assignedTo: dealData.assignedTo,
      expectedCloseDate: dealData.expectedCloseDate,
      serviceCategory: dealData.serviceCategory,
      notes: dealData.notes,
    })
      .then(savedDeal => {
        if (savedDeal && savedDeal.id) {
          // Update temp ID with database-persisted ID
          setDeals(prev => prev.map(d => d.id === tempId ? { ...d, id: savedDeal.id } : d));
          showToast(`⚡ Deal "${savedDeal.title}" saved to PostgreSQL Database!`);
        }
      })
      .catch(err => {
        console.warn('Backend database deal storage:', err);
      });
  };

  const updateDealStage = (dealId: string, newStage: DealStage) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        if (newStage === 'Won' && d.stage !== 'Won') {
          // Trigger victory celebration!
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
          showToast(`🎉 Congratulations! Deal "${d.title}" moved to Closed Won!`);
        } else {
          showToast(`Deal "${d.title}" moved to ${newStage}`);
        }
        return {
          ...d,
          stage: newStage,
          updatedAt: new Date().toISOString().split('T')[0],
          daysInStage: 0,
        };
      }
      return d;
    }));

    const deal = deals.find(d => d.id === dealId);
    if (deal) {
      addActivity({
        dealId,
        contactName: deal.contactPerson,
        type: 'StageChange',
        content: `Stage updated from ${deal.stage} -> ${newStage}`,
        performedBy: deal.assignedTo,
      });
    }

    // Persist stage update to backend database
    updateBackendDealStage(dealId, newStage).catch(err => {
      console.warn('Backend deal stage update error:', err);
    });
  };

  const updateDeal = (updatedDeal: Deal) => {
    setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d));
    showToast(`Deal "${updatedDeal.title}" updated.`);
  };

  const deleteDeal = (dealId: string) => {
    setDeals(prev => prev.filter(d => d.id !== dealId));
    showToast(`Deal deleted.`);

    // Persist deletion to backend database
    deleteBackendDeal(dealId).catch(err => {
      console.warn('Backend deal deletion error:', err);
    });
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `LEAD-${Math.floor(2000 + Math.random() * 8000)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeads(prev => [newLead, ...prev]);
    showToast(`Lead "${newLead.name}" added to pipeline.`);
  };

  const updateLeadStatus = (leadId: string, status: Lead['status']) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    showToast(`Lead status updated to ${status}`);
  };

  const addContact = (contactData: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `CONT-${Math.floor(3000 + Math.random() * 7000)}`,
    };
    setContacts(prev => [newContact, ...prev]);
    showToast(`Contact "${newContact.name}" saved.`);

    // Synchronize to Render Cloud Backend
    createBackendContact({
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      notes: `${contactData.title} at ${contactData.company}`,
      leadStatus: 'QUALIFIED',
      tags: ['Enterprise CRM']
    }).then(res => {
      if (res?.id) {
        showToast(`Contact synced to Render Cloud (ID: ${res.id})`);
      }
    }).catch(err => {
      console.warn('Backend sync failed, saved locally:', err);
    });
  };

  const addOrganization = (orgData: Omit<Organization, 'id'>) => {
    const newOrg: Organization = {
      ...orgData,
      id: `ORG-${Math.floor(4000 + Math.random() * 6000)}`,
    };
    setOrganizations(prev => [newOrg, ...prev]);
    showToast(`Organization "${newOrg.name}" registered.`);
  };

  const addActivity = (activityData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const formatted = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    const newAct: ActivityLog = {
      ...activityData,
      id: `ACT-${Math.floor(5000 + Math.random() * 5000)}`,
      timestamp: formatted,
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const createQuotation = (quoteData: Omit<Quotation, 'id' | 'quoteNumber'>) => {
    const nextNum = quotations.length + 90;
    const newQuote: Quotation = {
      ...quoteData,
      id: `QUO-${Math.floor(9000 + Math.random() * 1000)}`,
      quoteNumber: `CENT-QT-2026-0${nextNum}`,
    };
    setQuotations(prev => [newQuote, ...prev]);
    showToast(`Quotation ${newQuote.quoteNumber} generated!`);
  };

  const updateCompanyConfig = (updates: Partial<CompanyConfig>) => {
    setCompanyConfig(prev => ({
      ...prev,
      ...updates,
    }));
    showToast('Organization settings updated successfully!');
  };

  const resetCompanyConfig = () => {
    setCompanyConfig(INITIAL_COMPANY_CONFIG);
    showToast('Company configuration reset to default parameters.');
  };

  const setActiveTenantId = (tenantId: string) => {
    setActiveTenantIdState(tenantId);
    const tenantObj = tenants.find(t => t.id === tenantId);
    showToast(`Switched active workspace tenant to: ${tenantObj?.name}`);
  };

  const toggleAutomationRule = (ruleId: string) => {
    setAutomations(prev => prev.map(r => r.id === ruleId ? { ...r, active: !r.active } : r));
    showToast('Automation rule toggled.');
  };

  return (
    <CRMContext.Provider value={{
      deals,
      leads,
      contacts,
      organizations,
      activities,
      products,
      quotations,
      companyConfig,
      whitelabel: companyConfig,
      tenants,
      activeTenant,
      automations,
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      addDeal,
      updateDealStage,
      updateDeal,
      deleteDeal,
      addLead,
      updateLeadStatus,
      addContact,
      addOrganization,
      addActivity,
      createQuotation,
      updateCompanyConfig,
      resetCompanyConfig,
      setActiveTenantId,
      toggleAutomationRule,
      backendOnline,
      checkBackendConnection,
      toastMessage,
      showToast,
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
