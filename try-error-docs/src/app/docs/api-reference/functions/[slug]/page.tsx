import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

// Generate static params for all function pages
export async function generateStaticParams() {
  const functionsDir = path.join(
    process.cwd(),
    "src/app/docs/api-reference/functions"
  );
  const files = fs
    .readdirSync(functionsDir)
    .filter((file) => file.endsWith(".md"));

  return files.map((file) => ({
    slug: file.replace(".md", ""),
  }));
}

// Get function data from markdown file
function getFunctionData(slug: string) {
  const functionsDir = path.join(
    process.cwd(),
    "src/app/docs/api-reference/functions"
  );
  const filePath = path.join(functionsDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf-8");

  // Parse the markdown content
  const lines = content.split("\n");
  let title = slug;
  let description = "";
  const markdownContent = content;

  // Extract title from first heading
  const titleLine = lines.find((line) => line.startsWith("# "));
  if (titleLine) {
    title = titleLine.replace("# ", "").trim();
  }

  // Extract description (usually follows the title)
  const descriptionStart = lines.findIndex((line) => line.startsWith("# ")) + 1;
  if (descriptionStart > 0) {
    const descriptionEnd = lines.findIndex(
      (line, index) =>
        index > descriptionStart &&
        (line.startsWith("## ") || line.startsWith("### "))
    );
    if (descriptionEnd > descriptionStart) {
      description = lines
        .slice(descriptionStart, descriptionEnd)
        .join("\n")
        .trim();
    }
  }

  return {
    slug,
    title,
    description,
    content: markdownContent,
  };
}

export default async function FunctionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const functionData = getFunctionData(slug);

  if (!functionData) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/docs/api-reference/functions">
            <ChevronLeft className="h-4 w-4" />
            Back to Functions
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Code2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <code className="text-2xl font-mono bg-muted px-2 py-1 rounded">
                {functionData.title}
              </code>
              <Badge variant="outline">Function</Badge>
            </h1>
            {functionData.description && (
              <p className="text-muted-foreground mt-1">
                {functionData.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          <MarkdownRenderer
            content={functionData.content}
            className="prose prose-neutral dark:prose-invert max-w-none"
          />
        </CardContent>
      </Card>

      {/* Navigation footer */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" asChild>
          <Link href="/docs/api-reference/functions">
            <ChevronLeft className="h-4 w-4" />
            All Functions
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/docs/api-reference/type-aliases">Type Aliases</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/docs/api-reference/interfaces">Interfaces</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
