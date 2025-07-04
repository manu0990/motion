"use client";

import { NewChatWelcome } from "@/components/chat/new-chat-welcome";
import { useSidebar } from "@/components/ui/sidebar";

export default function Chat() {
  const { open } = useSidebar();

  return (
    <div className={`overflow-y-auto h-[calc(100vh-3.5rem)] ${open ? "w-[calc(100vw-var(--sidebar-width,250px))]" : "w-screen"} transition ease-in-out`}>
      <div className="h-full w-1/2 mx-auto">
        <NewChatWelcome />
      </div>
    </div>
  )
};