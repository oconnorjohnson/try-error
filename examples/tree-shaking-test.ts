// Example: Tree-shaking with default import vs modular imports

// When using the default import with modern bundlers (webpack, vite, rollup, esbuild)
// that support tree-shaking, unused exports will be eliminated

// Example 1: Default import with tree-shaking
// Even though we import from the main entry, modern bundlers will tree-shake
import { trySync, isTryError } from "try-error";

// Only trySync and isTryError (and their dependencies) will be included
// tryAsync and other async utilities will be tree-shaken out
function parseConfigWithTreeShaking(configString: string) {
  const result = trySync(() => JSON.parse(configString));
  if (isTryError(result)) {
    console.error("Parse failed:", result.message);
    return null;
  }
  return result;
}

// Example 2: Modular import for guaranteed smaller bundle
// This ensures ONLY sync code is included, regardless of bundler configuration
import { trySync as trySyncOnly, isTryError as isError } from "try-error/sync";

function parseConfigModular(configString: string) {
  const result = trySyncOnly(() => JSON.parse(configString));
  if (isError(result)) {
    console.error("Parse failed:", result.message);
    return null;
  }
  return result;
}

// Bundle size comparison (with modern bundler + tree-shaking):
// - Default import: ~5-6KB (depends on tree-shaking effectiveness)
// - Modular import: ~4KB (guaranteed, no async code included)

// Benefits of modular imports:
// 1. Guaranteed smaller bundle - no reliance on bundler configuration
// 2. Faster build times - less code for bundler to analyze
// 3. Clear intent - obvious what parts of the library you're using
// 4. Works with all bundlers - even those with limited tree-shaking

// Note: try-error has "sideEffects": false in package.json
// This tells bundlers that all code is pure and can be safely tree-shaken
