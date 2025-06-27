const fs = require("fs");
const path = require("path");

// List of all documentation pages that need fixing
const pagesToFix = [
  // API pages
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

function fixPage(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Check if already has proper import
    if (!content.includes("import { DocsPageWrapper }")) {
      // Calculate the relative path to DocsPageWrapper
      const relativePath = path
        .relative(path.dirname(filePath), "src/components/DocsPageWrapper")
        .replace(/\\/g, "/");

      // Find the first line after imports to insert our import
      const lines = content.split("\n");
      let insertIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("import ")) {
          insertIndex = i + 1;
        } else if (lines[i].trim() === "" && insertIndex > 0) {
          // Found empty line after imports
          break;
        }
      }

      // Insert the import
      lines.splice(
        insertIndex,
        0,
        `import { DocsPageWrapper } from "${relativePath}";`
      );
      content = lines.join("\n");
    }

    // Fix closing tag if needed
    // Count DocsPageWrapper occurrences
    const openCount = (content.match(/<DocsPageWrapper>/g) || []).length;
    const closeCount = (content.match(/<\/DocsPageWrapper>/g) || []).length;

    if (openCount > closeCount) {
      // Find the last </div> that should be </DocsPageWrapper>
      const lines = content.split("\n");
      let divCount = 0;

      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes("</div>")) {
          divCount++;
          // The second to last </div> should be the wrapper
          if (divCount === 2) {
            lines[i] = lines[i].replace("</div>", "</DocsPageWrapper>");
            break;
          }
        }
      }

      content = lines.join("\n");
    }

    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log("🔧 Fixing documentation pages...\n");

pagesToFix.forEach(fixPage);

console.log("\n✨ Fix complete!");
