import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "try-error Documentation",
  description:
    "Lightweight, progressive, type-safe error handling for TypeScript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1">
            <div className="flex h-14 items-center border-b px-4 lg:px-6">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="text-lg font-semibold">
                  try-error Documentation
                </h1>
              </div>
            </div>
            <div className="flex-1 space-y-4 p-4 lg:p-6">{children}</div>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
