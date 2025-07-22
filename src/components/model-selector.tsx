"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Lightbulb, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

export type ModelType = "fast" | "think";
export interface ModelConfig {
  id: ModelType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const models: ModelConfig[] = [
  { id: "fast", name: "Fast response", icon: Zap },
  { id: "think", name: "Think longer", icon: Lightbulb },
];

interface MinimalModelSelectorProps {
  defaultModel?: ModelType;
  onModelChange?: (model: ModelType) => void;
  className?: string;
}

export default function MinimalModelSelector({
  defaultModel = "fast",
  onModelChange,
  className,
}: MinimalModelSelectorProps) {
  const [selected, setSelected] = useState<ModelType>(defaultModel);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("selectedModel") as ModelType;
    if (saved && models.find(m => m.id === saved)) {
      setSelected(saved);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("selectedModel", selected);
      const cfg = models.find(m => m.id === selected);
      if (cfg) onModelChange?.(cfg.id);
    }
  }, [selected, mounted, onModelChange]);

  if (!mounted) return null;

  const current = models.find(m => m.id === selected)!;

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger className="py-0 rounded-full bg-transparent text-blue-300 hover:text-blue-400 hover:bg-blue-100/10 focus:outline-none focus:ring-0" asChild>
          <Button variant="outline" size="sm">
            {current.icon && <current.icon className="h-3 w-3" />}
            <span className="hidden md:block text-md font-serif">{current.name}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44 bg-muted rounded-lg shadow-[0_1px_2px] shadow-blue-50">
          {models.map(m => (
            <DropdownMenuItem
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`cursor-pointer hover:bg-blue-100/10 focus:bg-blue-100/10 flex items-center gap-3 font-normal py-1 px-2 rounded-lg  ${
                m.id === selected ? "text-blue-400" : ""
              }`}
            >
              {m.icon && <m.icon className="h-4 w-4" />}
              <span className="hidden md:block text-md font-serif">{m.name}</span>
              {m.id === selected && (
                <span className="ml-auto text-blue-400 font-mono font-bold text-lg">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
