"use client"

import { Command, Search, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"

type ConversationType = {
  id: string;
  title: string;
}

interface SearchDialogProps {
  conversations: ConversationType[];
}

export function SearchDialog({ conversations }: SearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter(conversation =>
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredConversations.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredConversations[selectedIndex]) {
      window.location.href = `/chat/${filteredConversations[selectedIndex].id}`;
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <SidebarMenuButton className="justify-between">
          <div className="flex items-center gap-1.5 text-sm -ml-0.5">
            <Search className="h-5 w-5"/>
            <span>Search chats</span>
          </div>
          <span className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <Command className="h-3 w-3 mr-0.5"/>
            <span className="text-sm h-full">{"+ k"}</span>
          </span>
        </SidebarMenuButton>
      </SheetTrigger>
      <SheetContent side="top" className="h-[70vh] max-h-[500px] mx-auto max-w-96 md:max-w-2xl mt-20 rounded-lg border shadow-lg">
        <SheetHeader className="sr-only">
          <SheetTitle>Search chats</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 pt-5">
          <div className="relative">
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-12 text-base border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
              >
                <X id="xxx" className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-[350px] overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation, index) => (
                <Link
                  key={conversation.id}
                  href={`/chat/${conversation.id}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors group ${
                    index === selectedIndex ? "bg-accent" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {conversation.title || "New Chat"}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">
                  {searchQuery ? "No chats found" : "No chats available"}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
