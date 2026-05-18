import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bewerbungs-Tracker",
  description: "Verwalte deine Bewerbungen übersichtlich",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>{children}</body>
    </html>
  );
}
