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
import { Code2, Info } from "lucide-react";

// Read all function markdown files
function getFunctionFiles() {
  const functionsDir = path.join(
    process.cwd(),
    "src/app/docs/api-reference/functions"
  );
  const files = fs
    .readdirSync(functionsDir)
    .filter((file) => file.endsWith(".md"));

  return files
    .map((file) => {
      const name = file.replace(".md", "");
      const filePath = path.join(functionsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Extract description from markdown content
      const lines = content.split("\n");
      const descriptionLine = lines.find(
        (line) => line.includes("description:") || line.includes("brief:")
      );
      let description = "Function documentation";

      if (descriptionLine) {
        description =
          descriptionLine.split(":")[1]?.trim().replace(/"/g, "") ||
          description;
      }

      return {
        name,
        description,
        path: `/docs/api-reference/functions/${name}`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function FunctionsPage() {
  const functions = getFunctionFiles();

  // Group functions by category
  const categories = {
    "Core Operations": functions.filter((f) =>
      [
        "trySync",
        "tryAsync",
        "tryCall",
        "tryAwait",
        "tryMap",
        "tryMapAsync",
        "trySyncTuple",
      ].includes(f.name)
    ),
    "Error Creation": functions.filter(
      (f) =>
        f.name.includes("createError") ||
        (f.name.includes("Error") && f.name.startsWith("create"))
    ),
    "Error Handling": functions.filter((f) =>
      [
        "wrapWithContext",
        "chainError",
        "fromThrown",
        "unwrap",
        "unwrapOr",
        "unwrapOrElse",
      ].includes(f.name)
    ),
    Configuration: functions.filter((f) =>
      ["configure", "getConfig"].includes(f.name)
    ),
    Utilities: functions.filter(
      (f) =>
        ![
          "trySync",
          "tryAsync",
          "tryCall",
          "tryAwait",
          "tryMap",
          "tryMapAsync",
          "trySyncTuple",
        ].includes(f.name) &&
        !f.name.includes("createError") &&
        !(f.name.includes("Error") && f.name.startsWith("create")) &&
        ![
          "wrapWithContext",
          "chainError",
          "fromThrown",
          "unwrap",
          "unwrapOr",
          "unwrapOrElse",
        ].includes(f.name) &&
        !["configure", "getConfig"].includes(f.name)
    ),
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Functions</h1>
        <p className="text-muted-foreground">
          Complete reference for all tryError functions.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          All functions are fully typed with TypeScript. Click on any function
          to see its detailed documentation, parameters, and examples.
        </AlertDescription>
      </Alert>

      <div className="grid gap-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Code2 className="h-4 w-4" />
          <span>Total functions: {functions.length}</span>
        </div>
      </div>

      {Object.entries(categories).map(
        ([category, categoryFunctions]) =>
          categoryFunctions.length > 0 && (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryFunctions.map((func) => (
                  <Card
                    key={func.name}
                    className="h-full hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {func.name}
                        </code>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {func.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Link
                        href={func.path}
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
            href="/docs/api-reference/type-aliases"
            className="text-sm hover:underline"
          >
            • Type Aliases Reference
          </Link>
          <Link
            href="/docs/api-reference/interfaces"
            className="text-sm hover:underline"
          >
            • Interfaces Reference
          </Link>
          <Link href="/docs/api/sync" className="text-sm hover:underline">
            • Synchronous Operations Guide
          </Link>
          <Link href="/docs/api/async" className="text-sm hover:underline">
            • Asynchronous Operations Guide
          </Link>
        </div>
      </Card>
    </div>
  );
}
