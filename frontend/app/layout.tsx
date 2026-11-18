import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Truth Layer | AI & Blockchain Information Trust System",
  description: "Multi-Modal AI Forensics and Ethereum Smart Contract Verification Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-obsidian-900 text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))]" />
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
