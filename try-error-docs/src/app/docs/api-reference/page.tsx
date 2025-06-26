import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, FileText, Code2, Package, Settings } from "lucide-react";

// Define the API sections based on what TypeDoc generates
const apiSections = [
  {
    title: "Functions",
    description: "Core functions for error handling",
    path: "/docs/api-reference/functions",
    icon: Code2,
    items: [
      { name: "trySync", description: "Handle synchronous operations safely" },
      {
        name: "tryAsync",
        description: "Handle asynchronous operations safely",
      },
      { name: "tryCall", description: "Call functions with error handling" },
      { name: "createError", description: "Create custom error types" },
      { name: "isTryError", description: "Type guard for TryError instances" },
    ],
  },
  {
    title: "Types",
    description: "TypeScript type definitions",
    path: "/docs/api-reference/type-aliases",
    icon: FileText,
    items: [
      { name: "TryResult", description: "Result type for try operations" },
      { name: "TryError", description: "Enhanced error type" },
      { name: "ErrorConfig", description: "Configuration options" },
    ],
  },
  {
    title: "Interfaces",
    description: "Interface definitions",
    path: "/docs/api-reference/interfaces",
    icon: Package,
    items: [
      { name: "TryOptions", description: "Options for try operations" },
      { name: "ErrorDetails", description: "Additional error information" },
    ],
  },
  {
    title: "Configuration",
    description: "Configuration and setup",
    path: "/docs/api-reference/functions#configure",
    icon: Settings,
    items: [
      { name: "configure", description: "Configure global settings" },
      { name: "getConfig", description: "Get current configuration" },
      { name: "ConfigPresets", description: "Pre-defined configurations" },
    ],
  },
];

export default function ApiReferencePage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">API Reference</h1>
        <p className="text-muted-foreground">
          Complete API documentation for try-error, auto-generated from the
          TypeScript source code.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This documentation is automatically generated from the source code
          using TypeDoc. For the most up-to-date information, refer to the
          TypeScript definitions in your IDE.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {apiSections.map((section) => (
          <Card
            key={section.title}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-muted">
                <section.icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>

                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div key={item.name} className="flex items-start gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                        {item.name}
                      </code>
                      <span className="text-sm text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href={section.path}
                  className="inline-flex items-center gap-1 mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all {section.title.toLowerCase()}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-2">📚 Quick Links</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/docs/api/sync" className="text-sm hover:underline">
            • Synchronous Operations Guide
          </Link>
          <Link href="/docs/api/async" className="text-sm hover:underline">
            • Asynchronous Operations Guide
          </Link>
          <Link href="/docs/api/errors" className="text-sm hover:underline">
            • Error Creation Guide
          </Link>
          <Link
            href="/docs/reference/types"
            className="text-sm hover:underline"
          >
            • TypeScript Types Reference
          </Link>
        </div>
      </Card>

      <Alert variant="default" className="border-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro tip:</strong> Use your IDE's "Go to Definition" feature
          (usually Cmd/Ctrl + Click) on any try-error function to see its full
          documentation, parameters, and return types.
        </AlertDescription>
      </Alert>
    </div>
  );
}
