/**
 * String interning for memory optimization
 *
 * This module provides string interning to reduce memory usage
 * by reusing common string instances instead of creating duplicates.
 */

// WeakRef is available in ES2021+, provide fallback for older environments
declare global {
  interface WeakRef<T extends object> {
    deref(): T | undefined;
  }

  interface WeakRefConstructor {
    new <T extends object>(target: T): WeakRef<T>;
  }

  const WeakRef: WeakRefConstructor | undefined;
}

/**
 * String intern pool with weak references for garbage collection
 */
class StringInternPool {
  private pool = new Map<string, string>();
  private weakPool: Map<string, WeakRef<any>> | null = null;
  private strongRefs = new Set<string>();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  constructor() {
    // Use WeakRef if available
    if (typeof WeakRef !== "undefined") {
      this.weakPool = new Map();
    }
  }

  /**
   * Intern a string
   */
  intern(str: string): string {
    // Try weak pool first if available
    if (this.weakPool) {
      const weakRef = this.weakPool.get(str);
      if (weakRef) {
        const interned = weakRef.deref();
        if (interned !== undefined) {
          this.stats.hits++;
          return interned;
        } else {
          // Weak reference was garbage collected
          this.weakPool.delete(str);
          this.stats.evictions++;
        }
      }
    } else {
      // Fallback to regular map
      const cached = this.pool.get(str);
      if (cached) {
        this.stats.hits++;
        return cached;
      }
    }

    // Create new interned string
    this.stats.misses++;
    const interned = String(str); // Create a new string instance

    if (
      this.weakPool &&
      !this.isCommonString(str) &&
      typeof WeakRef !== "undefined"
    ) {
      // Use weak reference for non-common strings
      this.weakPool.set(str, new WeakRef(interned as any));
    } else {
      // Use strong reference for common strings or when WeakRef unavailable
      this.pool.set(str, interned);
      if (this.isCommonString(str)) {
        this.strongRefs.add(interned);
      }
    }

    return interned;
  }

  /**
   * Check if a string is common enough to keep a strong reference
   */
  private isCommonString(str: string): boolean {
    // Common error types
    const commonTypes = [
      "Error",
      "TypeError",
      "ReferenceError",
      "SyntaxError",
      "ValidationError",
      "NetworkError",
      "TimeoutError",
      "UnknownError",
      "StringError",
    ];

    // Common messages
    const commonMessages = [
      "Unknown error occurred",
      "An error occurred",
      "Operation failed",
      "Request failed",
      "Validation failed",
      "Network request failed",
      "Operation timed out",
    ];

    // Common sources
    const commonSources = ["unknown", "production", "minimal", "disabled"];

    return (
      commonTypes.includes(str) ||
      commonMessages.includes(str) ||
      commonSources.includes(str) ||
      str.length < 10 // Short strings are worth keeping
    );
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      poolSize: this.pool.size + (this.weakPool?.size || 0),
      strongRefCount: this.strongRefs.size,
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    };
  }

  /**
   * Clear the intern pool
   */
  clear(): void {
    this.pool.clear();
    this.weakPool?.clear();
    this.strongRefs.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }
}

/**
 * Global string intern pool
 */
const globalInternPool = new StringInternPool();

/**
 * Intern a string for reuse
 */
export function intern(str: string): string {
  return globalInternPool.intern(str);
}

/**
 * Intern common error properties
 */
export function internError(
  type: string,
  message: string,
  source: string
): {
  type: string;
  message: string;
  source: string;
} {
  return {
    type: intern(type),
    message: intern(message),
    source: intern(source),
  };
}

/**
 * Get intern pool statistics
 */
export function getInternStats() {
  return globalInternPool.getStats();
}

/**
 * Clear the intern pool
 */
export function clearInternPool(): void {
  globalInternPool.clear();
}

/**
 * Pre-intern common strings for better performance
 */
export function preinternCommonStrings(): void {
  // Common error types
  [
    "Error",
    "TypeError",
    "ReferenceError",
    "SyntaxError",
    "ValidationError",
    "NetworkError",
    "TimeoutError",
    "UnknownError",
    "StringError",
  ].forEach(intern);

  // Common sources
  ["unknown", "production", "minimal", "disabled"].forEach(intern);

  // Common messages
  ["Unknown error occurred", "An error occurred", "Operation failed"].forEach(
    intern
  );
}
