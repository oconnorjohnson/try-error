const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Common replacements for mobile responsiveness
const replacements = [
  // Container padding and spacing
  {
    pattern: /<div className="max-w-4xl mx-auto py-8 px-6">/g,
    replacement:
      '<div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">',
  },
  // Headings
  {
    pattern: /<h1 className="text-4xl font-bold(.*?)mb-4">/g,
    replacement:
      '<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold$1mb-3 sm:mb-4">',
  },
  {
    pattern: /<h2 className="text-2xl font-semibold(.*?)mb-4">/g,
    replacement:
      '<h2 className="text-xl sm:text-2xl font-semibold$1mb-3 sm:mb-4">',
  },
  {
    pattern: /<h3 className="text-lg font-semibold(.*?)mb-3">/g,
    replacement:
      '<h3 className="text-base sm:text-lg font-semibold$1mb-2 sm:mb-3">',
  },
  // Paragraphs
  {
    pattern: /<p className="text-xl text-(.*?)">/g,
    replacement: '<p className="text-base sm:text-lg md:text-xl text-$1">',
  },
  {
    pattern: /<p className="text-(.*?)mb-4">/g,
    replacement: '<p className="text-$1mb-3 sm:mb-4 text-sm sm:text-base">',
  },
  // Code blocks
  {
    pattern: /className="mb-4">/g,
    replacement: 'className="mb-3 sm:mb-4 text-xs sm:text-sm">',
  },
  // Inline code
  {
    pattern: /<code className="bg-(.*?)px-2 py-1 rounded">/g,
    replacement:
      '<code className="bg-$1px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">',
  },
  // Cards and boxes
  {
    pattern: /rounded-lg p-4">/g,
    replacement: 'rounded-lg p-3 sm:p-4">',
  },
  // Grids
  {
    pattern: /grid md:grid-cols-(\d+) gap-4/g,
    replacement: "grid sm:grid-cols-2 md:grid-cols-$1 gap-3 sm:gap-4",
  },
  // Spacing
  {
    pattern: /<div className="space-y-8">/g,
    replacement: '<div className="space-y-6 sm:space-y-8">',
  },
  {
    pattern: /<div className="mb-8">/g,
    replacement: '<div className="mb-6 sm:mb-8">',
  },
  // Text sizes in cards
  {
    pattern: /text-sm mb-3/g,
    replacement: "text-xs sm:text-sm mb-2 sm:mb-3",
  },
];

// Find all .tsx files in the docs directory
const docsDir = path.join(__dirname, "../src/app/docs");
const files = glob.sync("**/*.tsx", { cwd: docsDir });

console.log(`Found ${files.length} files to process...`);

let updatedCount = 0;

files.forEach((file) => {
  const filePath = path.join(docsDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  let originalContent = content;

  // Skip already updated files
  if (content.includes("sm:py-8") || content.includes("sm:text-3xl")) {
    console.log(`Skipping ${file} - already updated`);
    return;
  }

  // Apply replacements
  replacements.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });

  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${file}`);
    updatedCount++;
  }
});

console.log(`\nCompleted! Updated ${updatedCount} files.`);
