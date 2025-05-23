"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  children,
  language = "typescript",
  title,
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group", className)}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted border border-b-0 rounded-t-lg">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <span className="text-xs text-muted-foreground uppercase">
            {language}
          </span>
        </div>
      )}

      <div className="relative">
        <pre
          className={cn(
            "overflow-x-auto p-4 bg-muted/50 border rounded-lg text-sm",
            title && "rounded-t-none border-t-0",
            showLineNumbers && "pl-12"
          )}
        >
          <code className={`language-${language}`}>{children}</code>
        </pre>

        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

// Pre-configured code blocks for common languages
export function TypeScriptCode({
  children,
  title,
  ...props
}: Omit<CodeBlockProps, "language">) {
  return (
    <CodeBlock language="typescript" title={title} {...props}>
      {children}
    </CodeBlock>
  );
}

export function JavaScriptCode({
  children,
  title,
  ...props
}: Omit<CodeBlockProps, "language">) {
  return (
    <CodeBlock language="javascript" title={title} {...props}>
      {children}
    </CodeBlock>
  );
}

export function BashCode({
  children,
  title,
  ...props
}: Omit<CodeBlockProps, "language">) {
  return (
    <CodeBlock language="bash" title={title} {...props}>
      {children}
    </CodeBlock>
  );
}
