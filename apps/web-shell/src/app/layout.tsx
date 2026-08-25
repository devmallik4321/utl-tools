import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | UTL.tools",
    default: "UTL.tools — Free Online Utilities | The Digital Toolbox",
  },
  description:
    "A comprehensive library of simple, fast, evergreen online utilities. Developers, business calculators, network diagnostics, and daily tools that solve everyday problems with zero bloat.",
  keywords: [
    "online utilities",
    "free developer tools",
    "calculators",
    "formatters",
    "generators",
    "converters",
    "network tools",
    "UTL tools",
  ],
  authors: [{ name: "UTL.tools" }],
  creator: "UTL.tools",
  metadataBase: new URL("https://utl.tools"),
  openGraph: {
    title: "UTL.tools — Free Online Utilities & Digital Toolbox",
    description: "Simple, fast, evergreen utilities that solve everyday problems with 100% client-side privacy.",
    url: "https://utl.tools",
    siteName: "UTL.tools",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UTL.tools — Free Online Utilities",
    description: "Fast, simple, useful online tools that work instantly in your browser.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="flex flex-col min-h-screen">
        <GoogleAnalytics />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
