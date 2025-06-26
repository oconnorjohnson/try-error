// Example: Sync-only application with modular imports
// This reduces bundle size by ~50% compared to the full import

import {
  trySync,
  trySyncTuple,
  isTryError,
  unwrap,
  tryCall,
} from "try-error/sync";

// Example 1: Parsing JSON configuration
function parseConfig(configString: string) {
  const result = trySync(() => JSON.parse(configString));

  if (isTryError(result)) {
    console.error("Failed to parse config:", result.message);
    return null;
  }

  return result;
}

// Example 2: Tuple style for Go-like error handling
function processData(data: string) {
  const [parsed, parseError] = trySyncTuple(() => JSON.parse(data));
  if (parseError) {
    console.error("Parse error:", parseError);
    return null;
  }

  const [validated, validationError] = trySyncTuple(() => {
    if (!parsed.id || !parsed.name) {
      throw new Error("Missing required fields");
    }
    return parsed;
  });

  if (validationError) {
    console.error("Validation error:", validationError);
    return null;
  }

  return validated;
}

// Example 3: Using tryCall for function calls
function calculateTotal(items: number[], taxRate: number) {
  const result = tryCall(
    (items: number[], rate: number) => {
      const subtotal = items.reduce((sum, item) => sum + item, 0);
      if (rate < 0 || rate > 1) {
        throw new Error("Invalid tax rate");
      }
      return subtotal * (1 + rate);
    },
    items,
    taxRate
  );

  return isTryError(result) ? 0 : result;
}

// Example 4: Error unwrapping
function requireConfig(path: string) {
  const configString = '{"apiUrl": "https://api.example.com"}';
  const config = trySync(() => JSON.parse(configString));

  // Unwrap or throw
  return unwrap(config, `Failed to load config from ${path}`);
}

// Usage
const config = parseConfig('{"debug": true, "port": 3000}');
const data = processData('{"id": 1, "name": "Test"}');
const total = calculateTotal([10, 20, 30], 0.08);

console.log({ config, data, total });
