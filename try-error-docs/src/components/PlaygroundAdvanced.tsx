"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Download,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dynamically import Monaco to avoid SSR issues
const Editor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    ),
  }
);

interface PlaygroundAdvancedProps {
  defaultCode?: string;
  height?: string;
  showConsole?: boolean;
  language?: "typescript" | "javascript";
  title?: string;
  description?: string;
  readOnly?: boolean;
  autoRun?: boolean;
}

interface ConsoleOutput {
  type: "log" | "error" | "warn" | "info" | "success";
  message: string;
  timestamp: number;
}

// Mock tryError implementation for the playground
const mockTryError = `
const trySync = (fn) => {
  try {
    const data = fn();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

const tryAsync = async (fn) => {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

const createError = (code) => {
  return (message, details) => {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
  };
};

const isTryError = (error) => {
  return error && typeof error === 'object' && 'code' in error;
};
`;

export function PlaygroundAdvanced({
  defaultCode = "",
  height = "400px",
  showConsole = true,
  language = "typescript",
  title,
  description,
  readOnly = false,
  autoRun = false,
}: PlaygroundAdvancedProps) {
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState<ConsoleOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("code");
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-run on mount if specified
  useEffect(() => {
    if (autoRun && defaultCode) {
      handleRunCode();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom of console output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = useCallback(
    (type: ConsoleOutput["type"], ...args: unknown[]) => {
      const message = args
        .map((arg) => {
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(" ");

      setOutput((prev) => [...prev, { type, message, timestamp: Date.now() }]);
    },
    []
  );

  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setOutput([]);
    setActiveTab("console");

    // Create a custom console for capturing output
    const customConsole = {
      log: (...args: unknown[]) => addOutput("log", ...args),
      error: (...args: unknown[]) => addOutput("error", ...args),
      warn: (...args: unknown[]) => addOutput("warn", ...args),
      info: (...args: unknown[]) => addOutput("info", ...args),
    };

    try {
      // Wrap the code with our mock implementation and custom console
      const wrappedCode = `
        ${mockTryError}
        
        const console = {
          log: (...args) => __console__.log(...args),
          error: (...args) => __console__.error(...args),
          warn: (...args) => __console__.warn(...args),
          info: (...args) => __console__.info(...args),
        };
        
        ${code}
      `;

      // Create a function with our custom console in scope
      const AsyncFunction = Object.getPrototypeOf(
        async function () {}
      ).constructor;
      const runCode = new AsyncFunction("__console__", wrappedCode);

      await runCode(customConsole);

      addOutput("success", "Code executed successfully!");
    } catch (error) {
      addOutput(
        "error",
        error instanceof Error ? error.message : "Unknown error occurred"
      );

      // Try to extract line number from error
      if (error instanceof Error && error.stack) {
        const match = error.stack.match(/<anonymous>:(\d+):(\d+)/);
        if (match) {
          const lineNumber =
            parseInt(match[1]) - mockTryError.split("\n").length - 8;
          addOutput("error", `Error at line ${lineNumber}`);
        }
      }
    } finally {
      setIsRunning(false);
    }
  }, [code, addOutput]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleReset = useCallback(() => {
    setCode(defaultCode);
    setOutput([]);
  }, [defaultCode]);

  const handleShare = useCallback(() => {
    // In a real implementation, this would create a shareable link
    const shareUrl = `${
      window.location.origin
    }/playground?code=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(shareUrl);
    addOutput("info", "Shareable link copied to clipboard!");
  }, [code, addOutput]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tryError-example.ts";
    a.click();
    URL.revokeObjectURL(url);
  }, [code]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && !readOnly) {
      setCode(value);
    }
  };

  return (
    <Card className="overflow-hidden">
      {(title || description) && (
        <div className="border-b px-4 py-3 bg-muted/30">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Playground</span>
          <span className="text-xs text-muted-foreground">({language})</span>
          {readOnly && (
            <span className="text-xs text-muted-foreground">(Read Only)</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-8 px-2"
            title="Reset code"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleShare}
            className="h-8 px-2"
            title="Share code"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="h-8 px-2"
            title="Download code"
          >
            <Download className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-8 px-2"
            title="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleRunCode}
            disabled={isRunning || readOnly}
            className="h-8"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b h-9">
          <TabsTrigger value="code" className="h-8">
            Code
          </TabsTrigger>
          {showConsole && (
            <TabsTrigger value="console" className="h-8">
              Console
              {output.length > 0 && (
                <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {output.length}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="code" className="m-0">
          <div style={{ height }}>
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                readOnly,
                cursorStyle: readOnly ? "underline" : "line",
              }}
            />
          </div>
        </TabsContent>

        {showConsole && (
          <TabsContent value="console" className="m-0">
            <div
              ref={outputRef}
              className="bg-slate-950 text-slate-100 p-4 font-mono text-sm overflow-auto"
              style={{ height }}
            >
              {output.length === 0 ? (
                <div className="text-slate-500">
                  Console output will appear here...
                </div>
              ) : (
                <div className="space-y-1">
                  {output.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-2",
                        item.type === "error" && "text-red-400",
                        item.type === "warn" && "text-yellow-400",
                        item.type === "info" && "text-blue-400",
                        item.type === "success" && "text-green-400"
                      )}
                    >
                      <span className="text-slate-500 text-xs">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                      {item.type === "error" && (
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      {item.type === "success" && (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="break-all whitespace-pre-wrap">
                        {item.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {!showConsole && output.some((o) => o.type === "error") && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {output.find((o) => o.type === "error")?.message}
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}
