import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adless — Watch Without Interruptions",
  description: "AI-native creator video platform enabling non-intrusive in-scene product placements.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 min-h-screen flex flex-col selection:bg-adless-cyan selection:text-black">
        {children}
      </body>
    </html>
  );
}
