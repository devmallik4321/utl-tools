import Link from "next/link";
import { getAllCategories } from "@/lib/registry";
import { ShieldCheck, Zap, Sparkles } from "lucide-react";

export function Footer() {
  const categories = getAllCategories();

  return (
    <footer className="border-t border-border bg-card/60 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Core Value Props Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-border text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Zero Friction & Instant</h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Tools run directly in your browser with sub-second execution. No subscriptions or accounts required.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">100% Client-Side Privacy</h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Your passwords, invoices, JSON payloads, and inputs never leave your device. Zero remote tracking.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Evergreen & Reliable</h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Built on resilient Web Standards and modern architecture engineered to run cleanly for years.
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid Links */}
        <div className="py-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-xs">
          <div>
            <span className="font-semibold text-foreground tracking-wider uppercase text-[11px] block mb-3">
              Categories
            </span>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-semibold text-foreground tracking-wider uppercase text-[11px] block mb-3">
              More Categories
            </span>
            <ul className="space-y-2">
              {categories.slice(5).map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-semibold text-foreground tracking-wider uppercase text-[11px] block mb-3">
              Popular Tools
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/tools/json-formatter" className="hover:text-foreground">JSON Formatter</Link></li>
              <li><Link href="/tools/password-generator" className="hover:text-foreground">Password Generator</Link></li>
              <li><Link href="/tools/qr-code-generator" className="hover:text-foreground">QR Code Generator</Link></li>
              <li><Link href="/tools/my-ip" className="hover:text-foreground">What is My IP</Link></li>
              <li><Link href="/tools/percentage-calculator" className="hover:text-foreground">Percentage Calculator</Link></li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-foreground tracking-wider uppercase text-[11px] block mb-3">
              Productivity
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/tools/invoice-generator" className="hover:text-foreground">Invoice Generator</Link></li>
              <li><Link href="/tools/email-signature-generator" className="hover:text-foreground">Email Signature</Link></li>
              <li><Link href="/tools/uuid-generator" className="hover:text-foreground">UUID Generator</Link></li>
              <li><Link href="/tools/base64-encoder" className="hover:text-foreground">Base64 Encoder</Link></li>
              <li><Link href="/saved" className="hover:text-foreground">My Saved Utilities</Link></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="font-semibold text-foreground tracking-wider uppercase text-[11px] block mb-3">
              Platform
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <span className="text-muted-foreground">Version 1.1 (Production)</span>
              </li>
              <li>
                <Link href="/widgets" className="hover:text-foreground">Windows &amp; Web Widgets</Link>
              </li>
              <li>
                <span className="text-muted-foreground">47 Static Utilities</span>
              </li>
              <li>
                <span className="text-muted-foreground">MIT License</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">UTL.tools</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved. Free Online Utilities.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/saved" className="hover:text-foreground">My Saved Tools</Link>
            <span>•</span>
            <span>Google simplicity + modern utility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
