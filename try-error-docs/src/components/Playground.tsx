"use client";

import { useState, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Copy, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaygroundProps {
  defaultCode?: string;
  height?: string;
  showConsole?: boolean;
  language?: "typescript" | "javascript";
}

const defaultTypeScriptCode = `import { trySync, tryAsync } from 'try-error';

// Synchronous example
const parseJSON = (jsonString: string) => {
  const result = trySync(() => JSON.parse(jsonString));
  
  if (result.error) {
    console.error('Failed to parse JSON:', result.error.message);
    return null;
  }
  
  console.log('Parsed successfully:', result.data);
  return result.data;
};

// Test with valid JSON
parseJSON('{"name": "John", "age": 30}');

// Test with invalid JSON
parseJSON('invalid json');

// Async example
const fetchUser = async (userId: string) => {
  const result = await tryAsync(async () => {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) throw new Error('User not found');
    return response.json();
  });
  
  if (result.error) {
    console.error('Failed to fetch user:', result.error.message);
    return null;
  }
  
  console.log('User fetched:', result.data);
  return result.data;
};

// Test async function
fetchUser('123');`;

export function Playground({
  defaultCode = defaultTypeScriptCode,
  height = "400px",
  showConsole = true,
  language = "typescript",
}: PlaygroundProps) {
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState<
    Array<{ type: "log" | "error" | "success"; message: string }>
  >([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Capture console output
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      setOutput((prev) => [...prev, { type: "log", message: args.join(" ") }]);
    };

    console.error = (...args) => {
      originalError(...args);
      setOutput((prev) => [
        ...prev,
        { type: "error", message: args.join(" ") },
      ]);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setOutput([]);

    try {
      // Create a function from the code and run it
      // In a real implementation, this would run in a sandboxed environment
      const AsyncFunction = Object.getPrototypeOf(
        async function () {}
      ).constructor;
      const runCode = new AsyncFunction(code);
      await runCode();

      setOutput((prev) => [
        ...prev,
        { type: "success", message: "Code executed successfully!" },
      ]);
    } catch (error) {
      setOutput((prev) => [
        ...prev,
        {
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [code]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Playground</span>
          <span className="text-xs text-muted-foreground">({language})</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-8"
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
            disabled={isRunning}
            className="h-8"
          >
            <Play className="h-4 w-4 mr-1" />
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="code" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b h-9">
          <TabsTrigger value="code" className="h-8">
            Code
          </TabsTrigger>
          {showConsole && (
            <TabsTrigger value="console" className="h-8">
              Console
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
              }}
            />
          </div>
        </TabsContent>

        {showConsole && (
          <TabsContent value="console" className="m-0">
            <div
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
                        item.type === "success" && "text-green-400"
                      )}
                    >
                      {item.type === "error" && (
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      {item.type === "success" && (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="break-all">{item.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </Card>
  );
}
