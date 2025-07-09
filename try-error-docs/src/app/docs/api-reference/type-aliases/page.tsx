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
import { FileText, Info } from "lucide-react";

// Read all type alias markdown files
function getTypeAliasFiles() {
  const typeAliasesDir = path.join(
    process.cwd(),
    "src/app/docs/api-reference/type-aliases"
  );
  const files = fs
    .readdirSync(typeAliasesDir)
    .filter((file) => file.endsWith(".md"));

  return files
    .map((file) => {
      const name = file.replace(".md", "");
      const filePath = path.join(typeAliasesDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Extract description from markdown content
      const lines = content.split("\n");
      const descriptionLine = lines.find(
        (line) => line.includes("description:") || line.includes("brief:")
      );
      let description = "Type alias documentation";

      if (descriptionLine) {
        description =
          descriptionLine.split(":")[1]?.trim().replace(/"/g, "") ||
          description;
      }

      return {
        name,
        description,
        path: `/docs/api-reference/type-aliases/${name}`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function TypeAliasesPage() {
  const typeAliases = getTypeAliasFiles();

  // Group type aliases by category
  const categories = {
    "Core Types": typeAliases.filter((t) =>
      [
        "TryResult",
        "TrySuccess",
        "TryFailure",
        "TryTuple",
        "UnwrapTry",
        "UnwrapTryError",
      ].includes(t.name)
    ),
    "Error Types": typeAliases.filter(
      (t) => t.name.includes("Error") && !["UnwrapTryError"].includes(t.name)
    ),
    "Middleware Types": typeAliases.filter(
      (t) => t.name.includes("Middleware") || t.name.includes("EventListener")
    ),
    "Other Types": typeAliases.filter(
      (t) =>
        ![
          "TryResult",
          "TrySuccess",
          "TryFailure",
          "TryTuple",
          "UnwrapTry",
          "UnwrapTryError",
        ].includes(t.name) &&
        !t.name.includes("Error") &&
        !t.name.includes("Middleware") &&
        !t.name.includes("EventListener")
    ),
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Type Aliases</h1>
        <p className="text-muted-foreground">
          Complete reference for all tryError type aliases and TypeScript types.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These type aliases provide strong typing for tryError operations. Use
          them to ensure type safety in your applications.
        </AlertDescription>
      </Alert>

      <div className="grid gap-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Total type aliases: {typeAliases.length}</span>
        </div>
      </div>

      {Object.entries(categories).map(
        ([category, categoryTypes]) =>
          categoryTypes.length > 0 && (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryTypes.map((type) => (
                  <Card
                    key={type.name}
                    className="h-full hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {type.name}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          Type
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {type.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Link
                        href={type.path}
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
            href="/docs/api-reference/interfaces"
            className="text-sm hover:underline"
          >
            • Interfaces Reference
          </Link>
          <Link
            href="/docs/reference/types"
            className="text-sm hover:underline"
          >
            • TypeScript Types Guide
          </Link>
          <Link
            href="/docs/concepts/tryresult-vs-exceptions"
            className="text-sm hover:underline"
          >
            • TryResult vs Exceptions
          </Link>
        </div>
      </Card>
    </div>
  );
}
