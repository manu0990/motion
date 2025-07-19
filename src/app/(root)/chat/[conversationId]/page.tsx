"use client";

import { ChatInterface } from "@/components/chat/chat-interface";
import { useSidebar } from "@/components/ui/sidebar";

export default function Chat() {
  const { open } = useSidebar();

  return (
    <div className={`overflow-y-auto h-[calc(100vh-3.5rem)] ${open ? "md:w-[calc(100vw-var(--sidebar-width,250px))]" : "w-screen"} transition ease-in-out`}>
      <div className="h-full w-full lg:max-w-4xl mx-auto">
        <ChatInterface />
      </div>
    </div>
  )
};