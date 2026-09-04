"use client";

import React, { useState, useMemo } from "react";
import { ShieldCheck, DollarSign, Calculator, TrendingUp, Copy, Check, Info, FileText, ArrowRight } from "lucide-react";

interface ScheduleYear {
  year: number;
  startAssetValue: number;
  assetGrowth: number;
  notePaymentInterest: number;
  notePaymentPrincipal: number;
  grantorTaxPaid: number;
  endAssetValue: number;
  endNoteBalance: number;
  trustEquity: number;
}

export function IdgtPromissoryNoteCalculator() {
  const [saleValue, setSaleValue] = useState<number>(10000000); // $10M asset sale
  const [seedGiftPercent, setSeedGiftPercent] = useState<number>(10); // 10% seed gift ($1M)
  const [noteTermYears, setNoteTermYears] = useState<number>(9); // 9 years (Mid-Term AFR)
  const [afrRate, setAfrRate] = useState<number>(4.20); // 4.20% Applicable Federal Rate
  const [assetGrowthRate, setAssetGrowthRate] = useState<number>(12.0); // 12% total return / yr
  const [noteType, setNoteType] = useState<"interest_only" | "amortizing">("interest_only");
  const [grantorPaysTaxes, setGrantorPaysTaxes] = useState<boolean>(true); // Rev. Rul. 85-13 tax burn
  const [grantorTaxRate, setGrantorTaxRate] = useState<number>(30.0); // 30% combined tax rate
  const [estateTaxRate, setEstateTaxRate] = useState<number>(40.0); // 40% federal estate tax

  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const principal = Math.max(10000, saleValue);
    const seedGift = principal * (seedGiftPercent / 100);
    const n = Math.max(1, Math.min(30, noteTermYears));
    const r = Math.max(0.01, afrRate) / 100;
    const g = Math.max(0, assetGrowthRate) / 100;
    const tRate = grantorPaysTaxes ? Math.max(0, grantorTaxRate) / 100 : 0;
    const eTaxRate = Math.max(0, estateTaxRate) / 100;

    // Amortizing payment formula if amortizing: P * [r / (1 - (1+r)^-n)]
    let annualAmortPayment = 0;
    if (noteType === "amortizing") {
      annualAmortPayment = (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    }

    let currentAssetValue = principal + seedGift;
    let currentNoteBalance = principal;
    const schedule: ScheduleYear[] = [];
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    let totalGrantorTaxBurn = 0;

    for (let yr = 1; yr <= n; yr++) {
      const startAsset = currentAssetValue;
      const startNote = currentNoteBalance;

      // Asset gross growth during the year
      const assetGrowth = startAsset * g;

      // Note payment calculation
      let interestPayment = startNote * r;
      let principalPayment = 0;

      if (noteType === "interest_only") {
        if (yr === n) {
          principalPayment = startNote; // Balloon payoff at maturity
        }
      } else {
        const totalPayment = Math.min(annualAmortPayment, startNote * (1 + r));
        interestPayment = startNote * r;
        principalPayment = Math.min(startNote, totalPayment - interestPayment);
      }

      // Grantor Tax Burn: under grantor trust rules, grantor pays income tax on the asset's growth/income
      // Trust does NOT pay tax, preserving 100% of growth inside the trust
      const grantorTax = grantorPaysTaxes ? assetGrowth * tRate : 0;

      // Trust cash outflow: Note payment (Interest + Principal)
      const totalTrustPayment = interestPayment + principalPayment;
      const endAsset = Math.max(0, startAsset + assetGrowth - totalTrustPayment);
      const endNote = Math.max(0, startNote - principalPayment);
      const trustNetEquity = Math.max(0, endAsset - endNote);

      schedule.push({
        year: yr,
        startAssetValue: Math.round(startAsset),
        assetGrowth: Math.round(assetGrowth),
        notePaymentInterest: Math.round(interestPayment),
        notePaymentPrincipal: Math.round(principalPayment),
        grantorTaxPaid: Math.round(grantorTax),
        endAssetValue: Math.round(endAsset),
        endNoteBalance: Math.round(endNote),
        trustEquity: Math.round(trustNetEquity)
      });

      totalInterestPaid += interestPayment;
      totalPrincipalPaid += principalPayment;
      totalGrantorTaxBurn += grantorTax;

      currentAssetValue = endAsset;
      currentNoteBalance = endNote;
    }

    const finalTrustEquity = schedule[schedule.length - 1]?.trustEquity || 0;

    // Estate Tax Comparison:
    // If the grantor had held the asset in their taxable estate instead of doing the IDGT:
    // Starting with (saleValue + seedGift), growing at (g * (1 - tRate)) assuming they paid taxes on growth:
    const netGrowthWithoutTrust = grantorPaysTaxes ? g * (1 - grantorTaxRate / 100) : g;
    const taxableEstateAssetFinal = (principal + seedGift) * Math.pow(1 + netGrowthWithoutTrust, n);
    // In the IDGT scenario, grantor estate holds: Note payments received + remaining note balance + taxes saved/spent
    // Wealth effectively transferred to beneficiaries outside grantor gross estate:
    const wealthTransferredOutsideEstate = finalTrustEquity;
    // Federal estate tax savings = 40% of wealth outside the estate
    const estimatedEstateTaxSaved = Math.round(wealthTransferredOutsideEstate * eTaxRate);

    return {
      principal: Math.round(principal),
      seedGift: Math.round(seedGift),
      totalTrustStartingValue: Math.round(principal + seedGift),
      totalInterestPaid: Math.round(totalInterestPaid),
      totalPrincipalPaid: Math.round(totalPrincipalPaid),
      totalGrantorTaxBurn: Math.round(totalGrantorTaxBurn),
      finalTrustEquity: Math.round(finalTrustEquity),
      estimatedEstateTaxSaved,
      schedule
    };
  }, [saleValue, seedGiftPercent, noteTermYears, afrRate, assetGrowthRate, noteType, grantorPaysTaxes, grantorTaxRate, estateTaxRate]);

  const handleCopy = async () => {
    const text = [
      `=== IDGT PROMISSORY NOTE INSTALLMENT SALE AUDIT ===`,
      `Asset Sale Value: $${results.principal.toLocaleString()}`,
      `Seed Gift (10% standard): $${results.seedGift.toLocaleString()}`,
      `Initial Trust Capital: $${results.totalTrustStartingValue.toLocaleString()}`,
      `Note Structure: ${noteType === "interest_only" ? "Interest-Only with Balloon" : "Fully Amortizing"}`,
      `Note Term: ${noteTermYears} Years | AFR Hurdle Rate: ${afrRate}%`,
      `Asset Growth Rate: ${assetGrowthRate}%/yr`,
      `Grantor Pays Income Taxes: ${grantorPaysTaxes ? `Yes (${grantorTaxRate}%)` : "No"}`,
      `-------------------------------------------`,
      `Final Trust Equity at Maturity: $${results.finalTrustEquity.toLocaleString()}`,
      `Total Note Interest Paid to Grantor: $${results.totalInterestPaid.toLocaleString()} (Income Tax-Free under Rev. Rul. 85-13)`,
      `Grantor Tax Burn (Wealth Absorbed): $${results.totalGrantorTaxBurn.toLocaleString()}`,
      `Estimated Federal Estate Tax Saved (${estateTaxRate}%): $${results.estimatedEstateTaxSaved.toLocaleString()}`,
      `===========================================`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            IRS Rev. Rul. 85-13 &amp; § 7872 Compliant
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            High-Net-Worth Wealth Transfer
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
          IDGT Promissory Note Installment Sale Calculator
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          Model the estate tax freeze of selling appreciating assets to an Intentionally Defective Grantor Trust (IDGT)
          in exchange for an AFR promissory note, including debt coverage seed gifts and income tax burn mechanics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Final Trust Equity (Maturity)
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
            ${results.finalTrustEquity.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Transferred free of gift/estate tax</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Est. Federal Estate Tax Saved
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-cyan-400">
            ${results.estimatedEstateTaxSaved.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">At {estateTaxRate}% federal statutory rate</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-purple-400" />
            Tax-Free Note Interest
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-400">
            ${results.totalInterestPaid.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Paid to grantor non-taxable (Rev. Rul. 85-13)</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-amber-400" />
            Grantor &quot;Tax Burn&quot;
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400">
            ${results.totalGrantorTaxBurn.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Indirect tax-free gift via grantor taxes</div>
        </div>
      </div>

      {/* Input Parameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Asset & Seed Gift */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Asset &amp; Seed Gift
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Asset Sale Value ($)
            </label>
            <input
              type="number"
              step="100000"
              min="50000"
              value={saleValue}
              onChange={(e) => setSaleValue(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs text-slate-500 mt-1 block">Principal of the installment note</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Seed Gift (% of Asset: {seedGiftPercent}%)
            </label>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={seedGiftPercent}
              onChange={(e) => setSeedGiftPercent(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>5% (Thin)</span>
              <span className="text-emerald-400 font-mono">${(saleValue * (seedGiftPercent / 100)).toLocaleString()}</span>
              <span>25% (Conservative)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              A 10:1 debt-to-equity ratio protects against IRS § 2036 recharacterization.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Expected Asset Growth Rate (%/year)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={assetGrowthRate}
                onChange={(e) => setAssetGrowthRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-sm font-semibold text-slate-400">%</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Blended capital appreciation + dividend yield</span>
          </div>
        </div>

        {/* Center Column: Promissory Note Structure */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Promissory Note Structure
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Repayment Structure
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNoteType("interest_only")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  noteType === "interest_only"
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                Interest-Only (Balloon)
              </button>
              <button
                type="button"
                onClick={() => setNoteType("amortizing")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  noteType === "amortizing"
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                Fully Amortizing
              </button>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              {noteType === "interest_only" ? "Maximizes trust compounding by deferring principal repayment to year end." : "Reduces grantor note asset gradually over the note term."}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Note Term ({noteTermYears} Years)
            </label>
            <input
              type="range"
              min="3"
              max="20"
              step="1"
              value={noteTermYears}
              onChange={(e) => setNoteTermYears(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>3 yrs (Short)</span>
              <span className="text-cyan-400 font-semibold">{noteTermYears} Years</span>
              <span>20 yrs (Long)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Applicable Federal Rate (AFR %/year)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="15"
                value={afrRate}
                onChange={(e) => setAfrRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-sm font-semibold text-slate-400">%</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">IRS statutory hurdle rate (IRC § 1274(d))</span>
          </div>
        </div>

        {/* Right Column: Tax Arbitrage Settings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Calculator className="w-4 h-4 text-purple-400" />
            Tax Arbitrage Settings
          </h2>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">Grantor Pays Income Tax</div>
              <div className="text-[11px] text-slate-400">Rev. Rul. 85-13 &quot;tax burn&quot; engine</div>
            </div>
            <button
              type="button"
              onClick={() => setGrantorPaysTaxes(!grantorPaysTaxes)}
              className={`w-12 h-6 flex items-center rounded-full p-1 duration-200 transition-colors ${
                grantorPaysTaxes ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
                  grantorPaysTaxes ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {grantorPaysTaxes && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Grantor Effective Tax Rate (% on Growth/Income)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="60"
                  value={grantorTaxRate}
                  onChange={(e) => setGrantorTaxRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-400">%</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Combines Fed + State effective bracket</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Federal Estate &amp; Gift Tax Rate (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                min="0"
                max="50"
                value={estateTaxRate}
                onChange={(e) => setEstateTaxRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-sm font-semibold text-slate-400">%</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Statutory federal estate tax rate (currently 40%)</span>
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-sm font-semibold transition-all shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Audit Copied to Clipboard" : "Copy Installment Sale Audit"}
          </button>
        </div>
      </div>

      {/* Year-by-Year Schedule Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              Annual Amortization &amp; Trust Equity Schedule
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Year-by-year cash flow, promissory note debt service, and net equity growth inside the irrevocable trust.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Start Asset Val</th>
                <th className="py-2.5 px-3">Growth ({assetGrowthRate}%)</th>
                <th className="py-2.5 px-3">Note Interest</th>
                <th className="py-2.5 px-3">Note Principal</th>
                <th className="py-2.5 px-3">End Note Bal</th>
                <th className="py-2.5 px-3 text-emerald-400">Trust Net Equity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {results.schedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">Yr {row.year}</td>
                  <td className="py-2.5 px-3">${row.startAssetValue.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-emerald-300">+${row.assetGrowth.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-purple-300">-${row.notePaymentInterest.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-blue-300">-${row.notePaymentPrincipal.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-400">${row.endNoteBalance.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-400">${row.trustEquity.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Dive Educational Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-sm">
            <Info className="w-4 h-4 text-emerald-400" />
            Revenue Ruling 85-13 &amp; Income Tax Disconnect
          </div>
          <p>
            An Intentionally Defective Grantor Trust is designed so that the grantor is treated as the owner of the trust
            for income tax purposes (under IRC §§ 671-679), but the assets are excluded from the grantor&apos;s gross estate
            for federal estate and gift tax purposes (under IRC §§ 2036-2038).
          </p>
          <p>
            Under <strong>Rev. Rul. 85-13</strong>, transactions between a grantor and their grantor trust are disregarded
            for income tax purposes. The sale of appreciated assets incurs <em>zero capital gains tax</em>, and interest paid
            on the promissory note is <em>not taxable income</em> to the grantor.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            The 10% Seed Gift &amp; Note Refinancing
          </div>
          <p>
            To establish economic substance and prevent the IRS from arguing under <strong>IRC § 2036</strong> that the note
            is a retained life interest or that the trust is a sham, attorneys recommend seeding the trust with independent
            capital equal to at least <strong>10%</strong> of the note value prior to the sale.
          </p>
          <p>
            If the asset generates cash flow or appreciates substantially above the Applicable Federal Rate (AFR),
            the entire excess spread compounds inside the dynasty trust completely exempt from generation-skipping transfer (GST)
            and estate taxes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default IdgtPromissoryNoteCalculator;
