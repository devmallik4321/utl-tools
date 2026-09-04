'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, AlertTriangle, CheckCircle2, Copy, Check, FileText, DollarSign, ShieldAlert, Info } from 'lucide-react';

export function Section83bElectionDeadlineCalculator() {
  // Input State
  const [grantDate, setGrantDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [sharesGranted, setSharesGranted] = useState<number>(100000);
  const [purchasePrice, setPurchasePrice] = useState<number>(0.001); // $0.001 par value
  const [grantFmv, setGrantFmv] = useState<number>(0.001); // FMV at grant
  const [projectedExitFmv, setProjectedExitFmv] = useState<number>(5.00); // $5.00 exit FMV
  const [vestingYears, setVestingYears] = useState<number>(4);
  const [ordinaryTaxRate, setOrdinaryTaxRate] = useState<number>(37); // 37% top fed + state
  const [capitalGainsRate, setCapitalGainsRate] = useState<number>(20); // 20% long-term cap gains

  // Section 83(b) letter fields
  const [taxpayerName, setTaxpayerName] = useState<string>('Alex Founder');
  const [taxpayerSsn, setTaxpayerSsn] = useState<string>('XXX-XX-1234');
  const [taxpayerAddress, setTaxpayerAddress] = useState<string>('123 Innovation Way, San Francisco, CA 94107');
  const [companyName, setCompanyName] = useState<string>('Acme Technologies Inc.');
  const [companyEin, setCompanyEin] = useState<string>('12-3456789');

  const [copiedLetter, setCopiedLetter] = useState(false);

  // Calculations
  const calcData = useMemo(() => {
    const grant = new Date(grantDate);
    const deadline = new Date(grant);
    deadline.setDate(deadline.getDate() + 30);

    const now = new Date();
    const msRemaining = deadline.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
    const isPastDeadline = daysRemaining < 0;

    // Financial Analysis
    const totalPurchaseCost = sharesGranted * purchasePrice;
    const totalGrantValue = sharesGranted * grantFmv;
    const spreadAtGrant = Math.max(0, totalGrantValue - totalPurchaseCost);

    // With 83(b):
    const taxAtGrantWith83b = spreadAtGrant * (ordinaryTaxRate / 100);
    const totalExitValue = sharesGranted * projectedExitFmv;
    const capGainWith83b = Math.max(0, totalExitValue - Math.max(totalPurchaseCost, totalGrantValue));
    const taxAtExitWith83b = capGainWith83b * (capitalGainsRate / 100);
    const totalTaxWith83b = taxAtGrantWith83b + taxAtExitWith83b;

    // Without 83(b):
    const avgVestingFmv = (grantFmv + projectedExitFmv) / 2;
    const avgSpreadAtVesting = Math.max(0, sharesGranted * avgVestingFmv - totalPurchaseCost);
    const ordinaryTaxWithout83b = avgSpreadAtVesting * (ordinaryTaxRate / 100);

    const capGainWithout83b = Math.max(0, totalExitValue - (sharesGranted * avgVestingFmv));
    const taxAtExitWithout83b = capGainWithout83b * (capitalGainsRate / 100);
    const totalTaxWithout83b = ordinaryTaxWithout83b + taxAtExitWithout83b;

    const estimatedSavings = Math.max(0, totalTaxWithout83b - totalTaxWith83b);

    return {
      deadlineDate: deadline.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      daysRemaining,
      isPastDeadline,
      totalPurchaseCost,
      totalGrantValue,
      spreadAtGrant,
      taxAtGrantWith83b,
      taxAtExitWith83b,
      totalTaxWith83b,
      ordinaryTaxWithout83b,
      taxAtExitWithout83b,
      totalTaxWithout83b,
      totalExitValue,
      estimatedSavings
    };
  }, [grantDate, sharesGranted, purchasePrice, grantFmv, projectedExitFmv, vestingYears, ordinaryTaxRate, capitalGainsRate]);

  // Generate Letter Text
  const electionLetterText = useMemo(() => {
    const taxYear = grantDate.split('-')[0] || new Date().getFullYear().toString();
    const formattedGrant = new Date(grantDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const totalPaid = (sharesGranted * purchasePrice).toFixed(2);
    const totalFmv = (sharesGranted * grantFmv).toFixed(2);

    return `SECTION 83(b) ELECTION NOTICE

Internal Revenue Service Center
[Mail to the IRS Service Center where you file your federal income tax return]

VIA USPS CERTIFIED MAIL — RETURN RECEIPT REQUESTED

Re: Election Under Section 83(b) of the Internal Revenue Code of 1986, as amended

The undersigned taxpayer hereby elects, pursuant to Section 83(b) of the Internal Revenue Code of 1986, as amended, to include in taxpayer's gross income for the taxable year ${taxYear} the excess (if any) of the fair market value of the property described below over the amount paid for such property.

1. Taxpayer Information:
   Name: ${taxpayerName}
   Social Security Number / ITIN: ${taxpayerSsn}
   Address: ${taxpayerAddress}

2. Property Description:
   ${sharesGranted.toLocaleString()} shares of Common Stock of ${companyName} (Employer Identification Number: ${companyEin}).

3. Transfer Date:
   The date on which the property was transferred to the taxpayer: ${formattedGrant}.
   The taxable year for which this election is made: calendar year ${taxYear}.

4. Restrictions:
   The shares are subject to a repurchase option / vesting schedule over ${vestingYears} years held by ${companyName}, pursuant to which the company may repurchase unvested shares upon termination of service.

5. Fair Market Value:
   The fair market value of the property at the time of transfer (without regard to any lapse restriction): $${totalFmv} ($${grantFmv} per share).

6. Amount Paid:
   The amount paid for the property: $${totalPaid} ($${purchasePrice} per share).

7. Amount to Include in Gross Income:
   The excess of fair market value over the amount paid is: $${(calcData.spreadAtGrant).toFixed(2)}.

8. Copy Provided to Employer:
   A copy of this election statement has been submitted to ${companyName}, for whom the taxpayer performs services.

Date: ________________________

_____________________________________________
${taxpayerName} (Taxpayer Signature)

-------------------------------------------------------------
INSTRUCTIONS FOR FILING:
1. Sign and date this election letter in duplicate.
2. Mail one signed copy via USPS CERTIFIED MAIL with RETURN RECEIPT REQUESTED to your IRS Service Center within exactly 30 DAYS of the grant date.
3. Keep the certified mail receipt, tracking number, and stamped USPS Form 3800 for your permanent tax records.
4. Deliver one signed copy to your employer (${companyName}) for their corporate payroll files.
5. Retain a copy to file with your annual Form 1040 federal tax return.`;
  }, [taxpayerName, taxpayerSsn, taxpayerAddress, companyName, companyEin, sharesGranted, purchasePrice, grantFmv, vestingYears, grantDate, calcData.spreadAtGrant]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(electionLetterText);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">IRS Section 83(b) Election Deadline & Tax Calculator</h1>
            <p className="text-sm text-slate-400">
              Calculate the strict 30-day postmark deadline, estimate lifetime ordinary vs capital gains tax savings, and generate an IRS-compliant 83(b) election letter.
            </p>
          </div>
        </div>

        {/* Deadline Warning Banner */}
        <div className={`mt-4 p-4 rounded-xl border flex items-start space-x-3 ${
          calcData.isPastDeadline
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : calcData.daysRemaining <= 7
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold">Filing Deadline: {calcData.deadlineDate}</span>
            <p className="mt-1 opacity-90">
              {calcData.isPastDeadline
                ? `DEADLINE PASSED: The 30-day window expired ${Math.abs(calcData.daysRemaining)} days ago. The IRS does not grant extensions for late 83(b) elections under any circumstances.`
                : `${calcData.daysRemaining} days remaining to file. The election letter must be postmarked by USPS Certified Mail on or before this date.`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Equity Grant & Valuation</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Stock Grant / Transfer Date</label>
            <input
              type="date"
              value={grantDate}
              onChange={(e) => setGrantDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Number of Shares</label>
              <input
                type="number"
                min="1"
                value={sharesGranted}
                onChange={(e) => setSharesGranted(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Vesting Period (Years)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={vestingYears}
                onChange={(e) => setVestingYears(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Purchase Price ($/share)</label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Grant FMV ($/share)</label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={grantFmv}
                onChange={(e) => setGrantFmv(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Projected Exit FMV ($/share)</label>
            <input
              type="number"
              step="0.10"
              min="0"
              value={projectedExitFmv}
              onChange={(e) => setProjectedExitFmv(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Ordinary Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={ordinaryTaxRate}
                onChange={(e) => setOrdinaryTaxRate(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cap Gains Rate (%)</label>
              <input
                type="number"
                min="0"
                max="40"
                value={capitalGainsRate}
                onChange={(e) => setCapitalGainsRate(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Letter Info Inputs */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">Taxpayer & Company Details</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Taxpayer Full Name"
                value={taxpayerName}
                onChange={(e) => setTaxpayerName(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <input
                placeholder="SSN or ITIN"
                value={taxpayerSsn}
                onChange={(e) => setTaxpayerSsn(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <input
              placeholder="Taxpayer Home Address"
              value={taxpayerAddress}
              onChange={(e) => setTaxpayerAddress(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <input
                placeholder="Company EIN"
                value={companyEin}
                onChange={(e) => setCompanyEin(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Results & Comparison */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tax Savings Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">Tax Comparison: 83(b) vs. Standard Vesting</h2>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                Estimated Tax Savings: ${calcData.estimatedSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* With 83(b) */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-emerald-300 font-semibold text-sm">
                  <span>With 83(b) Election</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Upfront Tax at Grant:</span>
                    <span className="font-mono text-emerald-400 font-semibold">${calcData.taxAtGrantWith83b.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tax during Vesting:</span>
                    <span className="font-mono">$0.00 (Frozen)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exit Tax (Cap Gains):</span>
                    <span className="font-mono">${calcData.taxAtExitWith83b.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t border-emerald-500/20 pt-1.5 flex justify-between font-bold text-sm text-emerald-200">
                    <span>Total Tax:</span>
                    <span className="font-mono">${calcData.totalTaxWith83b.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>

              {/* Without 83(b) */}
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-rose-300 font-semibold text-sm">
                  <span>Without 83(b) Election</span>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Upfront Tax at Grant:</span>
                    <span className="font-mono">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ordinary Tax as Shares Vest:</span>
                    <span className="font-mono text-rose-400 font-semibold">${calcData.ordinaryTaxWithout83b.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exit Tax (Cap Gains):</span>
                    <span className="font-mono">${calcData.taxAtExitWithout83b.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t border-rose-500/20 pt-1.5 flex justify-between font-bold text-sm text-rose-200">
                    <span>Total Tax:</span>
                    <span className="font-mono">${calcData.totalTaxWithout83b.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex items-start space-x-2">
              <Info className="w-4 h-4 flex-shrink-0 text-slate-300 mt-0.5" />
              <span>
                By filing Section 83(b), you elect to pay ordinary income tax immediately on the difference between the grant fair market value and purchase price (often $0 for founders buying at par value). All subsequent appreciation qualifies for long-term capital gains upon holding for &gt; 1 year.
              </span>
            </div>
          </div>

          {/* Generated Letter Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-200">IRS Election Form & USPS Instructions</h3>
              </div>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                {copiedLetter ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLetter ? 'Copied to Clipboard' : 'Copy Election Notice'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-72 leading-relaxed">
              {electionLetterText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section83bElectionDeadlineCalculator;
