"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function SidebarToggle() {
  const { open } = useSidebar();
  if (open) return null;
  return <SidebarTrigger />;
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = useSession();
  const user = session.data?.user;
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
            <Link href="#">
              <Image
                src={user?.image || "/default-user.svg"}
                alt="user-profile"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            </Link>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}