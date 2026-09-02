"use client";

import { useState, useMemo } from "react";
import { Database, Copy, Check, Download, RefreshCw, Sparkles, Plus, Trash2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Casey", "Riley", "Jamie", "Logan"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
const ROLES = ["Software Engineer", "Product Manager", "UI/UX Designer", "DevOps Engineer", "Data Scientist", "Marketing Director"];
const COMPANIES = ["Acme Corp", "TechFlow Inc", "GlobalScale", "Apex Logic", "CloudPeak", "NextGen Labs"];
const COUNTRIES = ["United States", "United Kingdom", "Canada", "Germany", "Australia", "Japan", "France"];

export function MockJsonGenerator() {
  const [count, setCount] = useState<number>(5);
  const [seed, setSeed] = useState<number>(1);
  const [includeUuid, setIncludeUuid] = useState<boolean>(true);
  const [includeName, setIncludeName] = useState<boolean>(true);
  const [includeEmail, setIncludeEmail] = useState<boolean>(true);
  const [includeRole, setIncludeRole] = useState<boolean>(true);
  const [includeCompany, setIncludeCompany] = useState<boolean>(true);
  const [includeSalary, setIncludeSalary] = useState<boolean>(true);
  const [includeDate, setIncludeDate] = useState<boolean>(true);
  const [includeActive, setIncludeActive] = useState<boolean>(true);
  const [includeCountry, setIncludeCountry] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const mockData = useMemo(() => {
    const list: Record<string, any>[] = [];

    for (let i = 0; i < count; i++) {
      const obj: Record<string, any> = {};
      const fName = FIRST_NAMES[(i + seed * 3) % FIRST_NAMES.length];
      const lName = LAST_NAMES[(i * 2 + seed * 7) % LAST_NAMES.length];

      if (includeUuid) {
        obj.id = `usr_${((i + 1) * 1000 + seed * 17).toString(16).padStart(8, "0")}`;
      }
      if (includeName) {
        obj.name = `${fName} ${lName}`;
      }
      if (includeEmail) {
        obj.email = `${fName.toLowerCase()}.${lName.toLowerCase()}@example.com`;
      }
      if (includeRole) {
        obj.role = ROLES[(i + seed) % ROLES.length];
      }
      if (includeCompany) {
        obj.company = COMPANIES[(i * 3 + seed) % COMPANIES.length];
      }
      if (includeSalary) {
        obj.salary = 85000 + ((i * 12500 + seed * 4500) % 95000);
      }
      if (includeCountry) {
        obj.country = COUNTRIES[(i + seed * 2) % COUNTRIES.length];
      }
      if (includeActive) {
        obj.isActive = (i + seed) % 3 !== 0;
      }
      if (includeDate) {
        const d = new Date(2026, 0, 1 + i * 4);
        obj.createdAt = d.toISOString();
      }

      list.push(obj);
    }

    return JSON.stringify(list, null, 2);
  }, [
    count,
    seed,
    includeUuid,
    includeName,
    includeEmail,
    includeRole,
    includeCompany,
    includeSalary,
    includeDate,
    includeActive,
    includeCountry,
  ]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(mockData);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([mockData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock_data_${count}_records.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Record Count:
          </label>
          <select
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-background border border-border rounded-lg"
          >
            <option value={3}>3 Records</option>
            <option value={5}>5 Records</option>
            <option value={10}>10 Records</option>
            <option value={25}>25 Records</option>
            <option value={50}>50 Records</option>
          </select>

          <button
            onClick={() => setSeed((s) => s + 1)}
            className="px-3 py-1.5 bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg inline-flex items-center gap-1 shadow-2xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
            <span>Regenerate Values</span>
          </button>
        </div>

        <button
          onClick={handleDownload}
          className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 inline-flex items-center gap-1.5 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .JSON</span>
        </button>
      </div>

      {/* Field Toggle Checkboxes */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
          Select Schema Properties
        </span>
        <div className="flex flex-wrap gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeUuid} onChange={(e) => setIncludeUuid(e.target.checked)} />
            <span>ID (UUID)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeName} onChange={(e) => setIncludeName(e.target.checked)} />
            <span>Full Name</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeEmail} onChange={(e) => setIncludeEmail(e.target.checked)} />
            <span>Email</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeRole} onChange={(e) => setIncludeRole(e.target.checked)} />
            <span>Job Role</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeCompany} onChange={(e) => setIncludeCompany(e.target.checked)} />
            <span>Company</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeSalary} onChange={(e) => setIncludeSalary(e.target.checked)} />
            <span>Salary ($)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeCountry} onChange={(e) => setIncludeCountry(e.target.checked)} />
            <span>Country</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeActive} onChange={(e) => setIncludeActive(e.target.checked)} />
            <span>Status (Bool)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeDate} onChange={(e) => setIncludeDate(e.target.checked)} />
            <span>Created Date</span>
          </label>
        </div>
      </div>

      {/* JSON Output Viewer */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-500" />
            Generated JSON Mock Dataset ({count} objects)
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied JSON!" : "Copy JSON"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all max-h-96">
          {mockData}
        </pre>
      </div>
    </div>
  );
}
