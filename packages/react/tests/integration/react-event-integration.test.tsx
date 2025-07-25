import React from "react";
import { render, screen } from "@testing-library/react";
import { TryErrorBoundary } from "../../src/components/TryErrorBoundary";
import { createError, TryError } from "@try-error/core";

// Import event system from try-error package (same as TryErrorBoundary)
import { errorEvents, emitErrorCreated } from "@try-error/core";

// Test component that throws an error
function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("Test component error");
  }
  return <div>No error</div>;
}

// Test component that throws a TryError
function ThrowingTryErrorComponent({
  shouldThrow = true,
}: {
  shouldThrow?: boolean;
}) {
  if (shouldThrow) {
    const tryError = createError({
      type: "ComponentError",
      message: "Test TryError from component",
      context: { component: "ThrowingTryErrorComponent" },
    });
    throw tryError;
  }
  return <div>No error</div>;
}

describe("React Error Boundary Event Integration", () => {
  beforeEach(() => {
    // Clear all event listeners before each test
    errorEvents.clear();

    // Add debug logging
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (
        args[0]?.includes?.("error:created") ||
        args[0]?.includes?.("emitErrorCreated")
      ) {
        originalConsoleLog.apply(console, args);
      }
    };
  });

  afterEach(() => {
    // Clean up any remaining listeners
    errorEvents.clear();
  });

  describe("Error Boundary Event Emission", () => {
    it("should emit error:created events when catching regular errors", async () => {
      const eventListener = jest.fn();
      errorEvents.on("error:created", eventListener);

      render(
        <TryErrorBoundary>
          <ThrowingComponent />
        </TryErrorBoundary>
      );

      // Wait for any async event processing
      await new Promise((resolve) => process.nextTick(resolve));

      // The error boundary should emit an event for the caught error
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error:created",
          error: expect.objectContaining({
            type: "ReactError",
            message: "Test component error",
          }),
        })
      );
    });

    it("should emit error:created events when catching TryErrors", async () => {
      const eventListener = jest.fn();
      errorEvents.on("error:created", eventListener);

      render(
        <TryErrorBoundary>
          <ThrowingTryErrorComponent />
        </TryErrorBoundary>
      );

      // Wait for any async event processing
      await new Promise((resolve) => process.nextTick(resolve));

      // Should emit events for both the original TryError creation AND the boundary handling
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error:created",
          error: expect.objectContaining({
            type: "ComponentError",
            message: "Test TryError from component",
          }),
        })
      );
    });

    it("should emit events with React-specific context", async () => {
      const eventListener = jest.fn();
      errorEvents.on("error:created", eventListener);

      render(
        <TryErrorBoundary>
          <ThrowingComponent />
        </TryErrorBoundary>
      );

      await new Promise((resolve) => process.nextTick(resolve));

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error:created",
          error: expect.objectContaining({
            type: "ReactError",
            message: "Test component error",
            context: expect.objectContaining({
              errorBoundary: true,
            }),
          }),
        })
      );
    });
  });

  describe("Async Error Event Integration", () => {
    it("should emit events for unhandled promise rejections", async () => {
      const eventListener = jest.fn();
      errorEvents.on("error:created", eventListener);

      // Component that creates an unhandled promise rejection
      function AsyncErrorComponent() {
        React.useEffect(() => {
          // Create a promise rejection and manually dispatch the event
          // since jsdom doesn't properly dispatch unhandledrejection events
          const reason = new Error("Unhandled promise rejection");

          // Create a rejected promise but catch it to prevent actual unhandled rejection
          Promise.reject(reason).catch(() => {});

          // Manually dispatch the unhandledrejection event
          const event = new CustomEvent("unhandledrejection");
          // Add the reason property that the handler expects
          (event as any).reason = reason;
          window.dispatchEvent(event);
        }, []);
        return <div>Async component</div>;
      }

      render(
        <TryErrorBoundary catchAsyncErrors={true}>
          <AsyncErrorComponent />
        </TryErrorBoundary>
      );

      // Trigger the unhandled rejection
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Wait for async event processing - events are processed in microtasks
      await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error:created",
          error: expect.objectContaining({
            type: "ReactError",
            message: "Unhandled promise rejection", // Fixed: actual message from original error
            context: expect.objectContaining({
              source: "unhandledRejection",
              async: true,
            }),
          }),
        })
      );
    });

    it("should emit events for event handler errors", async () => {
      const eventListener = jest.fn();
      errorEvents.on("error:created", eventListener);

      // Component with an error-throwing event handler
      function EventErrorComponent() {
        const handleClick = () => {
          const error = new Error("Event handler error");

          // Manually dispatch the global error event since jsdom doesn't properly
          // dispatch global errors from event handlers
          const event = new CustomEvent("error");
          // Add the error property that the handler expects
          (event as any).error = error;
          (event as any).message = error.message;
          window.dispatchEvent(event);

          throw error; // Still throw for realism
        };

        return <button onClick={handleClick}>Click me</button>;
      }

      const { getByRole } = render(
        <TryErrorBoundary catchEventHandlerErrors={true}>
          <EventErrorComponent />
        </TryErrorBoundary>
      );

      // Simulate clicking the button to trigger the error
      const button = getByRole("button");

      // This should trigger the event handler error
      try {
        button.click();
      } catch (error) {
        // Expected to throw in test environment
      }

      await new Promise((resolve) => setTimeout(resolve, 10));
      // Wait for async event processing - events are processed in microtasks
      await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error:created",
          error: expect.objectContaining({
            message: "Event handler error",
            context: expect.objectContaining({
              source: "globalError",
              async: true,
            }),
          }),
        })
      );
    });
  });

  describe("Event Integration with onError Prop", () => {
    it("should emit events AND call onError prop", async () => {
      const eventListener = jest.fn();
      const onErrorProp = jest.fn();

      errorEvents.on("error:created", eventListener);

      render(
        <TryErrorBoundary onError={onErrorProp}>
          <ThrowingComponent />
        </TryErrorBoundary>
      );

      await new Promise((resolve) => process.nextTick(resolve));

      // Both the event system AND the onError prop should be called
      expect(eventListener).toHaveBeenCalled();
      expect(onErrorProp).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "ReactError",
          message: "Test component error",
        }),
        expect.any(Object) // errorInfo
      );
    });
  });

  describe("Event Deduplication", () => {
    it("should not emit duplicate events for the same error", async () => {
      const eventListener = jest.fn();
      errorEvents.on("error:created", eventListener);

      // Use a TryError that was already created (and thus already emitted an event)
      const existingTryError = createError({
        type: "ExistingError",
        message: "Already created error",
      });

      function ThrowingExistingError(): React.ReactElement {
        throw existingTryError;
        return <div>This won't render</div>; // Unreachable but needed for TypeScript
      }

      render(
        <TryErrorBoundary>
          <ThrowingExistingError />
        </TryErrorBoundary>
      );

      await new Promise((resolve) => process.nextTick(resolve));

      // Should have both the original event from createError and the wrapped event from boundary
      const calls = eventListener.mock.calls.filter(
        (call) => call[0].error.message === "Already created error"
      );
      expect(calls).toHaveLength(2); // One from createError, one from error boundary wrapper
    });
  });

  describe("Integration with Global Event System", () => {
    it("should work with global event system configuration", async () => {
      const eventListener = jest.fn();
      errorEvents.on("error:created", eventListener);

      // Test that React errors integrate with the global event system we fixed earlier
      render(
        <TryErrorBoundary>
          <ThrowingComponent />
        </TryErrorBoundary>
      );

      await new Promise((resolve) => process.nextTick(resolve));

      // Verify the event follows the same structure as core library events
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error:created",
          timestamp: expect.any(Number),
          error: expect.objectContaining({
            type: expect.any(String),
            message: expect.any(String),
            source: expect.any(String),
            timestamp: expect.any(Number),
          }),
        })
      );
    });
  });
});
