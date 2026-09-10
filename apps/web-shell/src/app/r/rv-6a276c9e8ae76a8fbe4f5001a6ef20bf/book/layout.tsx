import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UNLISTED REVIEW PACKAGE | BOOK-0001: The Zero-Employee Agency",
  description: "Confidential, unlisted pre-publication review package for BOOK-0001. Indexing prohibited.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
