import fs from "fs";
import path from "path";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Info } from "lucide-react";

// Read all interface markdown files
function getInterfaceFiles() {
  const interfacesDir = path.join(
    process.cwd(),
    "src/app/docs/api-reference/interfaces"
  );
  const files = fs
    .readdirSync(interfacesDir)
    .filter((file) => file.endsWith(".md"));

  return files
    .map((file) => {
      const name = file.replace(".md", "");
      const filePath = path.join(interfacesDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Extract description from markdown content
      const lines = content.split("\n");
      const descriptionLine = lines.find(
        (line) => line.includes("description:") || line.includes("brief:")
      );
      let description = "Interface documentation";

      if (descriptionLine) {
        description =
          descriptionLine.split(":")[1]?.trim().replace(/"/g, "") ||
          description;
      }

      return {
        name,
        description,
        path: `/docs/api-reference/interfaces/${name}`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function InterfacesPage() {
  const interfaces = getInterfaceFiles();

  // Group interfaces by category
  const categories = {
    "Core Interfaces": interfaces.filter((i) =>
      ["TryError", "TryErrorConfig", "CreateErrorOptions"].includes(i.name)
    ),
    "Error Types": interfaces.filter(
      (i) =>
        i.name.includes("Error") &&
        !["TryError", "CreateErrorOptions"].includes(i.name)
    ),
    Configuration: interfaces.filter(
      (i) =>
        i.name.includes("Config") ||
        (i.name.includes("Options") && !["CreateErrorOptions"].includes(i.name))
    ),
    "Plugins & Middleware": interfaces.filter(
      (i) =>
        i.name.includes("Plugin") ||
        i.name.includes("Middleware") ||
        i.name.includes("Context")
    ),
    "Other Interfaces": interfaces.filter(
      (i) =>
        !["TryError", "TryErrorConfig", "CreateErrorOptions"].includes(
          i.name
        ) &&
        !(
          i.name.includes("Error") &&
          !["TryError", "CreateErrorOptions"].includes(i.name)
        ) &&
        !(
          i.name.includes("Config") ||
          (i.name.includes("Options") &&
            !["CreateErrorOptions"].includes(i.name))
        ) &&
        !(
          i.name.includes("Plugin") ||
          i.name.includes("Middleware") ||
          i.name.includes("Context")
        )
    ),
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Interfaces</h1>
        <p className="text-muted-foreground">
          Complete reference for all tryError interfaces and type definitions.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These interfaces define the structure and contracts for tryError
          components. Use them to ensure proper typing and implementation.
        </AlertDescription>
      </Alert>

      <div className="grid gap-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span>Total interfaces: {interfaces.length}</span>
        </div>
      </div>

      {Object.entries(categories).map(
        ([category, categoryInterfaces]) =>
          categoryInterfaces.length > 0 && (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryInterfaces.map((iface) => (
                  <Card
                    key={iface.name}
                    className="h-full hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {iface.name}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          Interface
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {iface.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Link
                        href={iface.path}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View documentation
                        <span aria-hidden="true">→</span>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
      )}

      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-2">📚 Related Documentation</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/docs/api-reference/functions"
            className="text-sm hover:underline"
          >
            • Functions Reference
          </Link>
          <Link
            href="/docs/api-reference/type-aliases"
            className="text-sm hover:underline"
          >
            • Type Aliases Reference
          </Link>
          <Link
            href="/docs/reference/types"
            className="text-sm hover:underline"
          >
            • TypeScript Types Guide
          </Link>
          <Link
            href="/docs/reference/configuration"
            className="text-sm hover:underline"
          >
            • Configuration Reference
          </Link>
        </div>
      </Card>
    </div>
  );
}
