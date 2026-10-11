import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import type { Quotation, QuoteItem } from '../../types/crm';
import { 
  FileText, 
  Plus, 
  Printer, 
  Trash2, 
  ShieldCheck,
  X
} from 'lucide-react';

const QuoteGenerator: React.FC = () => {
  const { quotations, products, deals, companyConfig, createQuotation, showToast } = useCRM();

  const [isBuildingQuote, setIsBuildingQuote] = useState(false);
  const [selectedQuoteForPreview, setSelectedQuoteForPreview] = useState<Quotation | null>(null);

  // New Quote Form State
  const [clientCompany, setClientCompany] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const taxRate = 18; // GST 18%
  const discount = 0;

  const addItemToQuote = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    setItems(prev => [
      ...prev,
      {
        serviceId: prod.id,
        description: `${prod.name} - ${prod.description}`,
        quantity: 1,
        unitPrice: prod.unitPrice,
        totalPrice: prod.unitPrice,
      }
    ]);
  };

  const updateQuantity = (idx: number, qty: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i === idx) {
        const newQty = Math.max(1, qty);
        return {
          ...item,
          quantity: newQty,
          totalPrice: newQty * item.unitPrice,
        };
      }
      return item;
    }));
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const taxAmount = ((subtotal - discount) * taxRate) / 100;
  const grandTotal = subtotal - discount + taxAmount;

  const handleGenerateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientCompany || items.length === 0) {
      showToast('Please select client details and add at least 1 service item.');
      return;
    }

    createQuotation({
      clientCompany,
      clientContact,
      clientEmail,
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      grandTotal,
      currency: companyConfig.currencyCode,
      status: 'Sent',
    });

    setIsBuildingQuote(false);
    // Reset
    setItems([]);
    setClientCompany('');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-100/70 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Commercial Quotation & Billing Engine
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Generate GST-compliant official proposal quotes branded for {companyConfig.companyName}
          </p>
        </div>

        <button
          onClick={() => setIsBuildingQuote(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Commercial Quote</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Existing Quotations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotations.map((q) => (
            <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-blue-600">{q.quoteNumber}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {q.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900">{q.clientCompany}</h3>
                <p className="text-xs text-slate-500 font-medium mb-3">Attn: {q.clientContact} ({q.clientEmail})</p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 mb-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{companyConfig.currencySymbol}{q.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST ({q.taxRate}%):</span>
                    <span className="font-semibold">{companyConfig.currencySymbol}{q.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span className="text-emerald-700 font-black">{companyConfig.currencySymbol}{q.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedQuoteForPreview(q)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Preview & Print Document</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Build Quote Drawer Modal */}
      {isBuildingQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-slate-900">Generate Official Commercial Quote</h3>
              <button onClick={() => setIsBuildingQuote(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateQuote} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Select Deal */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Populate from Deal Context</label>
                <select
                  onChange={(e) => {
                    const d = deals.find(x => x.id === e.target.value);
                    if (d) {
                      setClientCompany(d.company);
                      setClientContact(d.contactPerson);
                      setClientEmail(d.contactEmail);
                    }
                  }}
                  className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200"
                >
                  <option value="">Select a Deal...</option>
                  {deals.map(d => (
                    <option key={d.id} value={d.id}>{d.company} - {d.title}</option>
                  ))}
                </select>
              </div>

              {/* Client Fields */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Client Email</label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Product Picker */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Add Services / Products from Catalog</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addItemToQuote(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200"
                >
                  <option value="">+ Choose Service item...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({companyConfig.currencySymbol}{p.unitPrice.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <span className="flex-1 text-slate-900 font-medium">{item.description}</span>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                      className="w-16 bg-white text-center p-1 rounded border border-slate-200 text-slate-900 font-bold"
                    />
                    <span className="w-24 text-right font-black text-blue-600">
                      {companyConfig.currencySymbol}{item.totalPrice.toLocaleString()}
                    </span>
                    <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs text-right">
                <div>Subtotal: <span className="font-bold text-slate-900">{companyConfig.currencySymbol}{subtotal.toLocaleString()}</span></div>
                <div>GST Rate: <span className="font-bold text-slate-700">{taxRate}%</span></div>
                <div>GST Amount: <span className="font-bold text-slate-700">{companyConfig.currencySymbol}{taxAmount.toLocaleString()}</span></div>
                <div className="text-sm font-black text-emerald-600 pt-1 border-t border-slate-200">
                  Grand Total: {companyConfig.currencySymbol}{grandTotal.toLocaleString()}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Generate & Save Quotation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable PDF Styled Modal */}
      {selectedQuoteForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Action Bar */}
            <div className="bg-slate-900 text-white p-3 px-4 flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Official Document Preview - {companyConfig.companyName}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
                <button onClick={() => setSelectedQuoteForPreview(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-xs leading-relaxed" id="printable-quote">
              {/* Header Letterhead */}
              <div className="flex justify-between items-start border-b-2 border-blue-600 pb-4">
                <div>
                  <img src={companyConfig.logoUrl} alt="Logo" className="h-10 object-contain mb-1" />
                  <h2 className="font-black text-lg text-slate-900 tracking-tight">{companyConfig.companyName}</h2>
                  <p className="text-[10px] text-slate-500">{companyConfig.address}</p>
                  <p className="text-[10px] text-slate-500">GSTIN: {companyConfig.gstin} • Support: {companyConfig.supportEmail}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-blue-600">Commercial Quotation</span>
                  <div className="font-mono text-sm font-bold text-slate-900 mt-1">{selectedQuoteForPreview.quoteNumber}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Date: {selectedQuoteForPreview.date}</div>
                  <div className="text-[10px] text-slate-500">Valid Until: {selectedQuoteForPreview.validUntil}</div>
                </div>
              </div>

              {/* Billed To */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Billed To Client:</div>
                <div className="font-bold text-sm text-slate-900">{selectedQuoteForPreview.clientCompany}</div>
                <div className="text-xs text-slate-700">Attn: {selectedQuoteForPreview.clientContact} ({selectedQuoteForPreview.clientEmail})</div>
              </div>

              {/* Table */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px]">
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-center w-16">Qty</th>
                    <th className="p-2 text-right w-28">Unit Price</th>
                    <th className="p-2 text-right w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedQuoteForPreview.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium text-slate-800">{it.description}</td>
                      <td className="p-2 text-center font-bold text-slate-700">{it.quantity}</td>
                      <td className="p-2 text-right text-slate-700">{companyConfig.currencySymbol}{it.unitPrice.toLocaleString()}</td>
                      <td className="p-2 text-right font-bold text-slate-900">{companyConfig.currencySymbol}{it.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculation Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs text-right border-t border-slate-300 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-bold">{companyConfig.currencySymbol}{selectedQuoteForPreview.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GST ({selectedQuoteForPreview.taxRate}%):</span>
                    <span className="font-bold">{companyConfig.currencySymbol}{selectedQuoteForPreview.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-blue-600 border-t-2 border-slate-900 pt-1">
                    <span>Grand Total:</span>
                    <span>{companyConfig.currencySymbol}{selectedQuoteForPreview.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end text-[11px] text-slate-500 border-t border-slate-200">
                <div>
                  <p className="font-bold text-slate-900 mb-1">Terms & Conditions:</p>
                  <p>1. Payment due within 15 days of invoice date.</p>
                  <p>2. Subject to Bengaluru jurisdiction.</p>
                </div>

                <div className="text-center">
                  <div className="font-serif italic font-bold text-blue-700 text-sm mb-1">Centegix Authorized Signatory</div>
                  <div className="w-40 border-b border-slate-400 mb-1"></div>
                  <div className="font-bold text-slate-900">{companyConfig.companyName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteGenerator;
