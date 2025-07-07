"use client";

import { Copy, Edit3, Folder, Save, X } from "lucide-react";
import { useState } from "react";
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
  onCodeChange,
}: CodeEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(code);

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editedCode : code);
  };

  const handleEdit = () => {
    if (isEditing) {
      // Cancel editing
      setEditedCode(code);
      setIsEditing(false);
    } else {
      // Start editing
      setEditedCode(code);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    onCodeChange?.(editedCode);
    setIsEditing(false);
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

          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="hover:opacity-70 transition-opacity text-green-400"
                title="Save changes"
              >
                <Save className="w-4 h-[13px]" />
              </button>
              <button
                onClick={handleEdit}
                className="hover:opacity-70 transition-opacity text-red-400"
                title="Cancel editing"
              >
                <X className="w-4 h-[13px]" />
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="hover:opacity-70 transition-opacity"
              title="Edit code"
            >
              <Edit3 className="w-4 h-[13px] text-white" />
            </button>
          )}

          <Folder className="w-[13px] h-[13px] text-white" />
        </div>
      </div>

      {/* Code Content */}
      <div className="px-6 pb-6 overflow-auto max-h-[300px] w-full">
        {isEditing ? (
          <textarea
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            className="w-full h-full bg-transparent text-white font-mono text-[10px] leading-relaxed border-none outline-none resize-none placeholder:text-gmanim-text-secondary"
            placeholder="Enter your code here..."
            style={{ minHeight: "350px",wordWrap: "break-word", whiteSpace: "pre-wrap" }}
          />
        ) : (
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
        )}
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