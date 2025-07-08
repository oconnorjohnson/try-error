import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { createError, configure, getConfig, ConfigPresets } from "../../src";

// Import event system components
import { ErrorEventEmitter } from "../../src/events";

describe("Event System Reliability", () => {
  let originalConfig: any;
  let emitter: ErrorEventEmitter;

  beforeEach(() => {
    originalConfig = getConfig();
    configure(ConfigPresets.development());
    emitter = new ErrorEventEmitter();
  });

  afterEach(() => {
    configure(originalConfig);
    emitter.removeAllListeners();
    jest.clearAllMocks();
  });

  describe("Event Listener Memory Leaks", () => {
    it("should properly cleanup event listeners to prevent memory leaks", () => {
      const listeners: Array<() => void> = [];

      // Add many listeners
      for (let i = 0; i < 100; i++) {
        const listener = jest.fn();
        listeners.push(listener);
        emitter.on("error", listener);
      }

      // Verify listeners are added
      expect(emitter.listenerCount("error")).toBe(100);

      // Remove all listeners
      emitter.removeAllListeners("error");

      // Should have no listeners
      expect(emitter.listenerCount("error")).toBe(0);

      // Emit event to ensure no listeners are called
      emitter.emit("error", createError({ type: "Test", message: "Test" }));

      listeners.forEach((listener) => {
        expect(listener).not.toHaveBeenCalled();
      });
    });

    it("should handle removal of specific listeners", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      emitter.on("error", listener1);
      emitter.on("error", listener2);
      emitter.on("error", listener3);

      expect(emitter.listenerCount("error")).toBe(3);

      // Remove specific listener
      emitter.off("error", listener2);
      expect(emitter.listenerCount("error")).toBe(2);

      // Emit event
      const testError = createError({ type: "Test", message: "Test" });
      emitter.emit("error", testError);

      // Only remaining listeners should be called
      expect(listener1).toHaveBeenCalledWith(testError);
      expect(listener2).not.toHaveBeenCalled();
      expect(listener3).toHaveBeenCalledWith(testError);
    });

    it("should handle rapid add/remove cycles without memory leaks", () => {
      for (let cycle = 0; cycle < 50; cycle++) {
        const listeners: Array<() => void> = [];

        // Add listeners
        for (let i = 0; i < 20; i++) {
          const listener = jest.fn();
          listeners.push(listener);
          emitter.on("error", listener);
        }

        // Remove half of them
        for (let i = 0; i < 10; i++) {
          emitter.off("error", listeners[i]);
        }

        // Remove all remaining
        emitter.removeAllListeners("error");

        expect(emitter.listenerCount("error")).toBe(0);
      }

      // Should still work normally
      const finalListener = jest.fn();
      emitter.on("error", finalListener);

      const testError = createError({ type: "Final", message: "Final test" });
      emitter.emit("error", testError);

      expect(finalListener).toHaveBeenCalledWith(testError);
    });

    it("should handle once listeners properly", () => {
      const onceListener = jest.fn();
      const regularListener = jest.fn();

      emitter.once("error", onceListener);
      emitter.on("error", regularListener);

      expect(emitter.listenerCount("error")).toBe(2);

      // First emission
      const error1 = createError({ type: "Test1", message: "Test 1" });
      emitter.emit("error", error1);

      expect(onceListener).toHaveBeenCalledTimes(1);
      expect(regularListener).toHaveBeenCalledTimes(1);
      expect(emitter.listenerCount("error")).toBe(1); // once listener removed

      // Second emission
      const error2 = createError({ type: "Test2", message: "Test 2" });
      emitter.emit("error", error2);

      expect(onceListener).toHaveBeenCalledTimes(1); // Still only once
      expect(regularListener).toHaveBeenCalledTimes(2);
    });
  });

  describe("Event Emission Failures", () => {
    it("should handle listeners that throw errors", () => {
      const throwingListener = jest.fn(() => {
        throw new Error("Listener error");
      });
      const normalListener = jest.fn();

      emitter.on("error", throwingListener);
      emitter.on("error", normalListener);

      const testError = createError({ type: "Test", message: "Test" });

      // Should not throw when emitting
      expect(() => {
        emitter.emit("error", testError);
      }).not.toThrow();

      // Both listeners should be called despite the error
      expect(throwingListener).toHaveBeenCalledWith(testError);
      expect(normalListener).toHaveBeenCalledWith(testError);
    });

    it("should handle async listeners that reject", async () => {
      const rejectingListener = jest.fn(async () => {
        throw new Error("Async listener error");
      });
      const normalListener = jest.fn(async () => {
        return "success";
      });

      emitter.on("error", rejectingListener);
      emitter.on("error", normalListener);

      const testError = createError({ type: "Async", message: "Async test" });

      // Should not throw when emitting
      expect(() => {
        emitter.emit("error", testError);
      }).not.toThrow();

      // Allow async listeners to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(rejectingListener).toHaveBeenCalledWith(testError);
      expect(normalListener).toHaveBeenCalledWith(testError);
    });

    it("should handle listeners that modify the error object", () => {
      const modifyingListener = jest.fn((error) => {
        // Try to modify the error
        try {
          (error as any).modified = true;
        } catch (e) {
          // Might be readonly
        }
      });
      const readingListener = jest.fn();

      emitter.on("error", modifyingListener);
      emitter.on("error", readingListener);

      const testError = createError({ type: "Modify", message: "Modify test" });
      emitter.emit("error", testError);

      expect(modifyingListener).toHaveBeenCalledWith(testError);
      expect(readingListener).toHaveBeenCalledWith(testError);

      // Error should maintain its integrity
      expect(testError.type).toBe("Modify");
      expect(testError.message).toBe("Modify test");
    });

    it("should handle high-frequency event emissions", () => {
      const listener = jest.fn();
      emitter.on("error", listener);

      // Emit many events rapidly
      const errors: any[] = [];
      for (let i = 0; i < 1000; i++) {
        const error = createError({ type: "Rapid", message: `Error ${i}` });
        errors.push(error);
        emitter.emit("error", error);
      }

      // All events should be processed
      expect(listener).toHaveBeenCalledTimes(1000);

      // Verify order is maintained
      for (let i = 0; i < 1000; i++) {
        expect(listener).toHaveBeenNthCalledWith(i + 1, errors[i]);
      }
    });
  });

  describe("Event Queue Overflow", () => {
    it("should handle event queue overflow gracefully", () => {
      // Add a slow listener to create backpressure
      const slowListener = jest.fn((error) => {
        // Simulate slow processing
        const start = Date.now();
        while (Date.now() - start < 1) {
          /* busy wait */
        }
      });

      emitter.on("error", slowListener);

      // Emit many events rapidly to overflow queue
      const errors: any[] = [];
      for (let i = 0; i < 10000; i++) {
        const error = createError({ type: "Overflow", message: `Error ${i}` });
        errors.push(error);
        emitter.emit("error", error);
      }

      // Should not crash or lose events
      expect(slowListener).toHaveBeenCalledTimes(10000);
    });

    it("should maintain event order under high load", () => {
      const processedEvents: any[] = [];
      const orderListener = jest.fn((error) => {
        processedEvents.push(error);
      });

      emitter.on("error", orderListener);

      // Emit events with identifiable order
      const expectedOrder: any[] = [];
      for (let i = 0; i < 500; i++) {
        const error = createError({
          type: "Order",
          message: `Error ${i}`,
          context: { order: i },
        });
        expectedOrder.push(error);
        emitter.emit("error", error);
      }

      // Verify order is maintained
      expect(processedEvents).toHaveLength(500);
      processedEvents.forEach((error, index) => {
        expect(error.context?.order).toBe(index);
      });
    });

    it("should handle event emission from within event listeners", () => {
      const recursiveListener = jest.fn((error) => {
        if (error.context?.level < 3) {
          // Emit another event from within the listener
          const nextError = createError({
            type: "Recursive",
            message: `Recursive ${error.context?.level + 1}`,
            context: { level: (error.context?.level || 0) + 1 },
          });
          emitter.emit("error", nextError);
        }
      });

      emitter.on("error", recursiveListener);

      // Start the recursive chain
      const initialError = createError({
        type: "Recursive",
        message: "Recursive 0",
        context: { level: 0 },
      });
      emitter.emit("error", initialError);

      // Should handle recursive emissions (4 total: 0, 1, 2, 3)
      expect(recursiveListener).toHaveBeenCalledTimes(4);
    });
  });

  describe("Event Serialization", () => {
    it("should handle complex event data serialization", () => {
      const complexListener = jest.fn();
      emitter.on("error", complexListener);

      const complexError = createError({
        type: "Complex",
        message: "Complex error",
        context: {
          nested: {
            array: [1, 2, 3],
            object: { key: "value" },
            date: new Date(),
            regexp: /test/g,
          },
          circular: null as any,
        },
      });

      // Create circular reference
      complexError.context!.circular = complexError.context;

      emitter.emit("error", complexError);

      expect(complexListener).toHaveBeenCalledWith(complexError);

      // Should be able to access properties despite complexity
      expect(complexError.type).toBe("Complex");
      expect(complexError.context?.nested?.array).toEqual([1, 2, 3]);
    });

    it("should handle events with large payloads", () => {
      const largeListener = jest.fn();
      emitter.on("error", largeListener);

      const largeError = createError({
        type: "Large",
        message: "Large error",
        context: {
          largeData: new Array(10000).fill("large-data-item"),
          moreData: {
            nested: new Array(5000).fill({ key: "value", index: 0 }),
          },
        },
      });

      emitter.emit("error", largeError);

      expect(largeListener).toHaveBeenCalledWith(largeError);
      expect(largeError.context?.largeData).toHaveLength(10000);
    });

    it("should handle events with special JavaScript values", () => {
      const specialListener = jest.fn();
      emitter.on("error", specialListener);

      const specialError = createError({
        type: "Special",
        message: "Special values",
        context: {
          undefined: undefined,
          null: null,
          infinity: Infinity,
          negativeInfinity: -Infinity,
          nan: NaN,
          symbol: Symbol("test"),
          function: () => "test",
          bigint: BigInt(123),
          weakMap: new WeakMap(),
          set: new Set([1, 2, 3]),
          map: new Map([["key", "value"]]),
        },
      });

      emitter.emit("error", specialError);

      expect(specialListener).toHaveBeenCalledWith(specialError);
      expect(specialError.context?.set).toBeInstanceOf(Set);
      expect(specialError.context?.map).toBeInstanceOf(Map);
    });
  });

  describe("Event System Performance", () => {
    it("should handle concurrent event emissions", async () => {
      const concurrentListener = jest.fn();
      emitter.on("error", concurrentListener);

      // Emit events concurrently from multiple "threads"
      const promises = Array.from({ length: 50 }, async (_, i) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            for (let j = 0; j < 10; j++) {
              const error = createError({
                type: "Concurrent",
                message: `Thread ${i} Error ${j}`,
                context: { thread: i, error: j },
              });
              emitter.emit("error", error);
            }
            resolve();
          }, Math.random() * 10);
        });
      });

      await Promise.all(promises);

      // All events should be processed
      expect(concurrentListener).toHaveBeenCalledTimes(500);
    });

    it("should maintain performance with many listeners", () => {
      // Add many listeners
      const listeners: Array<jest.Mock> = [];
      for (let i = 0; i < 100; i++) {
        const listener = jest.fn();
        listeners.push(listener);
        emitter.on("error", listener);
      }

      const testError = createError({
        type: "Performance",
        message: "Performance test",
      });

      // Measure emission time
      const start = Date.now();
      emitter.emit("error", testError);
      const duration = Date.now() - start;

      // Should complete reasonably quickly
      expect(duration).toBeLessThan(100); // 100ms threshold

      // All listeners should be called
      listeners.forEach((listener) => {
        expect(listener).toHaveBeenCalledWith(testError);
      });
    });

    it("should handle listener removal during emission", () => {
      const listeners: Array<jest.Mock> = [];

      // Create listeners that remove themselves
      for (let i = 0; i < 10; i++) {
        const listener = jest.fn(() => {
          // Remove self during emission
          emitter.off("error", listener);
        });
        listeners.push(listener);
        emitter.on("error", listener);
      }

      const testError = createError({
        type: "SelfRemove",
        message: "Self remove test",
      });

      expect(() => {
        emitter.emit("error", testError);
      }).not.toThrow();

      // All listeners should have been called once
      listeners.forEach((listener) => {
        expect(listener).toHaveBeenCalledTimes(1);
      });

      // No listeners should remain
      expect(emitter.listenerCount("error")).toBe(0);
    });
  });

  describe("Event System Edge Cases", () => {
    it("should handle events with null/undefined payloads", () => {
      const nullListener = jest.fn();
      emitter.on("error", nullListener);

      // Emit with null
      emitter.emit("error", null as any);
      expect(nullListener).toHaveBeenCalledWith(null);

      // Emit with undefined
      emitter.emit("error", undefined as any);
      expect(nullListener).toHaveBeenCalledWith(undefined);
    });

    it("should handle events on non-existent event types", () => {
      const unknownListener = jest.fn();

      // Add listener for unknown event type
      emitter.on("unknown-event" as any, unknownListener);

      // Emit unknown event
      expect(() => {
        emitter.emit("unknown-event" as any, "test-data");
      }).not.toThrow();

      expect(unknownListener).toHaveBeenCalledWith("test-data");
    });

    it("should handle rapid listener modifications", () => {
      const dynamicListener = jest.fn();

      // Rapidly add and remove listeners
      for (let i = 0; i < 100; i++) {
        emitter.on("error", dynamicListener);
        emitter.off("error", dynamicListener);
        emitter.on("error", dynamicListener);
      }

      // Should still work normally
      const testError = createError({
        type: "Dynamic",
        message: "Dynamic test",
      });
      emitter.emit("error", testError);

      expect(dynamicListener).toHaveBeenCalledWith(testError);
    });
  });
});
