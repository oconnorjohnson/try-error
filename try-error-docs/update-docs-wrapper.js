const fs = require("fs");
const path = require("path");

// List of all documentation pages that need updating
const pagesToUpdate = [
  // API pages
  "src/app/docs/api/async/page.tsx",
  "src/app/docs/api/errors/page.tsx",
  "src/app/docs/api/sync/page.tsx",
  "src/app/docs/api/utils/page.tsx",

  // Guide pages
  "src/app/docs/guides/error-sampling/page.tsx",
  "src/app/docs/guides/integration/page.tsx",
  "src/app/docs/guides/middleware/page.tsx",
  "src/app/docs/guides/migration/page.tsx",
  "src/app/docs/guides/performance-optimization/page.tsx",
  "src/app/docs/guides/plugins/page.tsx",

  // Concept pages
  "src/app/docs/concepts/error-types/page.tsx",
  "src/app/docs/concepts/philosophy/page.tsx",
  "src/app/docs/concepts/success-vs-error/page.tsx",
  "src/app/docs/concepts/tryresult-vs-exceptions/page.tsx",

  // Example pages
  "src/app/docs/examples/basic/page.tsx",
  "src/app/docs/examples/react/page.tsx",
  "src/app/docs/examples/real-world/page.tsx",
  "src/app/docs/examples/sentry-vercel/page.tsx",

  // Reference pages
  "src/app/docs/reference/configuration/page.tsx",
  "src/app/docs/reference/error-codes/page.tsx",
  "src/app/docs/reference/error-factories/page.tsx",
  "src/app/docs/reference/types/page.tsx",

  // React pages
  "src/app/docs/react/components/page.tsx",
  "src/app/docs/react/hooks/page.tsx",
  "src/app/docs/react/installation/page.tsx",
  "src/app/docs/react/types/page.tsx",

  // Advanced pages
  "src/app/docs/advanced/custom-errors/page.tsx",
  "src/app/docs/advanced/error-performance/page.tsx",
  "src/app/docs/advanced/factories/page.tsx",
  "src/app/docs/advanced/performance/page.tsx",

  // Other pages
  "src/app/docs/common-pitfalls/page.tsx",
  "src/app/docs/troubleshooting/page.tsx",
  "src/app/docs/migration/page.tsx",
  "src/app/docs/page.tsx",
];

function updatePage(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Skip if already using DocsPageWrapper
    if (content.includes("DocsPageWrapper")) {
      console.log(`✓ Already updated: ${filePath}`);
      return;
    }

    // Add import if not present
    if (!content.includes("import { DocsPageWrapper }")) {
      // Find the last import statement
      const importMatch = content.match(
        /(import[\s\S]*?from\s+["'][^"']+["'];?\s*\n)/g
      );
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertPosition = lastImportIndex + lastImport.length;

        // Calculate the relative path to DocsPageWrapper
        const relativePath = path
          .relative(path.dirname(filePath), "src/components/DocsPageWrapper")
          .replace(/\\/g, "/");

        content =
          content.slice(0, insertPosition) +
          `import { DocsPageWrapper } from "${relativePath}";\n` +
          content.slice(insertPosition);
      }
    }

    // Replace the wrapper div with DocsPageWrapper
    // Pattern 1: <div className="max-w-4xl mx-auto py-8 px-6">
    content = content.replace(
      /<div className="max-w-4xl mx-auto py-8 px-6">/,
      "<DocsPageWrapper>"
    );

    // Pattern 2: <div className="max-w-4xl mx-auto py-8">
    content = content.replace(
      /<div className="max-w-4xl mx-auto py-8">/,
      "<DocsPageWrapper>"
    );

    // Pattern 3: <div className="max-w-4xl mx-auto">
    content = content.replace(
      /<div className="max-w-4xl mx-auto">/,
      "<DocsPageWrapper>"
    );

    // Pattern 4: <div className="container mx-auto py-8">
    content = content.replace(
      /<div className="container mx-auto py-8">/,
      "<DocsPageWrapper>"
    );

    // Replace the closing div - find the last </div> before the closing of the component
    const lastDivIndex = content.lastIndexOf("</div>");
    const secondLastDivIndex = content.lastIndexOf("</div>", lastDivIndex - 1);

    // Check if this is likely the wrapper div
    const beforeLastDiv = content.substring(secondLastDivIndex, lastDivIndex);
    if (
      !beforeLastDiv.includes("</section>") &&
      !beforeLastDiv.includes("</div>")
    ) {
      content =
        content.slice(0, lastDivIndex) +
        "</DocsPageWrapper>" +
        content.slice(lastDivIndex + 6);
    }

    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

console.log("🔄 Updating documentation pages to use DocsPageWrapper...\n");

pagesToUpdate.forEach(updatePage);

console.log("\n✨ Update complete!");
