"use client";

import { Copy, Download } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeEditorProps {
  code: string;
  language?: string;
  onGenerate?: () => void;
  onCodeChange?: (newCode: string) => void;
}

export function CodeEditor({
  code,
  language = "python", // lowercase for syntax highlighter
  onGenerate,
}: CodeEditorProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  // Custom style to match your dark theme
  const customStyle = {
    background: 'transparent',
    fontSize: '10px',
    lineHeight: '1.5',
    margin: 0,
    padding: 0,
  };

  return (
    <div className="w-full h-[400px] bg-gmanim-surface-dark rounded-[13px] relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <span className="text-white font-spartan text-[13px]">
          {language.charAt(0).toUpperCase() + language.slice(1)}
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCopy}
            className="hover:opacity-70 transition-opacity"
            title="Copy code"
          >
            <Copy className="w-[14px] h-[13px] text-white" />
          </button>

          <Download className="w-[13px] h-[13px] text-white" />
        </div>
      </div>

      {/* Code Content */}
      <div className="px-6 pb-6 overflow-auto max-h-[300px] w-full">
        <SyntaxHighlighter 
          language={language.toLowerCase()} 
          style={vscDarkPlus}
          customStyle={customStyle}
          showLineNumbers={false}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Generate Button */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={onGenerate}
          className="px-4 py-2 bg-gmanim-surface-light/60 rounded-md text-white font-inter text-xs font-bold hover:bg-gmanim-surface-light transition-colors"
        >
          Generate
        </button>
      </div>
    </div>
  );
}