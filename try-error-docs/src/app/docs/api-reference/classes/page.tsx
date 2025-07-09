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
import { Box, Info } from "lucide-react";

// Read all class markdown files
function getClassFiles() {
  const classesDir = path.join(
    process.cwd(),
    "src/app/docs/api-reference/classes"
  );
  const files = fs
    .readdirSync(classesDir)
    .filter((file) => file.endsWith(".md"));

  return files
    .map((file) => {
      const name = file.replace(".md", "");
      const filePath = path.join(classesDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Extract description from markdown content
      const lines = content.split("\n");
      const descriptionLine = lines.find(
        (line) => line.includes("description:") || line.includes("brief:")
      );
      let description = "Class documentation";

      if (descriptionLine) {
        description =
          descriptionLine.split(":")[1]?.trim().replace(/"/g, "") ||
          description;
      }

      return {
        name,
        description,
        path: `/docs/api-reference/classes/${name}`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function ClassesPage() {
  const classes = getClassFiles();

  // Group classes by category
  const categories = {
    "Core Classes": classes.filter((c) =>
      ["ErrorPool", "ErrorEventEmitter"].includes(c.name)
    ),
    "Middleware & Plugins": classes.filter((c) =>
      ["MiddlewarePipeline", "PluginManager"].includes(c.name)
    ),
    "Utility Classes": classes.filter((c) =>
      ["AsyncQueue", "CircuitBreaker", "RateLimiter"].includes(c.name)
    ),
    "Other Classes": classes.filter(
      (c) =>
        !["ErrorPool", "ErrorEventEmitter"].includes(c.name) &&
        !["MiddlewarePipeline", "PluginManager"].includes(c.name) &&
        !["AsyncQueue", "CircuitBreaker", "RateLimiter"].includes(c.name)
    ),
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Classes</h1>
        <p className="text-muted-foreground">
          Complete reference for all tryError classes and their methods.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These classes provide advanced functionality for error handling,
          pooling, middleware, and utility operations.
        </AlertDescription>
      </Alert>

      <div className="grid gap-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Box className="h-4 w-4" />
          <span>Total classes: {classes.length}</span>
        </div>
      </div>

      {Object.entries(categories).map(
        ([category, categoryClasses]) =>
          categoryClasses.length > 0 && (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryClasses.map((cls) => (
                  <Card
                    key={cls.name}
                    className="h-full hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {cls.name}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          Class
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {cls.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Link
                        href={cls.path}
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
            href="/docs/guides/middleware"
            className="text-sm hover:underline"
          >
            • Middleware Guide
          </Link>
          <Link href="/docs/guides/plugins" className="text-sm hover:underline">
            • Plugins Guide
          </Link>
        </div>
      </Card>
    </div>
  );
}
