import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import {ThemeProvider} from "@/components/theme-provider";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "HAProxy configuration manager"
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
    <body>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <main>
          <SidebarTrigger/>
          {children}
        </main>
      </SidebarProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}
