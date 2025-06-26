import { describe, test, expect } from "@jest/globals";

describe("Modular imports", () => {
  test("sync-only module exports sync functions", async () => {
    const syncModule = await import("../src/sync-only");

    // Should have sync functions
    expect(typeof syncModule.trySync).toBe("function");
    expect(typeof syncModule.trySyncTuple).toBe("function");
    expect(typeof syncModule.tryCall).toBe("function");
    expect(typeof syncModule.unwrap).toBe("function");
    expect(typeof syncModule.isOk).toBe("function");
    expect(typeof syncModule.isErr).toBe("function");

    // Should have core functions
    expect(typeof syncModule.isTryError).toBe("function");
    expect(typeof syncModule.createError).toBe("function");
    expect(typeof syncModule.configure).toBe("function");

    // Should NOT have async functions (they shouldn't be imported)
    expect((syncModule as any).tryAsync).toBeUndefined();
    expect((syncModule as any).tryAsyncTuple).toBeUndefined();
    expect((syncModule as any).tryAwait).toBeUndefined();
  });

  test("async-only module exports async functions", async () => {
    const asyncModule = await import("../src/async-only");

    // Should have async functions
    expect(typeof asyncModule.tryAsync).toBe("function");
    expect(typeof asyncModule.tryAsyncTuple).toBe("function");
    expect(typeof asyncModule.tryAwait).toBe("function");
    expect(typeof asyncModule.withTimeout).toBe("function");
    expect(typeof asyncModule.retry).toBe("function");

    // Should have core functions
    expect(typeof asyncModule.isTryError).toBe("function");
    expect(typeof asyncModule.createError).toBe("function");
    expect(typeof asyncModule.configure).toBe("function");

    // Should NOT have sync-specific functions
    expect((asyncModule as any).trySync).toBeUndefined();
    expect((asyncModule as any).trySyncTuple).toBeUndefined();
    expect((asyncModule as any).tryCall).toBeUndefined();
  });

  test("core module exports only core functionality", async () => {
    const coreModule = await import("../src/core");

    // Should have core types and functions
    expect(typeof coreModule.isTryError).toBe("function");
    expect(typeof coreModule.createError).toBe("function");
    expect(typeof coreModule.fromThrown).toBe("function");
    expect(typeof coreModule.configure).toBe("function");
    expect(typeof coreModule.VERSION).toBe("string");
    expect(typeof coreModule.FEATURES).toBe("object");

    // Should NOT have sync or async specific functions
    expect((coreModule as any).trySync).toBeUndefined();
    expect((coreModule as any).tryAsync).toBeUndefined();
  });

  test("full module exports everything", async () => {
    const fullModule = await import("../src/index");

    // Should have everything
    expect(typeof fullModule.trySync).toBe("function");
    expect(typeof fullModule.tryAsync).toBe("function");
    expect(typeof fullModule.isTryError).toBe("function");
    expect(typeof fullModule.createError).toBe("function");
    expect(typeof fullModule.VERSION).toBe("string");
  });

  test("sync-only usage example", () => {
    // This would be how users import for sync-only usage
    const { trySync, isTryError } = require("../src/sync-only");

    const result = trySync(() => JSON.parse('{"test": true}'));
    expect(isTryError(result)).toBe(false);
    expect(result).toEqual({ test: true });

    const error = trySync(() => JSON.parse("invalid"));
    expect(isTryError(error)).toBe(true);
  });

  test("async-only usage example", async () => {
    // This would be how users import for async-only usage
    const { tryAsync, isTryError } = require("../src/async-only");

    const result = await tryAsync(async () => {
      return Promise.resolve({ test: true });
    });
    expect(isTryError(result)).toBe(false);
    expect(result).toEqual({ test: true });

    const error = await tryAsync(async () => {
      throw new Error("Test error");
    });
    expect(isTryError(error)).toBe(true);
  });
});
