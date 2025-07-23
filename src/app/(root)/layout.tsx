"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { UsageStatsProvider } from "@/context/UsageStatsProvider";
import Link from "next/link";
import { ProfileDropdown } from "@/components/profile-dropdown";
import Image from "next/image";

export function SidebarToggle() {
  const { open } = useSidebar();
  if (open) return null;
  return <SidebarTrigger />;
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {


  return (
    <SidebarProvider>
      <UsageStatsProvider>
        <div className="flex min-h-screen transition ease-in-out overflow-x-hidden">
          <AppSidebar />
          <main className="flex-grow">
            <div className="border-b px-2 md:px-6 py-2 sticky top-0 right-0  h-14 flex items-center justify-between ">
              <span className="flex items-center md:gap-4">
                <span className="hidden md:block"><SidebarToggle /></span>
                <SidebarTrigger className="md:hidden" />
                <Link href="/chat" className="text-xl font-medium hover:bg-muted px-2 py-1 rounded-md ">
                  <Image src='/motion-logo.svg' width={50} height={50} alt="Motion-logo" className="md:hidden h-6 w-6 text-primary dark:invert-0 invert" />
                  <span className="hidden md:block text-xl font-bold">∑otion</span>
                </Link>
              </span>
              <ProfileDropdown />
            </div>
            <Toaster richColors closeButton position="top-center" />
            {children}
          </main>
        </div>
      </UsageStatsProvider>
    </SidebarProvider>
  );
}