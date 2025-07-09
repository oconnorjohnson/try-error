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
import { List, Info } from "lucide-react";

// Read all enumeration markdown files
function getEnumerationFiles() {
  const enumerationsDir = path.join(
    process.cwd(),
    "src/app/docs/api-reference/enumerations"
  );
  const files = fs
    .readdirSync(enumerationsDir)
    .filter((file) => file.endsWith(".md"));

  return files
    .map((file) => {
      const name = file.replace(".md", "");
      const filePath = path.join(enumerationsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Extract description from markdown content
      const lines = content.split("\n");
      const descriptionLine = lines.find(
        (line) => line.includes("description:") || line.includes("brief:")
      );
      let description = "Enumeration documentation";

      if (descriptionLine) {
        description =
          descriptionLine.split(":")[1]?.trim().replace(/"/g, "") ||
          description;
      }

      return {
        name,
        description,
        path: `/docs/api-reference/enumerations/${name}`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function EnumerationsPage() {
  const enumerations = getEnumerationFiles();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Enumerations</h1>
        <p className="text-muted-foreground">
          Complete reference for all tryError enumerations and their values.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These enumerations provide predefined constants and flags used
          throughout the tryError library.
        </AlertDescription>
      </Alert>

      <div className="grid gap-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <List className="h-4 w-4" />
          <span>Total enumerations: {enumerations.length}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {enumerations.map((enumeration) => (
          <Card
            key={enumeration.name}
            className="h-full hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {enumeration.name}
                </code>
                <Badge variant="outline" className="text-xs">
                  Enum
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm">
                {enumeration.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link
                href={enumeration.path}
                className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View documentation
                <span aria-hidden="true">→</span>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

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
        </div>
      </Card>
    </div>
  );
}
