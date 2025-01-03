import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import {ThemeProvider} from "@/components/theme-provider";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import {Inter} from "next/font/google";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "HAProxy configuration manager"
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
    <body className={inter.className}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar/>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}
