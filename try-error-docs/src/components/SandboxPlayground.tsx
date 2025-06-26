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

interface SandboxPlaygroundProps {
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

export function SandboxPlayground({
  defaultCode = "",
  height = "400px",
  showConsole = true,
  language = "typescript",
  title,
  description,
  readOnly = false,
  autoRun = false,
}: SandboxPlaygroundProps) {
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState<ConsoleOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("code");
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Cleanup sandbox on unmount
  useEffect(() => {
    return () => {
      if (sandboxId) {
        fetch(`/api/sandbox?id=${sandboxId}`, { method: "DELETE" }).catch(
          console.error
        );
      }
    };
  }, [sandboxId]);

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
    (type: ConsoleOutput["type"], message: string) => {
      setOutput((prev) => [...prev, { type, message, timestamp: Date.now() }]);
    },
    []
  );

  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setOutput([]);
    setActiveTab("console");

    try {
      // Initialize sandbox if not already done
      if (!sandboxId) {
        setIsInitializing(true);
        addOutput("info", "Initializing sandbox environment...");

        const response = await fetch("/api/sandbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language }),
        });

        if (!response.ok) {
          throw new Error("Failed to create sandbox");
        }

        const { sandboxId: newSandboxId } = await response.json();
        setSandboxId(newSandboxId);
        setIsInitializing(false);
        addOutput("success", "Sandbox initialized successfully!");

        // Now run the code
        const runResponse = await fetch("/api/sandbox", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sandboxId: newSandboxId, code }),
        });

        const result = await runResponse.json();

        if (result.output) {
          result.output.split("\n").forEach((line: string) => {
            if (line.trim()) addOutput("log", line);
          });
        }

        if (result.error) {
          result.error.split("\n").forEach((line: string) => {
            if (line.trim()) addOutput("error", line);
          });
        }

        if (result.exitCode === 0) {
          addOutput("success", "Code executed successfully!");
        }
      } else {
        // Run code in existing sandbox
        const response = await fetch("/api/sandbox", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sandboxId, code }),
        });

        const result = await response.json();

        if (result.output) {
          result.output.split("\n").forEach((line: string) => {
            if (line.trim()) addOutput("log", line);
          });
        }

        if (result.error) {
          result.error.split("\n").forEach((line: string) => {
            if (line.trim()) addOutput("error", line);
          });
        }

        if (result.exitCode === 0) {
          addOutput("success", "Code executed successfully!");
        }
      }
    } catch (error) {
      addOutput(
        "error",
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsRunning(false);
      setIsInitializing(false);
    }
  }, [code, sandboxId, language, addOutput]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleReset = useCallback(() => {
    setCode(defaultCode);
    setOutput([]);
    if (sandboxId) {
      fetch(`/api/sandbox?id=${sandboxId}`, { method: "DELETE" }).catch(
        console.error
      );
      setSandboxId(null);
    }
  }, [defaultCode, sandboxId]);

  const handleShare = useCallback(() => {
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
    a.download = `try-error-example.${language === "typescript" ? "ts" : "js"}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, language]);

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
          {sandboxId && (
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </span>
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
            disabled={isRunning || readOnly || isInitializing}
            className="h-8"
          >
            {isRunning || isInitializing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {isInitializing ? "Initializing..." : "Running..."}
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
