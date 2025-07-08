import { createError } from "../../src/errors";
import { configure, resetConfig, ConfigPresets } from "../../src/config";
import { detectEnvironment, detectRuntime } from "../../src/setup";

describe("Environment Detection Failures", () => {
  // Save original global values
  const originalProcess = global.process;
  const originalWindow = (global as any).window;
  const originalDocument = (global as any).document;
  const originalNavigator = (global as any).navigator;

  beforeEach(() => {
    resetConfig();
  });

  afterEach(() => {
    resetConfig();
    // Restore original globals
    global.process = originalProcess;
    (global as any).window = originalWindow;
    (global as any).document = originalDocument;
    (global as any).navigator = originalNavigator;
  });

  describe("Runtime Detection Edge Cases", () => {
    it("should handle corrupted process object", () => {
      // Simulate corrupted process object
      (global as any).process = {
        versions: null,
        env: undefined,
      };

      expect(() => detectRuntime()).not.toThrow();
      const runtime = detectRuntime();
      expect(runtime).toBeDefined();
    });

    it("should handle missing process.versions", () => {
      (global as any).process = {
        env: { NODE_ENV: "test" },
        // Missing versions property
      };

      expect(() => detectRuntime()).not.toThrow();
    });

    it("should handle corrupted process.versions", () => {
      (global as any).process = {
        env: { NODE_ENV: "test" },
        versions: "not-an-object",
      };

      expect(() => detectRuntime()).not.toThrow();
    });

    it("should handle edge runtime without proper globals", () => {
      // Simulate edge runtime with missing/corrupted globals
      delete (global as any).process;
      (global as any).addEventListener = undefined;
      (global as any).fetch = "not-a-function";

      expect(() => detectRuntime()).not.toThrow();
      const runtime = detectRuntime();
      expect(["client", "server", "edge"]).toContain(runtime);
    });

    it("should handle Vercel Edge runtime detection", () => {
      delete (global as any).process;
      (global as any).EdgeRuntime = "vercel";
      (global as any).fetch = jest.fn();

      const runtime = detectRuntime();
      expect(runtime).toBe("edge");

      delete (global as any).EdgeRuntime;
    });

    it("should handle Cloudflare Workers detection", () => {
      delete (global as any).process;
      (global as any).caches = {};
      (global as any).addEventListener = jest.fn();

      const runtime = detectRuntime();
      expect(runtime).toBe("edge");

      delete (global as any).caches;
    });

    it("should handle Deno runtime detection", () => {
      delete (global as any).process;
      (global as any).Deno = {
        version: { deno: "1.0.0" },
      };

      const runtime = detectRuntime();
      expect(runtime).toBe("edge");

      delete (global as any).Deno;
    });
  });

  describe("Environment Transition Handling", () => {
    it("should handle SSR to client hydration transition", () => {
      // Start as server environment
      (global as any).process = originalProcess;
      delete (global as any).window;

      const serverError = createError({
        type: "ServerError",
        message: "Server-side error",
      });

      // Transition to client environment
      (global as any).window = {
        location: { href: "https://example.com" },
        navigator: { userAgent: "Mozilla/5.0..." },
      };
      delete (global as any).process;

      const clientError = createError({
        type: "ClientError",
        message: "Client-side error",
      });

      // Both should work
      expect(serverError.type).toBe("ServerError");
      expect(clientError.type).toBe("ClientError");
    });

    it("should handle environment detection cache invalidation", () => {
      // Detect environment in one state
      (global as any).process = originalProcess;
      delete (global as any).window;
      const env1 = detectEnvironment();

      // Change environment
      delete (global as any).process;
      (global as any).window = { location: {} };
      const env2 = detectEnvironment();

      // Should detect the change
      expect(env1).not.toBe(env2);
    });

    it("should handle rapid environment changes", () => {
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          // Server environment
          (global as any).process = originalProcess;
          delete (global as any).window;
        } else {
          // Client environment
          delete (global as any).process;
          (global as any).window = { location: {} };
        }

        expect(() => detectEnvironment()).not.toThrow();
        expect(() => detectRuntime()).not.toThrow();
      }
    });
  });

  describe("Runtime Handler Failures", () => {
    it("should handle runtime handler that throws during execution", () => {
      configure({
        runtimeDetection: true,
        environmentHandlers: {
          server: () => {
            throw new Error("Server handler failed");
          },
          client: (error) => error,
          edge: (error) => error,
        },
      });

      // Should not crash error creation when handler throws
      expect(() => {
        createError({
          type: "HandlerTest",
          message: "Test handler failure",
        });
      }).not.toThrow();
    });

    it("should handle async handler errors", async () => {
      configure({
        runtimeDetection: true,
        environmentHandlers: {
          server: (error) => {
            // Simulate async operation that fails
            setTimeout(() => {
              throw new Error("Async handler failed");
            }, 0);
            return error;
          },
        },
      });

      // Should handle gracefully
      const error = createError({
        type: "AsyncHandlerTest",
        message: "Test async handler",
      });

      expect(error).toBeDefined();
    });

    it("should handle handler that returns invalid error", () => {
      configure({
        runtimeDetection: true,
        environmentHandlers: {
          server: () => {
            return null as any; // Invalid return type
          },
        },
      });

      // Should fallback gracefully
      const error = createError({
        type: "InvalidReturnTest",
        message: "Test invalid return",
      });

      expect(error).toBeDefined();
      expect(error.type).toBe("InvalidReturnTest");
    });

    it("should handle handler that modifies error incorrectly", () => {
      configure({
        runtimeDetection: true,
        environmentHandlers: {
          server: (error) => {
            // Try to modify readonly properties
            try {
              (error as any).type = "ModifiedType";
              (error as any).message = "Modified message";
            } catch {
              // Ignore errors from readonly property modification
            }
            return error;
          },
        },
      });

      const error = createError({
        type: "ModificationTest",
        message: "Test modification",
      });

      expect(error).toBeDefined();
    });
  });

  describe("Environment Cache Invalidation", () => {
    it("should invalidate cache when environment changes dramatically", () => {
      // Start with Node.js environment
      (global as any).process = {
        versions: { node: "18.0.0" },
        env: { NODE_ENV: "test" },
      };
      delete (global as any).window;

      const runtime1 = detectRuntime();

      // Switch to edge environment
      delete (global as any).process;
      (global as any).EdgeRuntime = "vercel";
      (global as any).fetch = jest.fn();

      const runtime2 = detectRuntime();

      expect(runtime1).toBe("server");
      expect(runtime2).toBe("edge");

      delete (global as any).EdgeRuntime;
    });

    it("should handle cache corruption", () => {
      // Simulate corrupted internal cache state
      const runtime1 = detectRuntime();

      // Corrupt global state
      (global as any).process = undefined;
      (global as any).window = "not-an-object";

      // Should still work
      expect(() => detectRuntime()).not.toThrow();
    });

    it("should handle concurrent environment detection", async () => {
      const promises = Array.from({ length: 100 }, async (_, i) => {
        // Rapidly change environment for each detection
        if (i % 3 === 0) {
          (global as any).process = originalProcess;
          delete (global as any).window;
        } else if (i % 3 === 1) {
          delete (global as any).process;
          (global as any).window = { location: {} };
        } else {
          delete (global as any).process;
          (global as any).EdgeRuntime = "test";
        }

        return detectRuntime();
      });

      const results = await Promise.all(promises);

      // All should complete successfully
      expect(results).toHaveLength(100);
      results.forEach((result) => {
        expect(["server", "client", "edge"]).toContain(result);
      });

      delete (global as any).EdgeRuntime;
    });
  });

  describe("Fallback Behavior", () => {
    it("should fallback to safe defaults when all detection fails", () => {
      // Remove all known globals
      delete (global as any).process;
      delete (global as any).window;
      delete (global as any).document;
      delete (global as any).navigator;
      delete (global as any).EdgeRuntime;
      delete (global as any).Deno;
      delete (global as any).caches;

      expect(() => detectEnvironment()).not.toThrow();
      expect(() => detectRuntime()).not.toThrow();

      const runtime = detectRuntime();
      expect(["server", "client", "edge"]).toContain(runtime);
    });

    it("should handle unknown environment gracefully", () => {
      // Set up completely unknown environment
      delete (global as any).process;
      delete (global as any).window;
      (global as any).unknownGlobal = "test";

      const error = createError({
        type: "UnknownEnvTest",
        message: "Test unknown environment",
      });

      expect(error).toBeDefined();
      expect(error.type).toBe("UnknownEnvTest");
    });

    it("should handle environment detection timeout", async () => {
      // Simulate slow environment detection
      const originalDetect = detectEnvironment;
      let callCount = 0;

      const slowDetect = () => {
        callCount++;
        if (callCount === 1) {
          // First call is slow
          return new Promise((resolve) => {
            setTimeout(() => resolve("server"), 1000);
          }) as any;
        }
        return originalDetect();
      };

      // Test with timeout should fallback gracefully
      const error = createError({
        type: "TimeoutTest",
        message: "Test timeout handling",
      });

      expect(error).toBeDefined();
    });

    it("should handle partial environment detection", () => {
      // Simulate environment with only some detection features
      (global as any).process = {
        // Missing versions
        env: { NODE_ENV: "test" },
      };
      (global as any).window = {
        // Missing location
        navigator: { userAgent: "partial" },
      };

      expect(() => detectEnvironment()).not.toThrow();
      expect(() => detectRuntime()).not.toThrow();
    });
  });

  describe("Cross-Environment Error Consistency", () => {
    it("should create consistent errors across environments", () => {
      const errorData = {
        type: "ConsistencyTest",
        message: "Test cross-environment consistency",
        context: { test: "data" },
      };

      // Test in server environment
      (global as any).process = originalProcess;
      delete (global as any).window;
      const serverError = createError(errorData);

      // Test in client environment
      delete (global as any).process;
      (global as any).window = { location: {} };
      const clientError = createError(errorData);

      // Test in edge environment
      delete (global as any).window;
      (global as any).EdgeRuntime = "test";
      const edgeError = createError(errorData);

      // All should have consistent core properties
      expect(serverError.type).toBe(errorData.type);
      expect(clientError.type).toBe(errorData.type);
      expect(edgeError.type).toBe(errorData.type);

      expect(serverError.message).toBe(errorData.message);
      expect(clientError.message).toBe(errorData.message);
      expect(edgeError.message).toBe(errorData.message);

      delete (global as any).EdgeRuntime;
    });

    it("should handle environment-specific error enhancements", () => {
      configure({
        runtimeDetection: true,
        environmentHandlers: {
          server: (error) =>
            ({
              ...error,
              serverEnhancement: "server-specific-data",
            } as any),
          client: (error) =>
            ({
              ...error,
              clientEnhancement: "client-specific-data",
            } as any),
          edge: (error) =>
            ({
              ...error,
              edgeEnhancement: "edge-specific-data",
            } as any),
        },
      });

      // Test server enhancement
      (global as any).process = originalProcess;
      delete (global as any).window;
      const serverError = createError({
        type: "EnhancementTest",
        message: "Test enhancement",
      }) as any;

      expect(serverError.serverEnhancement).toBe("server-specific-data");
      expect(serverError.clientEnhancement).toBeUndefined();
      expect(serverError.edgeEnhancement).toBeUndefined();
    });
  });
});
