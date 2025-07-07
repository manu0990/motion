"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { ProfileDropdown } from "@/components/profile-dropdown";

export function SidebarToggle() {
  const { open } = useSidebar();
  if (open) return null;
  return <SidebarTrigger />;
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {


  return (
    <SidebarProvider>
      <div className="flex min-h-screen transition ease-in-out overflow-x-hidden">
        <AppSidebar />
        <main className="flex-grow">
          <div className="border-b px-6 py-2 sticky top-0 right-0  h-14 flex items-center justify-between ">
            <span className="flex items-center gap-4">
              <SidebarToggle />
              <Link href="/chat" className="text-xl font-medium hover:bg-muted px-2 py-1 rounded-md "><h1>∑otion</h1></Link>
            </span>
            <ProfileDropdown />
          </div>
          <Toaster richColors closeButton position="top-center" />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}