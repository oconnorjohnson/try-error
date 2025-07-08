import { createError, isTryError } from "../../src";
import {
  errorEvents,
  emitErrorCreated,
  emitErrorTransformed,
} from "../../src/events";

describe("Event System Reliability", () => {
  beforeEach(() => {
    // Clear all listeners before each test
    errorEvents.clear();
  });

  afterEach(() => {
    // Clean up after each test
    errorEvents.clear();
  });

  describe("Basic Event Emission", () => {
    it("should emit error:created events when errors are created", () => {
      const listener = jest.fn();
      errorEvents.on("error:created", listener);

      const error = createError({ type: "Test", message: "Test error" });

      // The event should be emitted automatically when creating errors
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error:created",
          error: expect.objectContaining({
            type: "Test",
            message: "Test error",
          }),
        })
      );
    });

    it("should emit error:transformed events", () => {
      const listener = jest.fn();
      errorEvents.on("error:transformed", listener);

      const original = createError({ type: "Original", message: "Original" });
      const transformed = createError({
        type: "Transformed",
        message: "Transformed",
      });

      emitErrorTransformed(original, transformed);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error:transformed",
          original,
          transformed,
        })
      );
    });
  });

  describe("Event Listener Management", () => {
    it("should handle multiple listeners", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      errorEvents.on("error:created", listener1);
      errorEvents.on("error:created", listener2);
      errorEvents.on("error:created", listener3);

      emitErrorCreated(createError({ type: "Test", message: "Test" }));

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      expect(listener3).toHaveBeenCalled();
    });

    it("should handle listener removal", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      errorEvents.on("error:created", listener1);
      errorEvents.on("error:created", listener2);

      // Remove one listener
      errorEvents.off("error:created", listener2);

      emitErrorCreated(createError({ type: "Test", message: "Test" }));

      expect(listener1).toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it("should handle listeners that throw errors", () => {
      const throwingListener = jest.fn(() => {
        throw new Error("Listener failed");
      });
      const normalListener = jest.fn();

      errorEvents.on("error:created", throwingListener);
      errorEvents.on("error:created", normalListener);

      // Should not throw and should call other listeners
      expect(() => {
        emitErrorCreated(createError({ type: "Test", message: "Test" }));
      }).not.toThrow();

      expect(throwingListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });
  });

  describe("Integration with Error Creation", () => {
    it("should automatically emit events during error creation", () => {
      const createdListener = jest.fn();
      errorEvents.on("error:created", createdListener);

      // Creating an error should automatically emit the event
      const error = createError({
        type: "AutoEmit",
        message: "Should auto-emit event",
        context: { test: true },
      });

      expect(isTryError(error)).toBe(true);
      expect(createdListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error:created",
          error: expect.objectContaining({
            type: "AutoEmit",
            message: "Should auto-emit event",
            context: { test: true },
          }),
        })
      );
    });
  });
});
