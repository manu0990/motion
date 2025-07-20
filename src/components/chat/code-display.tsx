"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useTheme } from "next-themes";
import { a11yDark, prism } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeDisplayProps {
  code: string;
  language: string;
}

export function CodeDisplay({ code, language }: CodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
  };

  // Use resolvedTheme to get the actual theme (handles 'system' theme properly)
  // Fall back to 'light' if resolvedTheme is undefined during hydration or not mounted
  const isDark = mounted && resolvedTheme === 'dark';
  const syntaxTheme = isDark ? a11yDark : prism;

  return (
    <div className="relative w-full">
      <div className="absolute px-2 bg-accent w-full py-1 flex items-center justify-between rounded-t-md">
        <span className="text-primary text-xs">{language}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="overflow-auto pt-6 md:w-full w-96 rounded-md bg-background mx-auto text-sm">
        <SyntaxHighlighter language={language} style={syntaxTheme}>
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
