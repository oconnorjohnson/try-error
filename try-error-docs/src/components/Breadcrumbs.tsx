"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Map of paths to friendly names
const pathNames: Record<string, string> = {
  docs: "Documentation",
  installation: "Installation",
  "quick-start": "Quick Start",

  migration: "Migration Guide",
  concepts: "Core Concepts",
  philosophy: "Error Handling Philosophy",
  "tryresult-vs-exceptions": "TryResult vs Exceptions",
  "error-types": "Error Types",
  "success-vs-error": "Success vs Error Paths",
  api: "API Reference",
  "api-reference": "Complete API Reference",
  sync: "Synchronous Operations",
  async: "Asynchronous Operations",
  errors: "Error Creation",
  utils: "Utilities",
  react: "React Integration",
  hooks: "Hooks",
  components: "Components",
  types: "Types",
  advanced: "Advanced Patterns",
  "custom-errors": "Custom Error Types",
  factories: "Error Factories",
  performance: "Performance",
  "error-performance": "Error Performance Secrets",
  examples: "Examples",
  basic: "Basic Examples",
  "real-world": "Real-World Scenarios",
  "sentry-vercel": "Sentry & Vercel Analytics",
  guides: "Guides",
  integration: "Integration Guides",
  "error-sampling": "Error Sampling",
  "performance-optimization": "Performance Optimization",
  middleware: "Middleware System",
  plugins: "Plugin System",
  reference: "Reference",
  "error-factories": "Error Factories",
  "error-codes": "Error Codes",
  configuration: "Configuration",
  troubleshooting: "Troubleshooting",
  "common-pitfalls": "Common Pitfalls",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on the home page
  if (pathname === "/" || pathname === "/docs") {
    return null;
  }

  // Split the path into segments
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items
  const items = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const name =
      pathNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;

    return {
      path,
      name,
      isLast,
    };
  });

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {items.map((item, index) => (
          <React.Fragment key={item.path}>
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.path}>{item.name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
