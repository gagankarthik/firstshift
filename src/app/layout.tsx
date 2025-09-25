import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FirstShift - Modern Employee Schedule Management System",
  description: "Transform your team scheduling with FirstShift's drag-and-drop interface, employee availability management, time-off approvals, and real-time updates. Free to start with powerful features for modern businesses.",
  keywords: "employee scheduling, workforce management, shift planning, staff schedule, time off management, employee availability, schedule software, business scheduling",
  authors: [{ name: "FirstShift Team" }],
  creator: "FirstShift",
  publisher: "FirstShift",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "FirstShift - Modern Employee Schedule Management",
    description: "Transform your team scheduling with drag-and-drop interface, real-time updates, and powerful workforce management features.",
    siteName: "FirstShift",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
         <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
