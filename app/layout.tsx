import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metrics Dashboard",
  description: "Unified metrics dashboard for all projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
