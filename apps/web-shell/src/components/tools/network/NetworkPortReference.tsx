"use client";

import { useState, useMemo } from "react";
import { Network, Search, ShieldCheck, ShieldAlert, Copy, Check, Filter } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface PortEntry {
  port: number;
  protocol: "TCP" | "UDP" | "TCP/UDP";
  service: string;
  category: "Web" | "Database" | "Remote" | "Email" | "Core Network" | "DevOps";
  description: string;
  securityNote: string;
  isPublicSafe: boolean;
}

const PORTS: PortEntry[] = [
  { port: 20, protocol: "TCP", service: "FTP Data", category: "Core Network", description: "File Transfer Protocol (Data Transfer)", securityNote: "Legacy unencrypted protocol. Use SFTP (port 22) instead.", isPublicSafe: false },
  { port: 21, protocol: "TCP", service: "FTP Control", category: "Core Network", description: "File Transfer Protocol (Command Control)", securityNote: "Cleartext credentials. Replace with SFTP.", isPublicSafe: false },
  { port: 22, protocol: "TCP", service: "SSH / SFTP", category: "Remote", description: "Secure Shell for encrypted remote server access and file transfers", securityNote: "Disable password auth; enforce SSH key pairs and fail2ban.", isPublicSafe: true },
  { port: 25, protocol: "TCP", service: "SMTP", category: "Email", description: "Simple Mail Transfer Protocol for inter-server mail relay", securityNote: "Often blocked by residential ISPs to prevent spam botnets.", isPublicSafe: false },
  { port: 53, protocol: "TCP/UDP", service: "DNS", category: "Core Network", description: "Domain Name System resolution queries", securityNote: "UDP for fast queries (<512B); TCP for zone transfers.", isPublicSafe: true },
  { port: 80, protocol: "TCP", service: "HTTP", category: "Web", description: "Hypertext Transfer Protocol for unencrypted web traffic", securityNote: "Redirect all port 80 traffic to HTTPS (port 443).", isPublicSafe: true },
  { port: 110, protocol: "TCP", service: "POP3", category: "Email", description: "Post Office Protocol v3 for mail retrieval", securityNote: "Cleartext. Use POP3S (port 995) instead.", isPublicSafe: false },
  { port: 123, protocol: "UDP", service: "NTP", category: "Core Network", description: "Network Time Protocol for clock synchronization", securityNote: "Protect against UDP amplification DDoS attacks.", isPublicSafe: true },
  { port: 143, protocol: "TCP", service: "IMAP", category: "Email", description: "Internet Message Access Protocol for email sync", securityNote: "Cleartext. Use IMAPS (port 993) instead.", isPublicSafe: false },
  { port: 443, protocol: "TCP", service: "HTTPS / TLS", category: "Web", description: "HTTP Secure over TLS/SSL encryption for web applications", securityNote: "Standard secure web port with modern TLS 1.2/1.3 ciphers.", isPublicSafe: true },
  { port: 465, protocol: "TCP", service: "SMTPS", category: "Email", description: "SMTP over Implicit TLS encryption", securityNote: "Secure mail submission standard.", isPublicSafe: true },
  { port: 587, protocol: "TCP", service: "SMTP Submission", category: "Email", description: "Mail submission using explicit STARTTLS", securityNote: "Modern standard for client-to-server mail sending.", isPublicSafe: true },
  { port: 993, protocol: "TCP", service: "IMAPS", category: "Email", description: "IMAP over TLS encryption", securityNote: "Standard secure email client synchronization.", isPublicSafe: true },
  { port: 995, protocol: "TCP", service: "POP3S", category: "Email", description: "POP3 over TLS encryption", securityNote: "Secure legacy mail retrieval.", isPublicSafe: true },
  { port: 1433, protocol: "TCP", service: "MS SQL Server", category: "Database", description: "Microsoft SQL Server database listener", securityNote: "NEVER expose directly to internet. Keep behind VPC / VPN.", isPublicSafe: false },
  { port: 1521, protocol: "TCP", service: "Oracle DB", category: "Database", description: "Oracle database default listener", securityNote: "Keep strictly on private subnets.", isPublicSafe: false },
  { port: 3000, protocol: "TCP", service: "Node.js / React / Grafana", category: "DevOps", description: "Default dev server and Grafana monitoring port", securityNote: "Protect with reverse proxy (nginx/caddy) in production.", isPublicSafe: false },
  { port: 3306, protocol: "TCP", service: "MySQL / MariaDB", category: "Database", description: "Standard MySQL relational database port", securityNote: "NEVER expose to 0.0.0.0. Bind to 127.0.0.1 or private VPC.", isPublicSafe: false },
  { port: 3389, protocol: "TCP/UDP", service: "RDP", category: "Remote", description: "Remote Desktop Protocol for Windows remote administration", securityNote: "Frequent brute-force target. Access only via VPN or Tailscale.", isPublicSafe: false },
  { port: 5432, protocol: "TCP", service: "PostgreSQL", category: "Database", description: "PostgreSQL relational database listener", securityNote: "Keep behind private VPC; require SSL connections.", isPublicSafe: false },
  { port: 6379, protocol: "TCP", service: "Redis", category: "Database", description: "Redis in-memory key-value cache and queue", securityNote: "NO default auth in early versions. Vulnerable if exposed.", isPublicSafe: false },
  { port: 8080, protocol: "TCP", service: "HTTP-Alt / Tomcat", category: "Web", description: "Alternative web proxy, Spring Boot, or Tomcat port", securityNote: "Ensure authentication is required if exposed.", isPublicSafe: true },
  { port: 8443, protocol: "TCP", service: "HTTPS-Alt", category: "Web", description: "Secondary HTTPS listener or admin dashboard port", securityNote: "Ensure valid SSL certificate is mounted.", isPublicSafe: true },
  { port: 27017, protocol: "TCP", service: "MongoDB", category: "Database", description: "MongoDB NoSQL document database listener", securityNote: "Always enable auth; bind only to localhost or internal network.", isPublicSafe: false },
];

export function NetworkPortReference() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedPort, setCopiedPort] = useState<number | null>(null);

  const filteredPorts = useMemo(() => {
    return PORTS.filter((p) => {
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.port.toString().includes(q) ||
        p.service.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = async (port: PortEntry) => {
    const summary = `Port ${port.port}/${port.protocol} (${port.service}): ${port.description} — Security: ${port.securityNote}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopiedPort(port.port);
      setTimeout(() => setCopiedPort(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search port number (e.g. 443, 5432, SSH)..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["All", "Web", "Database", "Remote", "Email", "Core Network", "DevOps"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Port Table / Cards */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Network className="w-4 h-4 text-blue-500" />
            Network Port Reference ({filteredPorts.length} Ports Listed)
          </h4>
          <span className="text-xs text-muted-foreground">Click any card to copy port details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredPorts.map((p) => (
            <div
              key={p.port}
              onClick={() => handleCopy(p)}
              className="p-4 bg-card rounded-xl border border-border hover:border-blue-500 transition-all cursor-pointer space-y-2 group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-extrabold text-sm rounded">
                    Port {p.port}
                  </span>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{p.protocol}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {p.category}
                  </span>
                  <button className="text-muted-foreground group-hover:text-blue-600 transition-colors">
                    {copiedPort === p.port ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-foreground">{p.service}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
              </div>

              <div className="pt-2 border-t border-border/60 text-[11px] flex items-start gap-1.5 text-muted-foreground">
                {p.isPublicSafe ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <span>{p.securityNote}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
