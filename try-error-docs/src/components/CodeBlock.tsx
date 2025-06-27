"use client";

import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  theme?: "dark" | "light";
  className?: string;
}

export function CodeBlock({
  children,
  language = "javascript",
  title,
  showLineNumbers = false,
  theme = "dark",
  className = "",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const selectedTheme = theme === "dark" ? oneDark : oneLight;

  return (
    <div className={`relative group ${className}`}>
      {title && (
        <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b border-slate-700">
          <span className="truncate mr-2">{title}</span>
          <span className="text-xs text-slate-400 uppercase shrink-0">
            {language}
          </span>
        </div>
      )}

      <div className="relative overflow-x-auto">
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          title="Copy code"
        >
          {copied ? (
            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
          ) : (
            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </button>

        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language={language}
            style={selectedTheme}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              borderRadius: title ? "0 0 0.5rem 0.5rem" : "0.5rem",
              fontSize: "0.75rem",
              lineHeight: "1.5",
              padding: "0.75rem",
              overflow: "auto",
              minWidth: "fit-content",
            }}
            codeTagProps={{
              style: {
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                fontSize: "inherit",
              },
            }}
            wrapLongLines={false}
          >
            {children}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
