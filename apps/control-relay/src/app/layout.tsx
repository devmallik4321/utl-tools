import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UTL Control Relay POC",
  description: "Isolated Control Relay Communication POC Endpoint",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        {children}
      </body>
    </html>
  );
}
