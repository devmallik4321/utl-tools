import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Recognized utility vertical subdomains
const VERTICAL_SUBDOMAINS = new Set([
  "finance",
  "developer",
  "ai",
  "hardware",
  "marketing",
  "productivity",
  "health",
  "design",
  "business",
  "everyday",
]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Enforce apex domain canonicalization (www.utl.tools -> https://utl.tools)
  const cleanHost = host.split(":")[0].toLowerCase();
  if (cleanHost === "www.utl.tools") {
    const url = new URL(request.url);
    url.hostname = "utl.tools";
    url.port = "";
    url.protocol = "https:";
    return NextResponse.redirect(url, { status: 308 });
  }

  // Skip static assets, Next.js internal files, favicon, robots, sitemap
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Extract subdomain from hostname (e.g. "finance" from "finance.utl.tools" or "finance.localhost:3000")
  const hostnameParts = host.split(":");
  const domainParts = hostnameParts[0].split(".");

  let subdomain: string | null = null;
  if (domainParts.length >= 3) {
    const candidate = domainParts[0].toLowerCase();
    if (VERTICAL_SUBDOMAINS.has(candidate)) {
      subdomain = candidate;
    }
  }

  // If a valid vertical subdomain is detected and user visits root "/", rewrite to that vertical category hub
  if (subdomain && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/category/${subdomain}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-utl-vertical", subdomain);
    return response;
  }

  const response = NextResponse.next();
  if (subdomain) {
    response.headers.set("x-utl-vertical", subdomain);
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
