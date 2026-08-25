"use client";

import { useState } from "react";
import { Plus, Trash2, Printer, Download, RefreshCw, Building } from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export function InvoiceGenerator() {
  const [currency, setCurrency] = useState<string>("$");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("INV-2026-001");
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState<string>(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));

  const [fromName, setFromName] = useState<string>("My Studio LLC");
  const [fromAddress, setFromAddress] = useState<string>("123 Innovation Way, San Francisco, CA\nbilling@mystudio.io");

  const [toName, setToName] = useState<string>("Acme Corporation");
  const [toAddress, setToAddress] = useState<string>("456 Market St, Suite 800, New York, NY\naccounts@acme.com");

  const [taxRate, setTaxRate] = useState<number>(10);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("Thank you for your business! Payment is due within 14 days via wire transfer or Stripe.");

  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "Full-Stack Web Application Development", quantity: 40, rate: 85 },
    { id: "2", description: "UI/UX Design & Prototyping", quantity: 15, rate: 70 },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "New Service / Product Item", quantity: 1, rate: 100 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, val: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = Math.max(0, subtotal + taxAmount - discountAmount);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="no-print p-4 bg-card border border-border rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Currency:</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none"
          >
            <option value="$">USD ($)</option>
            <option value="€">EUR (€)</option>
            <option value="£">GBP (£)</option>
            <option value="¥">JPY / CNY (¥)</option>
            <option value="₹">INR (₹)</option>
            <option value="CA$">CAD ($)</option>
            <option value="A$">AUD ($)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs sm:text-sm rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Paper Sheet */}
      <div className="invoice-paper p-6 sm:p-10 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm space-y-8 max-w-4xl mx-auto">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              INVOICE
            </div>
            <div className="mt-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Invoice No: </span>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="font-mono bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none px-1"
              />
            </div>
          </div>

          <div className="space-y-1 text-right text-xs">
            <div>
              <span className="text-slate-500 mr-2">Invoice Date:</span>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="bg-transparent border border-slate-300 rounded px-2 py-0.5"
              />
            </div>
            <div>
              <span className="text-slate-500 mr-2">Payment Due:</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent border border-slate-300 rounded px-2 py-0.5"
              />
            </div>
          </div>
        </div>

        {/* Addresses Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <div>
            <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Billed From (Your Business)
            </span>
            <input
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className="w-full font-bold text-sm text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none"
            />
            <textarea
              rows={2}
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              className="w-full text-slate-600 mt-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none rounded p-1 resize-none"
            />
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Billed To (Client Details)
            </span>
            <input
              type="text"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              className="w-full font-bold text-sm text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none"
            />
            <textarea
              rows={2}
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="w-full text-slate-600 mt-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none rounded p-1 resize-none"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-2">Item Description</th>
                <th className="py-2.5 px-2 w-20 text-center">Qty / Hrs</th>
                <th className="py-2.5 px-2 w-28 text-right">Unit Rate ({currency})</th>
                <th className="py-2.5 px-2 w-28 text-right">Amount ({currency})</th>
                <th className="py-2.5 px-2 w-10 text-center no-print"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="group">
                  <td className="py-3 px-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="w-full font-medium bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900"
                    />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                      className="w-16 text-center bg-transparent border border-slate-200 rounded px-1 py-0.5 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                      className="w-24 text-right bg-transparent border border-slate-200 rounded px-1 py-0.5 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">
                    {currency}{(item.quantity * item.rate).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center no-print">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 no-print">
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg inline-flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>
        </div>

        {/* Totals & Summary */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pt-6 border-t border-slate-200">
          <div className="sm:max-w-xs text-xs space-y-1">
            <span className="font-bold text-slate-900 block">Payment Notes / Terms:</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-slate-600 bg-transparent border border-slate-200 rounded p-2 focus:border-blue-600 focus:outline-none resize-none"
            />
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-bold">{currency}{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                Tax (%):
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-12 text-center border border-slate-200 rounded px-1 text-xs"
                />
              </span>
              <span className="font-mono">{currency}{taxAmount.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                Discount ({currency}):
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-16 text-center border border-slate-200 rounded px-1 text-xs"
                />
              </span>
              <span className="font-mono">-{currency}{discountAmount.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t-2 border-slate-900 flex justify-between text-sm font-black text-slate-900">
              <span>Total Due:</span>
              <span className="font-mono text-base">{currency}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
