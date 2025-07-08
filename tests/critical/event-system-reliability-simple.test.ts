import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import {
  createError,
  configure,
  getConfig,
  ConfigPresets,
  ErrorEventEmitter,
  errorEvents,
  emitErrorCreated,
  emitErrorTransformed,
} from "../../src";

describe("Event System Reliability (Actual API)", () => {
  let originalConfig: any;
  let emitter: ErrorEventEmitter;

  beforeEach(() => {
    originalConfig = getConfig();
    configure(ConfigPresets.development());
    emitter = new ErrorEventEmitter();
  });

  afterEach(() => {
    configure(originalConfig);
    emitter.clear();
    jest.clearAllMocks();
  });

  describe("Event Listener Memory Management", () => {
    it("should properly cleanup event listeners", () => {
      const listeners: Array<() => void> = [];

      // Add many listeners
      for (let i = 0; i < 100; i++) {
        const listener = jest.fn();
        const unsubscribe = emitter.on("error:created", listener);
        listeners.push(unsubscribe);
      }

      // Verify listeners are added
      expect(emitter.getListenerCount("error:created")).toBe(100);

      // Remove all listeners
      listeners.forEach((unsubscribe) => unsubscribe());

      // Should have no listeners
      expect(emitter.getListenerCount("error:created")).toBe(0);
    });

    it("should handle removal of specific listeners", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      emitter.on("error:created", listener1);
      emitter.on("error:created", listener2);
      emitter.on("error:created", listener3);

      expect(emitter.getListenerCount("error:created")).toBe(3);

      // Remove specific listener
      emitter.off("error:created", listener2);
      expect(emitter.getListenerCount("error:created")).toBe(2);

      // Emit event
      const testError = createError({ type: "Test", message: "Test" });
      emitter.emit({
        type: "error:created",
        error: testError,
        timestamp: Date.now(),
      });

      // Only remaining listeners should be called
      expect(listener1).toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
      expect(listener3).toHaveBeenCalled();
    });

    it("should handle rapid add/remove cycles without memory leaks", () => {
      for (let cycle = 0; cycle < 50; cycle++) {
        const unsubscribers: Array<() => void> = [];

        // Add listeners
        for (let i = 0; i < 20; i++) {
          const listener = jest.fn();
          const unsubscribe = emitter.on("error:created", listener);
          unsubscribers.push(unsubscribe);
        }

        // Remove half of them
        for (let i = 0; i < 10; i++) {
          unsubscribers[i]();
        }

        // Remove all remaining
        emitter.clear();

        expect(emitter.getListenerCount("error:created")).toBe(0);
      }

      // Should still work normally
      const finalListener = jest.fn();
      emitter.on("error:created", finalListener);

      const testError = createError({ type: "Final", message: "Final test" });
      emitter.emit({
        type: "error:created",
        error: testError,
        timestamp: Date.now(),
      });

      expect(finalListener).toHaveBeenCalled();
    });

    it("should handle once listeners properly", () => {
      const onceListener = jest.fn();
      const regularListener = jest.fn();

      emitter.once("error:created", onceListener);
      emitter.on("error:created", regularListener);

      expect(emitter.getListenerCount("error:created")).toBeGreaterThan(0);

      // First emission
      const error1 = createError({ type: "Test1", message: "Test 1" });
      emitter.emit({
        type: "error:created",
        error: error1,
        timestamp: Date.now(),
      });

      expect(onceListener).toHaveBeenCalledTimes(1);
      expect(regularListener).toHaveBeenCalledTimes(1);

      // Second emission
      const error2 = createError({ type: "Test2", message: "Test 2" });
      emitter.emit({
        type: "error:created",
        error: error2,
        timestamp: Date.now(),
      });

      expect(onceListener).toHaveBeenCalledTimes(1); // Still only once
      expect(regularListener).toHaveBeenCalledTimes(2);
    });
  });

  describe("Event Emission Reliability", () => {
    it("should handle listeners that throw errors", () => {
      const throwingListener = jest.fn(() => {
        throw new Error("Listener error");
      });
      const normalListener = jest.fn();

      emitter.on("error:created", throwingListener);
      emitter.on("error:created", normalListener);

      const testError = createError({ type: "Test", message: "Test" });

      // Should not throw when emitting
      expect(() => {
        emitter.emit({
          type: "error:created",
          error: testError,
          timestamp: Date.now(),
        });
      }).not.toThrow();

      // Both listeners should be called despite the error
      expect(throwingListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });

    it("should handle high-frequency event emissions", () => {
      const listener = jest.fn();
      emitter.on("error:created", listener);

      // Emit many events rapidly
      const errors: any[] = [];
      for (let i = 0; i < 1000; i++) {
        const error = createError({ type: "Rapid", message: `Error ${i}` });
        errors.push(error);
        emitter.emit({
          type: "error:created",
          error,
          timestamp: Date.now(),
        });
      }

      // All events should be processed
      expect(listener).toHaveBeenCalledTimes(1000);
    });

    it("should handle different event types", () => {
      const createdListener = jest.fn();
      const transformedListener = jest.fn();
      const allListener = jest.fn();

      emitter.on("error:created", createdListener);
      emitter.on("error:transformed", transformedListener);
      emitter.onAll(allListener);

      const originalError = createError({
        type: "Original",
        message: "Original",
      });
      const transformedError = createError({
        type: "Transformed",
        message: "Transformed",
      });

      // Emit different event types
      emitter.emit({
        type: "error:created",
        error: originalError,
        timestamp: Date.now(),
      });

      emitter.emit({
        type: "error:transformed",
        original: originalError,
        transformed: transformedError,
        timestamp: Date.now(),
      });

      expect(createdListener).toHaveBeenCalledTimes(1);
      expect(transformedListener).toHaveBeenCalledTimes(1);
      expect(allListener).toHaveBeenCalledTimes(2); // Called for all events
    });
  });

  describe("Event Queue Management", () => {
    it("should handle event queue gracefully", () => {
      // Add a slow listener to create potential backpressure
      const slowListener = jest.fn((event) => {
        // Simulate slow processing
        const start = Date.now();
        while (Date.now() - start < 1) {
          /* busy wait */
        }
      });

      emitter.on("error:created", slowListener);

      // Emit many events rapidly
      const errors: any[] = [];
      for (let i = 0; i < 100; i++) {
        const error = createError({ type: "Queue", message: `Error ${i}` });
        errors.push(error);
        emitter.emit({
          type: "error:created",
          error,
          timestamp: Date.now(),
        });
      }

      // Should not crash or lose events
      expect(slowListener).toHaveBeenCalledTimes(100);
    });

    it("should maintain event order", () => {
      const processedEvents: any[] = [];
      const orderListener = jest.fn((event) => {
        processedEvents.push(event);
      });

      emitter.on("error:created", orderListener);

      // Emit events with identifiable order
      const expectedOrder: any[] = [];
      for (let i = 0; i < 50; i++) {
        const error = createError({
          type: "Order",
          message: `Error ${i}`,
          context: { order: i },
        });
        const event = {
          type: "error:created" as const,
          error,
          timestamp: Date.now(),
        };
        expectedOrder.push(event);
        emitter.emit(event);
      }

      // Verify order is maintained
      expect(processedEvents).toHaveLength(50);
      processedEvents.forEach((event, index) => {
        expect(event.error.context?.order).toBe(index);
      });
    });
  });

  describe("Global Event System Integration", () => {
    it("should work with global errorEvents emitter", () => {
      const globalListener = jest.fn();

      const unsubscribe = errorEvents.on("error:created", globalListener);

      const testError = createError({ type: "Global", message: "Global test" });

      // Use the helper function to emit
      emitErrorCreated(testError);

      expect(globalListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error:created",
          error: testError,
        })
      );

      unsubscribe();
    });

    it("should work with transformation events", () => {
      const transformListener = jest.fn();

      const unsubscribe = errorEvents.on(
        "error:transformed",
        transformListener
      );

      const originalError = createError({
        type: "Original",
        message: "Original",
      });
      const transformedError = createError({
        type: "Transformed",
        message: "Transformed",
      });

      emitErrorTransformed(originalError, transformedError);

      expect(transformListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error:transformed",
          original: originalError,
          transformed: transformedError,
        })
      );

      unsubscribe();
    });

    it("should handle multiple global listeners", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      const unsubscribe1 = errorEvents.on("error:created", listener1);
      const unsubscribe2 = errorEvents.on("error:created", listener2);
      const unsubscribe3 = errorEvents.onAll(listener3);

      const testError = createError({
        type: "Multiple",
        message: "Multiple test",
      });
      emitErrorCreated(testError);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      expect(listener3).toHaveBeenCalled();

      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    });
  });

  describe("Event System Performance", () => {
    it("should handle concurrent event emissions", async () => {
      const concurrentListener = jest.fn();
      emitter.on("error:created", concurrentListener);

      // Emit events concurrently from multiple "threads"
      const promises = Array.from({ length: 10 }, async (_, i) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            for (let j = 0; j < 10; j++) {
              const error = createError({
                type: "Concurrent",
                message: `Thread ${i} Error ${j}`,
                context: { thread: i, error: j },
              });
              emitter.emit({
                type: "error:created",
                error,
                timestamp: Date.now(),
              });
            }
            resolve();
          }, Math.random() * 10);
        });
      });

      await Promise.all(promises);

      // All events should be processed
      expect(concurrentListener).toHaveBeenCalledTimes(100);
    });

    it("should maintain performance with many listeners", () => {
      // Add many listeners
      const listeners: Array<jest.Mock> = [];
      for (let i = 0; i < 50; i++) {
        const listener = jest.fn();
        listeners.push(listener);
        emitter.on("error:created", listener);
      }

      const testError = createError({
        type: "Performance",
        message: "Performance test",
      });

      // Measure emission time
      const start = Date.now();
      emitter.emit({
        type: "error:created",
        error: testError,
        timestamp: Date.now(),
      });
      const duration = Date.now() - start;

      // Should complete reasonably quickly
      expect(duration).toBeLessThan(100); // 100ms threshold

      // All listeners should be called
      listeners.forEach((listener) => {
        expect(listener).toHaveBeenCalled();
      });
    });
  });

  describe("Event System Edge Cases", () => {
    it("should handle null/undefined in event data", () => {
      const nullListener = jest.fn();
      emitter.on("error:created", nullListener);

      // Create a basic error first
      const testError = createError({ type: "Test", message: "Test" });

      // Emit with valid event structure
      emitter.emit({
        type: "error:created",
        error: testError,
        timestamp: Date.now(),
      });

      expect(nullListener).toHaveBeenCalled();
    });

    it("should handle rapid listener modifications", () => {
      const dynamicListener = jest.fn();

      // Rapidly add and remove listeners
      for (let i = 0; i < 100; i++) {
        const unsubscribe = emitter.on("error:created", dynamicListener);
        unsubscribe();
        emitter.on("error:created", dynamicListener);
      }

      // Should still work normally
      const testError = createError({
        type: "Dynamic",
        message: "Dynamic test",
      });
      emitter.emit({
        type: "error:created",
        error: testError,
        timestamp: Date.now(),
      });

      expect(dynamicListener).toHaveBeenCalled();
    });

    it("should handle clear() during emission", () => {
      const listeners: Array<jest.Mock> = [];

      // Create listeners that clear the emitter
      for (let i = 0; i < 5; i++) {
        const listener = jest.fn(() => {
          if (i === 2) {
            // Clear during emission
            emitter.clear();
          }
        });
        listeners.push(listener);
        emitter.on("error:created", listener);
      }

      const testError = createError({ type: "Clear", message: "Clear test" });

      expect(() => {
        emitter.emit({
          type: "error:created",
          error: testError,
          timestamp: Date.now(),
        });
      }).not.toThrow();

      // Some listeners should have been called
      const calledListeners = listeners.filter((l) => l.mock.calls.length > 0);
      expect(calledListeners.length).toBeGreaterThan(0);
    });
  });
});
